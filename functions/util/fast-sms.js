const axios = require('axios');

function fastSms({ message, numbers }) {
        axios({
            url: 'https://www.fast2sms.com/dev/bulkV2',
            method: 'post',
            headers: {
                'Authorization': process.env.FAST2SMS_API_KEY,
                'Content-Type': 'application/json'
            },
            data: {
                route: "v3",
                sender_id: process.env.FAST2SMS_SENDER_ID,
                message,
                language: "english",
                flash: 0,
                numbers
            }
         })
         .then(response => {
            if(process.env.LOG_LEVEL === 'debug') {
                console.log(response);
            }
         }) 
         .catch(err => {
            console.log(err);
         });    
}

exports.fastSms = fastSms;


