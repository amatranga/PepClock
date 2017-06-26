const models = require('../../models');

exports.seed = function (knex, Promise) {

  return models.Profile.where({ email: 'twoFactor@domain.com' }).fetch()
    .then((profile) => {
      if (profile) {
        throw profile;
      }
      return models.Profile.forge({
        first: 'Two',
        last: 'Factor',
        display: 'TwoFactor',
        email: 'twoFactor@domain.com',
        two_factor_enabled: 2
      }).save();
    })
    .error(err => {
      console.error('ERROR: failed to create profile');
      throw err;
    })
    .then((profile) => {
      return models.Auth.forge({
        type: 'local',
        password: 'twoFactor',
        profile_id: profile.get('id')
      }).save();
    })
    .error(err => {
      console.error('ERROR: failed to create auth');
    })
    .catch(() => {
      console.log('WARNING: defualt user already exists.');
    });

};
