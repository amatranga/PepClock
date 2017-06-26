'use strict';
const request = require('supertest');
const express = require('express');
const expect = require('chai').expect;
const app = require('../app.js');
const dbUtils = require('../../db/lib/utils.js');

describe('Unauthorized Routes', function() {
  it('redirects to login if not authed', function(done) {
    request(app)
      .get('/dashboard')
      .expect(302)
      .expect(function(res) {
        expect(res.header.location).to.equal('/login');
      })
      .end(done);
  });

  it('serves / without auth', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect(function(res) {
        expect(res.text).to.include('<script src="/dist/bundle.js"></script>');
      })
      .end(done);
  });

  it('serves /redirected without auth', function(done) {
    request(app)
      .get('/')
      .expect(200)
      .expect(function(res) {
        expect(res.text).to.include('<script src="/dist/bundle.js"></script>');
      })
      .end(done);
  });

  it('redirects to login if not authed and get /dashboard', function(done) {
    request(app)
      .get('/dashboard')
      .expect(302)
      .expect(function(res) {
        expect(res.header.location).to.equal('/login');
      })
      .end(done);
  });

  it('redirects to login if not authed and get /edit', function(done) {
    request(app)
      .get('/edit/1')
      .expect(302)
      .expect(function(res) {
        expect(res.header.location).to.equal('/login');
      })
      .end(done);
  });

  it('redirects to login if not authed and get /events', function(done) {
    request(app)
      .get('/events/1')
      .expect(302)
      .expect(function(res) {
        expect(res.header.location).to.equal('/login');
      })
      .end(done);
  });

  it('redirects to login if not authed and get /dashboard', function(done) {
    request(app)
      .get('/dashboard')
      .expect(302)
      .expect(function(res) {
        expect(res.header.location).to.equal('/login');
      })
      .end(done);
  });
});

describe('Authorized Routes', function () {
  beforeEach(function (done) {
    dbUtils.rollbackMigrate(done);
  });

  afterEach(function (done) {
    dbUtils.rollback(done);
  });

  const agent = request.agent(app);

  it('should redirect to /dashboard after auth', function(done) {
    agent
      .post('/login')
      .send({email: 'admin@domain.com', password: 'admin123'})
      .expect((res) => {
        expect(200);
        expect(res.header.location).to.equal('/dashboard');
      })
      .end(done);
  });

  it('should render /create if authed', function(done) {
    agent
      .get('/create')
      .expect(200)
      .expect(function(res) {
        expect(res.text).to.include('<script src="/dist/bundle.js"></script>');
      })
      .end(done);
  });

  it('should render /dashbooard if authed', function(done) {
    agent
      .get('/dashboard')
      .expect(200)
      .expect(function(res) {
        expect(res.text).to.include('<script src="/dist/bundle.js"></script>');
      })
      .end(done);
  });

  it('should render /edit if authed', function(done) {
    agent
      .get('/edit/1')
      .expect(200)
      .expect(function(res) {
        expect(res.text).to.include('<script src="/dist/bundle.js"></script>');
      })
      .end(done);
  });

  it('should render /events if authed', function(done) {
    agent
      .get('/events/1')
      .expect(200)
      .expect(function(res) {
        expect(res.text).to.include('<script src="/dist/bundle.js"></script>');
      })
      .end(done);
  });

    it ('should send the user to totp-setup page if 2FA is enabled', done => {
      agent
        .post('/login')
        .send({email: 'twoFactor@domain.com', password: 'twoFactor', two_factor_enabled: 2})
        .expect((res) => {
          expect(res.header.location).to.equal('/totp-setup');
        })
        .end(done);
    });

    it('should send the user from totp-setup to totp-input', done => {
      agent
        .get('/totp-setup')
        .send({email: 'twoFactor@domain.com', password: 'twoFactor', two_factor_enabled: 2})
        .expect((res) => {
          expect(res.header.location).to.equal('/totp-input');
        })
        .end(done);
    });

    it('should ask the user if they would like to enable 2FA after creating a new account', done => {
      agent
        .post('/signup')
        .send({email: 'twoFactorNone@domain.com', password: 'TwoFactorNone', two_factor_enabled: 0})
        .expect((res) => {
          expect(res.text).to.include('Found. Redirecting to /signup')
        })
        .end(done);
    });

    it('should send the user to their dashboard if 2FA is disabled', done=> {
      agent
        .post('/login')
        .send({email: 'TwoFactorNoWay@domain.com', password: 'TwoFactorNoWay', two_factor_enabled: 1})
        .expect((res) => {
          expect(res.header.location).to.equal('/dashboard');
        })
        .end(done);
    });
});
