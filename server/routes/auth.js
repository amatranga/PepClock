const express = require('express');
const middleware = require('../middleware');

const router = express.Router();

router.route('/')
  .get(middleware.auth.render);

router.route('/create')
  .get(middleware.auth.verify, middleware.auth.render);

router.route('/dashboard')
  .get(middleware.auth.verify, middleware.auth.render);

router.route('/edit/:id')
  .get(middleware.auth.verify, middleware.auth.render);

router.route('/events/:id')
  .get(middleware.auth.verify, middleware.auth.updateAndRender);

router.route('/redirected')
  .get(middleware.auth.render);

router.route('/login')
  .get((req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  })
  .post(middleware.passport.authenticate('local-login', { 
    failureRedirect: '/login',
    failureFlash: true
  }), middleware.auth.redirect);

router.route('/signup')
  .get((req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  })
  .post(middleware.passport.authenticate('local-signup', {
    failureRedirect: '/signup',
    failureFlash: true
  }), middleware.auth.redirect);

router.route('/profile')
  .get(middleware.auth.verify, (req, res) => {
    res.render('profile.ejs', {
      user: req.user
    });
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

router.get('/twofa', isLoggedIn, function(req, res) {
    if(!req.user.key) {
        console.log("Logic error, totp-input requested with no key set");
        res.redirect('/login');
    }
    
    res.render('totp-input');
});

router.post('/twofa', )

module.exports = router;
