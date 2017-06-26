require('dotenv').config();
const axios = require('axios');

const url = 'https://api:' + process.env.MAILGUN_API_KEY + '@api.mailgun.net/v3/' + process.env.MAILGUN_SENDING_DOMAIN + '/messages';
const from = 'PepClock <PepClock@' + process.env.MAILGUN_SENDING_DOMAIN + '>';
const appURL = process.env.LINK_DOMAIN;

exports.sendToRecipient = (link, email, cb) => {
  axios({
    method: 'POST',
    url: url,
    params: {
      from: from,
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
    url: url,
    params: {
      from: from,
      to: emails,
      'recipient-variables': recipientVariable,
      subject: 'Contribute some Pep to your Friend',
      text: 'Your friends are building love. Join in over at PepClock:\n%recipient.link%'
    }
  })
  .then(response => cb())
  .catch(response => cb('ERROR!'));
};

exports.batchSendOpenNotification = (eventId, emails, cb) => {
  const link = appURL + '/events/' + eventId;
  axios({
    method: 'POST',
    url: url,
    params: {
      from: from,
      to: emails,
      subject: 'Your PepClock event was just opened',
      text: 'The event you contributed to was viewed. Join in over at PepClock: ' + link
    }
  })
  .then(response => cb(response))
  .catch(response => cb(response));
};

exports.sendTwoFactorCode = (code, email, cb) => {

  axios({
    method: 'POST',
    url: url,
    params: {
      from: from,
      to: email,
      subject: 'Your PepClock Two-Factor Authentication Code',
      text: 'Here is your PepClock Two-Factor Authentication Code: \n' + code
    }
  })
  .then(response => cb(null, response))
  .catch(err => cb(err, null));
};

exports.validateEmail = (email, cb) => {
  axios({
    method: 'GET',
    url: 'https://api.mailgun.net/v3/address/validate',
    params: {
      api_key: process.env.MAILGUN_PUBLIC_KEY,
      address: email
    }
  })
    .then((response) => {
      cb(response.data.is_valid);
    })
    .catch((err) => {
      cb(err, 'error');
    });
};

// for testing workers
exports.fakeSend = (link, email, cb) => {
  console.log('link ==>', link);
  console.log('email ==>', email);
  setTimeout(() => { cb(); }, 500);
};

