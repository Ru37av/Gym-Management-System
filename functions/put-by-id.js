const { query } = require('./util/hasura');

exports.handler = async ({ queryStringParameters, body }, context) => {
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
  const {
    name,
    mobile,
    address,
    pending_fee,
    image_url
  } = JSON.parse(body);
  
  const response = await query({
      query: `
        mutation UpdateMember($id: Int!, $name: String!, $mobile: String!, $address: String!, $image_url: String!, $pending_fee: Int!) {
              update_members(where: { id:{ _eq:$id }}, _set: { name: $name, mobile: $mobile, address: $address, image_url: $image_url, pending_fee: $pending_fee}) {
                    returning {
                        id
                    }
              }
        }
      `,
       variables: { id, name, mobile, address, image_url, pending_fee}
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
};
