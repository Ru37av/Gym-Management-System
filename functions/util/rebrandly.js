const axios = require('axios');

function shortenUrl(url) {
    return axios({
        url: `https://api.rebrandly.com/v1/links/new?destination=${url}`,
        method: 'get',
        headers: {
            'apiKey': process.env.REBRANDLY_API_KEY,
            'Content-Type': 'application/json'
        }
     })
     .then(response => {
        if(process.env.LOG_LEVEL === 'debug') {
            console.log(response);
        }
        return response.data.shortURL;
     }) 
     .catch(err => {
        console.log(err);
     });
}

exports.shortenUrl = shortenUrl;


