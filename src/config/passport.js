const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
      console.log('Google auth started, profile ID:', profile.id);
      
      // Find user in database or create new user
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        console.log('Creating new user with Google ID:', profile.id);
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'patient', // Default role
          avatar: profile.photos[0].value
        });
      } 
      
      return done(null, user);
    } catch (error) {
      console.error('Google auth error:', error);
      return done(error, null);
    }
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
    console.log(`Serializing user to session: ${user._id}`);
    done(null, user._id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    console.log(`Deserializing user from session ID: ${id}`);
    try {
        const user = await User.findById(id);
        if (!user) {
            console.error(`Error: User not found during deserialization: ${id}`);
            return done(null, false);
        }
        console.log(`User successfully deserialized: ${user._id}`);
        done(null, user);
    } catch (error) {
        console.error(`Deserialization error: ${error.message}`);
        done(error, null);
    }
});

module.exports = passport; 