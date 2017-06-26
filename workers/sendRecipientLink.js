require('dotenv').config();
const models = require('../db/models');
const email = require('./utils/email');

class sendRecipientLink {
  constructor() {
    this.event = null;
  }

  work (cb) {
    this.getEventsToDeliver((err, data) => {
      if (err) {
        cb(err);
      } else {
        this.sendRecipientEmail(data, (err, data) => {
          if (err) {
            cb(err);
          } else {
            this.updateEventStatus('sent', (err, data) => {
              cb(err, data);
            });
          }
        });
      }
    });
  }

  getEventsToDeliver (cb) {
    models.Event
    .where('delivery_time', '<', 'now()')
    .where({status: 'not sent'})
    .fetch({withRelated: ['recipient']})
        .then(model => {
          if (model) {
            this.event = model;
            const { id: eventId, title } = model.attributes;
            const { first_name: firstName, last_name: lastName, email, id: inviteId } = model.relations.recipient.attributes;

            const result = {
              inviteId,
              eventId,
              title,
              firstName,
              lastName,
              email
            };

            cb(null, result);
          } else {
            cb('No events to send', null);
          }
        });
  }

  sendRecipientEmail (recipient, cb) {
    this.validateEmail(recipient.email, (mess, err) => {
      if (err) {
        cb(err);
      } else {
        const link = `${recipient.title}: ${process.env.LINK_DOMAIN}/events/${recipient.eventId}?recipient=${recipient.inviteId}`;
        email.sendToRecipient(link, recipient.email, cb);
      }
    });
  }

  validateEmail (address, cb) {
    if (address.length) {
      email.validateEmail(address, (validation, err) => {
        if (err) {
          this.updateEventStatus('error-sending', () => {
            cb(err);
          });
        } else {
          if (!validation) {
            this.updateEventStatus('invalid-email', () => {
              cb(null, 'invalid email address');
            });
          } else {
            cb(validation, null);
          }
        }
      });
    } else {
      this.updateEventStatus('invalid-email', () => {
        cb(null, 'email address empty');
      });
    }
  }

  updateEventStatus (status, cb) {
    this.event.save({status: status}, {method: 'update'})
      .then(response => {
        cb(null, response);
        return null;
      })
      .catch(err => cb(err, null));
  }
}

module.exports = sendRecipientLink;
