const { query } = require('./util/hasura');

exports.handler = async ({ queryStringParameters }) => {
  const { id } = queryStringParameters;

  const response = await query({
      query: `
        query GetMember($id: Int!) {
          members(where: { id: { _eq: $id }}) {
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
       variables: { id }
    });
  
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    };
};
