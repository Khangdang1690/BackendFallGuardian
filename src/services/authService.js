const User = require('../models/User');
const BaseService = require('./baseService');

class AuthService extends BaseService {
  constructor() {
    super(User);
  }

  async findOrCreateGoogleUser(profile) {
    let user = await this.findOne({ googleId: profile.id });
    
    if (user) {
      return user;
    }

    return this.create({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      role: 'user' // Default role for new users
    });
  }

  async logout(req) {
    try {
      // Clear session if it exists
      if (req.session) {
        try {
          await new Promise((resolve, reject) => {
            req.session.destroy(err => err ? reject(err) : resolve());
          });
        } catch (error) {
          console.error('Session destroy error:', error);
          // Continue even if session destroy fails
        }
      }

      // Clear cookie if we have access to response
      if (req.res) {
        req.res.clearCookie('connect.sid');
      }

      return true;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

module.exports = new AuthService(); 