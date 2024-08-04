const { query } = require('./util/hasura');

exports.handler = async ({ queryStringParameters }, context) => {
  const { user } = context.clientContext;
  const isLoggedIn = user && user.app_metadata && user.app_metadata.roles;
  const roles = isLoggedIn ? user.app_metadata.roles : [];

  if (!isLoggedIn || !roles.includes('admin')) {
    return {
      statusCode: 401,
      body: 'Unauthorized',
    };
  }

  const { name } = queryStringParameters;

  const response = await query({
      query: `
        query GetMember($name: String!) {
          members(where: { name: { _iregex: $name }}) {
                name, 
                mobile,
                address,
                image_url, 
                end_date,
                start_date,
                id
          }
        }
      `,
       variables: { name }
    });
  
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
};
