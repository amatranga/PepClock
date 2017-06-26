const InviteWorker = require('../../workers/send.invites');
const RecipientWorker = require('../../workers/sendRecipientLink');

module.exports.sendInvites = (req, res) => {
  new InviteWorker((message) => {
    console.log(message);
    res.status(200).send('workin');
  });
};

module.exports.sendRecipientLinks = (req, res) => {
  const worker = new RecipientWorker();

  let callback = (err, message) => {
    if (err) {
      if (err === 'No events to send') {
        console.log('done with no errors');
        return;
      }

      if (err === 'email address empty' || err === 'invalid email address') {
        console.log(err);
        worker.work(callback);
        return;
      }

      console.log(err);
      return;
    }

    console.log('sent invitiation');
    worker.work(callback);
  };
  res.status(200).send('working');
  worker.work(callback);
};
