const email = require('../workers/utils/email');
const models = require('../db/models');

const extractContributorEmail = (contributor) => {
  return contributor.relations.user.attributes.email;
};

const getEventContributors = (eventId, cb) => {
  models.Contributor.where({event_id: eventId}).fetchAll({
    withRelated: ['user']
  })
    .then(({ models }) => {
      if (models) {
        return models.map(extractContributorEmail);
      }
    })
    .then(emailList => cb(emailList))
    .catch(err => console.log(err));
};

module.exports = getEventContributors;
