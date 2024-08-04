const { query } = require('./util/hasura');
const { fastSms } = require('./util/fast-sms');
const { shortenUrl } = require('./util/rebrandly');

exports.handler = async ({ queryStringParameters }, context) => {
  const trainers_numbers = process.env.TRAINERS_NUMBERS;
  const { id } = queryStringParameters;

  const { user } = context.clientContext;
  const isLoggedIn = user && user.app_metadata && user.app_metadata.roles;
  const roles = isLoggedIn ? user.app_metadata.roles : [];

  if (!isLoggedIn || !roles.includes('admin')) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  const response = await query({
      query: `
        mutation DeleteMember($id: Int!) {
              delete_members(where: { id:{ _eq:$id }}) {
                    returning {
                        id,
                        name,
                        mobile,
                        pending_fee
                    }
              }
        }
      `,
       variables: { id }
    });
    
    const { name, mobile, pending_fee } = response.delete_members.returning[0];
    const trainers_message = `Membership of #{name}# is cancelled (${pending_fee}Rs)`;
    const members_message = 'Your gym membership has been cancelled!';
    console.log("sending messages...");
    try { 
        console.log("sending trainer message");
        const trainerUrl = await shortenUrl(`https://morwadi-health-club.netlify.app/profile/?id=${id}`);
//        fastSms({
//            message: trainers_message.replace("#{var}#", trainerUrl).replace("#{name}#", name), 
//            numbers: trainers_numbers
//        })
        console.log("trainer message sent successfully");
    } catch(e) {
        console.log("error while sending trainer message", e);
    }
    
    try { 
        console.log("sending member message");
        const memberUrl = await shortenUrl(`https://morwadi-health-club.netlify.app/about/?id=${id}`);
//        fastSms({
//            message: members_message.replace("#{var}#", memberUrl), 
//            numbers: mobile
//        })
        console.log("member message sent successfully");
    } catch(e) {
        console.log("error while sending member message", e);
    }
    
    console.log("messages sent successfully...");
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
};
