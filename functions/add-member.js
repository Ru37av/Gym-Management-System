const { query } = require('./util/hasura');
const { fastSms } = require('./util/fast-sms');
const { shortenUrl } = require('./util/rebrandly');


exports.handler = async (event, context) => {
  const trainers_numbers = process.env.TRAINERS_NUMBERS;
  const { name, image_url, mobile, address, end_date, pending_fee } = JSON.parse(event.body);
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
      mutation CreateMember($name: String!, $mobile: String!, $address: String!, $image_url: String!, $end_date: String!, $pending_fee: Int!) {
        insert_members_one(object: {name: $name, mobile: $mobile, address: $address, image_url: $image_url, end_date: $end_date, pending_fee: $pending_fee}) {
          name, 
          mobile,
          address,
          image_url, 
          end_date,
          start_date,
          id,
          pending_fee
        }
      }
    `,
    variables: { name, mobile, address, image_url, end_date, pending_fee},
  })
    
    console.log("preparing to send message...")
    const { id } = response.insert_members_one
    const trainers_message = 'Member #{name}# added #{var}#';
    const members_message = 'Your gym registration is successful #{var}#'
    
    try {
        console.log("sending trainer message");
        const trainerUrl = await shortenUrl(`https://morwadi-health-club.netlify.app/profile/?id=${id}`);
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
