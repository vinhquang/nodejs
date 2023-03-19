import {Router as expressRouter} from 'express';
const passport = require('passport');

const router = expressRouter();

const {isAuthorized} = require('../../middlewares/authorize');

const OauthController = require('./oauth.controller');

router.get(
    '/google',
    [
      isAuthorized(),
      passport.authenticate('google', {scope: ['profile', 'email']}),
    ],
);

router.get(
    '/google/callback',
    [
      isAuthorized(),
      passport.authenticate('google', {failureRedirect: '/user/login'}),
    ],
    OauthController.google,
);

router.get(
    '/facebook',
    [
      isAuthorized(),
      passport.authenticate('facebook'),
    ],
);

router.get(
    '/facebook/callback',
    [
      isAuthorized(),
      passport.authenticate('facebook', {failureRedirect: '/user/login'}),
    ],
    OauthController.facebook,
);

module.exports = router;
