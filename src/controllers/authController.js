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
    
    console.log('User authenticated successfully, redirecting to dashboard');
    // Add a parameter to prevent redirect loops
    res.redirect('/api/auth/dashboard?source=google_callback');
  };

  // Dashboard - display auth success and user info
  dashboard = async (req, res) => {
    res.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
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