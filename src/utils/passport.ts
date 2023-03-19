const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser((user: any, done: Function) => {
  done(null, user.id);
});

passport.deserializeUser((user: any, done: Function) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: process.env.OAUTH_GOOGLE_CLIENT_ID,
  clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.FRONTEND_URL + '/oauth/google/callback',
},
function(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
) {
  done(null, profile);
}));

passport.use(new FacebookStrategy({
  clientID: process.env.OAUTH_FACEBOOK_APP_ID,
  clientSecret: process.env.OAUTH_FACEBOOK_APP_SECRET,
  callbackURL: process.env.FRONTEND_URL + '/oauth/facebook/callback',
},
function(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
) {
  done(null, profile);
}));
