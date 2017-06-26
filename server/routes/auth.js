const express = require('express');
const middleware = require('../middleware');
const email = require('../../workers/utils/email');

const router = express.Router();

router.route('/')
  .get(middleware.auth.homeRedirect, middleware.auth.render);

router.route('/create')
  .get(middleware.auth.verify, middleware.auth.render);

router.route('/dashboard')
  .get(middleware.auth.verify, middleware.auth.render);

router.route('/edit/:id')
  .get(middleware.auth.verify, middleware.auth.render);

router.route('/events/:id')
  .get(middleware.auth.verify, middleware.auth.updateAndRender);

router.route('/profile')
  .get(middleware.auth.verify, (req, res) => {
    res.render('profile.ejs', {
      user: req.user
    });
  });

router.route('/redirected')
  .get(middleware.auth.render);

router.route('/runworkers')
  .get(middleware.auth.verify, middleware.auth.render);

router.route('/login')
  .get((req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  })
  .post(middleware.passport.authenticate('local-login', {
    failureRedirect: '/login',
    failureFlash: true
  }), middleware.auth.twoFactor, middleware.auth.redirect);

router.route('/signup')
  .get((req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  })
  .post(middleware.passport.authenticate('local-signup', {
    failureRedirect: '/signup',
    failureFlash: true
  }), (req, res) => {
    res.render('twoFactorOptIn.ejs');
  });

router.route('/logout')
  .get((req, res) => {
    req.logout();
    res.redirect('/');
  });

router.get('/auth/google', middleware.passport.authenticate('google', {
  scope: ['email', 'profile']
}));

router.get('/auth/google/callback',
  middleware.passport.authenticate('google',
  { failureRedirect: '/login' }),
  middleware.auth.redirect);

router.get('/auth/facebook', middleware.passport.authenticate('facebook', {
  scope: ['public_profile', 'email']
}));

router.get('/auth/facebook/callback',
  middleware.passport.authenticate('facebook',
  { failureRedirect: '/login' }),
  middleware.auth.redirect);

router.get('/auth/twitter', middleware.passport.authenticate('twitter'));

router.get('/auth/twitter/callback', middleware.passport.authenticate('twitter', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.get('/TwoFA', middleware.auth.setTwoFactorEnabled, middleware.auth.redirect);

router.get('/totp-setup', middleware.auth.verify, middleware.auth.twoFactorSetup, (req, res) => {
  let userCode = req.session.key.slice(0, 6);
  email.sendTwoFactorCode(userCode, req.user.email, (err, success) => {
    res.redirect('/totp-input');
  });
});

router.route('/totp-input')
  .get(middleware.auth.verify, function(req, res) {
    if (!req.session.key) {
      console.error('Logic error, totp-input requested with no key set');
      return res.redirect('/login');
    }
    console.log(req.session.key.slice(0, 6), 'THIS WILL BE SENT TO THE USER');
    res.render('totpinput.ejs');
  })
  .post(middleware.auth.twoFactorVerify, middleware.auth.redirect);

module.exports = router;
