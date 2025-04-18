const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

// Local Strategy for email/password authentication
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      console.log('Local auth attempt for email:', email);
      
      // Find the user by email
      const user = await User.findOne({ email });
      
      // If user doesn't exist
      if (!user) {
        console.log('User not found with email:', email);
        return done(null, false, { message: 'Incorrect email or password' });
      }
      
      // Check if password is correct
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        console.log('Password mismatch for email:', email);
        return done(null, false, { message: 'Incorrect email or password' });
      }
      
      console.log('Local auth successful for user:', user._id);
      return done(null, user);
    } catch (error) {
      console.error('Local auth error:', error);
      return done(error);
    }
  }
));

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
      
      // Track if the user is new for redirection purposes
      let isNewUser = false;
      
      if (!user) {
        console.log('Creating new user with Google ID:', profile.id);
        isNewUser = true;
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'patient', // Default role
          avatar: profile.photos[0].value
        });
      } 
      
      // Add isNewUser flag to the user object
      user = user.toObject();
      user.isNewUser = isNewUser;
      
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