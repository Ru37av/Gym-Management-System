const { query } = require('./util/hasura');
const { fastSms } = require('./util/fast-sms');
const { shortenUrl } = require('./util/rebrandly');

const trainers_numbers = process.env.TRAINERS_NUMBERS;

exports.handler = async ({ body, queryStringParameters }, context) => {
  const { user } = context.clientContext;
  const isLoggedIn = user && user.app_metadata && user.app_metadata.roles;
  const roles = isLoggedIn ? user.app_metadata.roles : [];

  if (!isLoggedIn || !roles.includes('admin')) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  const { id } = queryStringParameters;
  const { end_date, pending_fee } = JSON.parse(body);
  
  console.log(JSON.parse(body))
  const response = await query({
      query: `
        mutation UpdateEndDate($id: Int!, $end_date: String!, $pending_fee: Int!) {
              update_members(where: { id:{ _eq:$id }}, _set: { end_date: $end_date, pending_fee: $pending_fee }) {
                    returning {
                        id,
                        end_date,
                        pending_fee,
                        mobile,
                        name
                    }
              }
        }
      `,
       variables: { id, end_date, pending_fee }
    });
    
    console.log("preparing to send message...")
    const trainers_message = 'Member #{name}# renewed #{var}#';
    const members_message = 'Your gym membership renewal is successful #{var}#'
    const { mobile, name } = response.update_members.returning;
    
    try {
        console.log("sending trainer message");
        console.log('mobile', trainers_numbers);
//        const trainerUrl = await shortenUrl(`https://morwadi-health-club.netlify.app/profile/?id=${id}`);
//        fastSms({
//            message: trainers_message.replace("#{var}#", trainerUrl).replace("#{name}#", name), 
//            numbers: trainers_numbers
//        })
        console.log("trainer message sent successfully");
    } catch(e) {
        console.log("error while sending message to trainer", e);
    }
    
    try {
        console.log("sending member message");
        const memberUrl = await shortenUrl(`https://morwadi-health-club.netlify.app/about/?id=${id}`);
        console.log('mobile', mobile);
//        fastSms({
//            message: members_message.replace("#{var}#", memberUrl), 
//            numbers: mobile
//        })    
        console.log("member message sent successfully");
    } catch(e) {
        console.log("error while sending member message", e);
    }
  
  console.log("messages sent successfully");

    
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
};
