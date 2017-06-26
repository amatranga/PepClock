require('dotenv').config();
const expect = require('chai').expect;
const request = require('supertest');
const app = require('../app.js');
const httpMocks = require('node-mocks-http');
const dbUtils = require('../../db/lib/utils.js');
const passport = require('../middleware/passport');
const models = require('../../db/models');
const middleware = require('../middleware/auth');
const events = require('events');

describe('Authentication', () => {
  let fakeFlash = function(key, message) {
    let object = {};
    object[key] = message;
    return object;
  };

  beforeEach(function (done) {
    dbUtils.rollbackMigrate(done);
  });

  afterEach(function (done) {
    dbUtils.rollback(done);
  });

  describe('Passport local-login strategy', () => {
    it('passport passes user if email and password match', done => {
      let request = httpMocks.createRequest({
        body: {
          first: 'Admin',
          password: 'admin123',
          email: 'admin@domain.com',
          two_factor_enabled: 1
        }
      });
      request.flash = fakeFlash;
      let response = httpMocks.createResponse();
      models.Profile.where({ email: 'admin@domain.com' }).fetch()
        .then(profile => {
          passport.authenticate('local-login', {}, (err, user, info) => {
            expect(user).to.be.an('object');
            expect(user.id).to.equal(profile.get('id'));
            expect(user.email).to.equal(profile.get('email'));
            done(err);
          })(request, response);
        });
    });

    it('passport passes false if email and password do not match', done => {
      let request = httpMocks.createRequest({
        body: {
          first: 'Admin',
          password: 'incorrect',
          email: 'admin@domain.com',
          two_factor_enabled: 1
        }
      });
      request.flash = fakeFlash;
      let response = httpMocks.createResponse();
      passport.authenticate('local-login', {}, (err, user, info) => {
        expect(user).to.equal(false);
        expect(err).to.be.null;
        done(err);
      })(request, response);
    });
  });

  describe('Passport local-signup strategy', () => {
    it('passport passes false if email already exists', done => {
      let request = httpMocks.createRequest({
        body: {
          first: 'Admin',
          password: 'admin123',
          email: 'admin@domain.com',
          two_factor_enabled: 1
        }
      });
      request.flash = fakeFlash;
      let response = httpMocks.createResponse();
      passport.authenticate('local-signup', {}, (err, user, info) => {
        expect(user).to.be.equal(false);
        expect(info.signupMessage).to.equal('An account with this email address already exists.');
        done(err);
      })(request, response);
    });

    it('passport passes user if email does not already exist', done => {
      let request = httpMocks.createRequest({
        body: {
          first: 'Test4',
          password: '101112',
          email: 'TestUser4@mail.com',
          two_factor_enabled: 1
        }
      });
      request.flash = fakeFlash;
      let response = httpMocks.createResponse();
      passport.authenticate('local-signup', {}, (err, user, info) => {
        models.Profile.where({ email: 'TestUser4@mail.com' }).fetch()
          .then(profile => {
            expect(user).to.be.an('object');
            expect(user.id).to.equal(profile.get('id'));
            expect(user.email).to.equal(profile.get('email'));
            done(err);
          });
      })(request, response);
    });
  });
});

describe('Auth Middleware', () => {
  beforeEach(function (done) {
    dbUtils.rollbackMigrate(done);
  });

  afterEach(function (done) {
    dbUtils.rollback(done);
  });

  it('should update database when invitation link is followed', (done) => {
    models.Invitation.where({email: 'test2@test.com'}).fetch()
      .then(invitation => {
        expect(invitation.attributes.rsvp).to.equal('false');
      })
      .then(() => {
        let request = httpMocks.createRequest({
          method: 'GET',
          url: 'events/1?invite=1',
          params: {id: 1, two_factor_enabled: 1},
          user: {id: 1}
        });
        let response = httpMocks.createResponse({eventEmitter: events.EventEmitter});
        response.on('end', function() {
          models.Invitation.where({email: 'test2@test.com'}).fetch()
            .then(invitation => {
              expect(invitation.attributes.rsvp).to.equal('true');
              done();
            });
        });
        middleware.updateAndRender(request, response); 
      }); 
  });

  it('should update database when recipient link is followed', (done) => {
    models.Recipient.where({email: 'hotdog@ketchup.com'}).fetch()
      .then(recipient => {
        expect(recipient.attributes.viewed).to.equal('false');
      })
      .then(() => {
        let request = httpMocks.createRequest({
          method: 'GET',
          url: 'events/1?recipient=1',
          params: {id: 1},
          user: {id: 1}
        });
        let response = httpMocks.createResponse({eventEmitter: events.EventEmitter});
        response.on('end', function () {
          models.Recipient.where({email: 'hotdog@ketchup.com'}).fetch()
            .then(recipient => {
              expect(recipient.attributes.viewed).to.equal('true');
              done();
            });
        });
        middleware.updateAndRender(request, response);
      });
  });
});


