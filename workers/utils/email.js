require('dotenv').config();
const axios = require('axios');

exports.sendToRecipient = (link, email, cb) => {
  axios({
    method: 'POST',
    url: 'https://api:' + process.env.MAILGUN_API_KEY + '@api.mailgun.net/v3/app6ac6b571b02e4efcbbba7f891d5131b0.mailgun.org/messages',
    params: {
      from: 'Josh <josh@app6ac6b571b02e4efcbbba7f891d5131b0.mailgun.org>',
      to: email,
      subject: 'PepClock tolls for Thee!',
      text: 'You have Pep over at PepClock! \n' + link
    }
  })
  .then(response => cb(null, response))
  .catch(err => cb(err, null));
};

exports.batchSendInvitations = (recipientVariable, emails, cb) => {
  axios({
    method: 'POST',
    url: 'https://api:' + process.env.MAILGUN_API_KEY + '@api.mailgun.net/v3/app6ac6b571b02e4efcbbba7f891d5131b0.mailgun.org/messages',
    params: {
      from: 'Josh <josh@app6ac6b571b02e4efcbbba7f891d5131b0.mailgun.org>',
      to: emails,
      'recipient-variables': recipientVariable,
      subject: 'Contribute some Pep to your Friend',
      text: 'Your friends are building love. Join in over at PepClock:\n%recipient.link%'
    }
  })
  .then(response => cb())
  .catch(response => cb('ERROR!'));
};

exports.sendTwoFactorCode = (code, email, cb) => {
  axios({
    method: 'POST',
    url: 'https://api:' + process.env.MAILGUN_API_KEY + '@api.mailgun.net/v3/app6ac6b571b02e4efcbbba7f891d5131b0.mailgun.org/messages',
    params: {
      from: 'Alex <alex@app6ac6b571b02e4efcbbba7f891d5131b0.mailgun.org>',
      to: emails,
      'recipient-variables': code,
      subject: 'Your PepClock Two-Factor Authentication Code',
      text: 'Here is your PepClock Two-Factor Authentication Code: \n' + code
    }
  })
  .then(response => cb(null, response))
  .catch(err => cb(err, null));
};


// for testing workers
exports.fakeSend = (link, email, cb) => {
  console.log('link ==>', link);
  console.log('email ==>', email);
  setTimeout(() => { cb(); }, 500);
};



