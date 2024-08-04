const { query } = require('./util/hasura');
const { fastSms } = require('./util/fast-sms');
const { shortenUrl } = require('./util/rebrandly');

const axios = require('axios'); 
const moment = require('moment');

const templates = {
    "fees_due": {
        members_message: 'Your gym fee is due today #{var}#',
        trainers_message: 'Fee for #{name}# is due today #{var}#'
    },
    "termination": {
        trainers_message: 'Membership of #{name}# is cancelled (#{fee}#Rs)',
        members_message: 'Your gym membership has been cancelled!'        
    }
}

const trainers_numbers = process.env.TRAINERS_NUMBERS;
const due_members = [];
const terminated_members = [];

exports.handler = async ({ queryStringParameters }, context) => {
  const { header } = queryStringParameters;
  if (header !== '90a1c4cd-0e31-4cc2-a703-2b00eb285992') {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  const { members } = await query({
    query: `
      query {
        members {
          name, 
              mobile,
              address,
              image_url, 
              end_date,
              start_date,
              pending_fee,
              id
        }
      }
    `,
  });

  
  const MEMBERSHIP_CANCELLATION_PERIOD = 8;
  
  const today = new Date().toDateString();
  console.log("sending messages...");
  for(const member of members) {
       const { name, id, end_date, mobile, pending_fee } = member;
       const end_date_converted = new Date(end_date).toDateString();
       
       const pastDate = moment(end_date);
       const currentDate = moment();
       if(today === end_date_converted) {
            const { trainers_message, members_message } = templates["fees_due"];
            console.log("Fees due for member =", name);
            try {
                console.log('sending trainer message');
                const trainerUrl = await shortenUrl(`https://morwadi-health-club.netlify.app/profile/?id=${id}`); 
//                fastSms({
//                    message: trainers_message.replace("#{var}#", trainerUrl).replace("#{name}#", name), 
//                    numbers: trainers_numbers
//                })
                console.log('trainer message sent successfully');
            } catch(e) {
                console.log("error while sending trainer message", e);
            }
            
            try {
                console.log("sending member message");
                const memberUrl = await shortenUrl(`https://morwadi-health-club.netlify.app/about/?id=${id}`);
//                fastSms({
//                    message: members_message.replace("#{var}#", memberUrl), 
//                    numbers: mobile
//                })
                console.log("member message sent");
            } catch(e) {
                console.log("error while sending member message", e);
            }
            
       } else if(currentDate.diff(pastDate, 'days') > MEMBERSHIP_CANCELLATION_PERIOD) {
            console.log("Terminating member =", name);
            const { trainers_message, members_message } = templates["termination"];     
//            fastSms({
//                message: trainers_message.replace("#{name}#", name).replace("#{fee}#", pending_fee), 
//                numbers: trainers_numbers
//            })
//            fastSms({
//                message: members_message, 
//                numbers: mobile
//            })
            
           try {
                console.log("terminating user with id= ", id);
                const mes = await deleteById(id);
                console.log(mes);
           } catch(e) {
                console.log("error while deleting user", e);
           }
       }
  }
  
  console.log("messages sent successfully...");
  return {
    statusCode: 200,
    body: 'ok',
  };
};

async function deleteById(id) {
    try {
      const response = await query({
          query: `
            mutation DeleteMember($id: Int!) {
                  delete_members(where: { id:{ _eq:$id }}) {
                        returning {
                            id
                        }
                  }
            }
          `,
           variables: { id }
        });   
        return "Member removed successfully...";
    } catch(e) {
        return "Failed to remove member";
    }
}

