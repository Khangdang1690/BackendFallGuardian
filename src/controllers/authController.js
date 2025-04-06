const authService = require('../services/authService');
const BaseController = require('./baseController');

class AuthController extends BaseController {
  constructor() {
    super(authService);
  }

  // Handle Google OAuth callback
  handleGoogleCallback = async (req, res) => {
    console.log('Google callback triggered, user:', req.user ? 'authenticated' : 'not authenticated');
    
    if (!req.user) {
      console.log('User authentication failed, redirecting to /api/auth/google');
      return res.redirect('/api/auth/google?error=authentication_failed');
    }
    
    console.log('Session before save:', req.session);
    
    // Force session save and wait for it to complete before redirecting
    req.session.save((err) => {
      if (err) {
        console.error('Final session save error:', err);
        return res.status(500).send('Session save failed');
      }
      
      console.log('User authenticated successfully, session saved, redirecting to dashboard');
      console.log('Session ID after save:', req.sessionID);
      // Add a parameter to prevent redirect loops
      res.redirect('/api/auth/dashboard?source=google_callback');
    });
  };

  // Dashboard - display auth success and user info
  dashboard = async (req, res) => {
    // Ensure user exists either from passport or from session
    const userData = req.user || {
      id: req.session.userId,
      name: req.session.userName,
      email: req.session.userEmail,
      role: req.session.userRole
    };
    
    if (!userData.id) {
      console.error('No user data available in dashboard route');
      return res.status(401).json({ message: 'Authentication failed' });
    }
    
    console.log(`Dashboard accessed by: ${userData.name}, ID: ${userData.id}, Session ID: ${req.sessionID}`);
    
    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      },
      session: {
        id: req.sessionID,
        authenticated: req.isAuthenticated()
      }
    });
  };

  // Handle logout
  logout = async (req, res, next) => {
    try {
      // First, attempt passport logout if available
      if (req.logout) {
        if (req.logout.length) { // Passport >= 0.6.0 requires a callback
          await new Promise((resolve) => {
            req.logout((err) => {
              if (err) {
                console.error('Passport logout error:', err);
                // Don't reject, we'll try other logout methods
              }
              resolve();
            });
          });
        } else {
          // Older versions of Passport
          req.logout();
        }
      }
      
      // Attach the response to the request for the service
      req.res = res;
      
      // Then use our service to clean up sessions and cookies
      await authService.logout(req);
      
      // Detect if this is an API call (like from Swagger) or a browser request
      const isApiCall = req.xhr || 
                        req.headers.accept && req.headers.accept.indexOf('json') > -1 ||
                        req.path.includes('/api/');
      
      if (isApiCall) {
        // If API call, return JSON response
        return res.status(200).json({
          success: true,
          message: 'Logout successful'
        });
      } else {
        // If browser request, redirect
        const redirectUrl = process.env.LOGOUT_REDIRECT_URL || '/';  //Remember to add deployment url
        return res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Logout error:', error);
      
      // Determine response type based on request
      if (req.xhr || 
          req.headers.accept && req.headers.accept.indexOf('json') > -1 || 
          req.path.includes('/api/')) {
        return res.status(500).json({
          success: false,
          message: 'Logout failed',
          error: error.message
        });
      } else {
        try {
          return res.redirect(process.env.LOGOUT_REDIRECT_URL || '/');
        } catch (redirectError) {
          next(error);
        }
      }
    }
  };
}

const authController = new AuthController();

module.exports = {
  handleGoogleCallback: authController.handleGoogleCallback,
  dashboard: authController.dashboard,
  logout: authController.logout
}; 