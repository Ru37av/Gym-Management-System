const { query } = require('./util/hasura');

exports.handler = async (event, context) => {
  const { user } = context.clientContext;
  const isLoggedIn = user && user.app_metadata && user.app_metadata.roles;
  const roles = isLoggedIn ? user.app_metadata.roles : [];

  if (!isLoggedIn || !roles.includes('admin')) {
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
              id
        }
      }
    `,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(members),
  };
};