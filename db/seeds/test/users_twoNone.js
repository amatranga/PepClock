const models = require('../../models');

exports.seed = function (knex, Promise) {

  return models.Profile.where({ email: 'TwoFactorNone@domain.com' }).fetch()
    .then((profile) => {
      if (profile) {
        throw profile;
      }
      return models.Profile.forge({
        first: 'Two',
        last: 'FactorNone',
        display: 'TwoFactorNone',
        email: 'twoFactorNone@domain.com',
        two_factor_enabled: 0
      }).save();
    })
    .error(err => {
      console.error('ERROR: failed to create profile');
      throw err;
    })
    .then((profile) => {
      return models.Auth.forge({
        type: 'local',
        password: 'TwoFactorNone',
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
