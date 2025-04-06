// Middleware for authentication checks

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log(`Auth check for ${req.originalUrl}, isAuthenticated: ${req.isAuthenticated()}, sessionID: ${req.sessionID}`);
  console.log(`Session has userId: ${!!req.session.userId}, Session has isAuthenticated: ${!!req.session.isAuthenticated}`);
  
  // Primary check: Passport authentication
  if (req.isAuthenticated() && req.user) {
    console.log('Authenticated via Passport');
    return next();
  }
  
  // Secondary check: Session-based authentication
  if (req.session && req.session.userId && req.session.isAuthenticated) {
    console.log('Authenticated via session. User ID:', req.session.userId);
    
    // Option 1: Manually set user object based on session
    if (!req.user) {
      req.user = {
        id: req.session.userId,
        name: req.session.userName,
        email: req.session.userEmail,
        role: req.session.userRole
      };
      console.log('User object reconstructed from session');
    }
    
    return next();
  }
  
  // Prevent redirect loops for Google auth routes
  if (req.path.includes('/auth/google')) {
    console.log('Google auth route, allowing unauthenticated access');
    return next();
  }
  
  console.log('Not authenticated. Redirecting to login.');
  
  // API response for XHR requests, redirect for browser requests
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(401).json({ message: 'Not authenticated', redirectTo: '/api/auth/google' });
  } else {
    return res.redirect('/api/auth/google');
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  
  if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.path.includes('/api/')) {
    return res.status(403).json({ message: 'Not authorized' });
  } else {
    return res.redirect('/unauthorized');
  }
};

// Check if user is a nurse
const isNurse = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'nurse') {
    return next();
  }
  
  if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.path.includes('/api/')) {
    return res.status(403).json({ message: 'Nurse access required' });
  } else {
    return res.redirect('/unauthorized');
  }
};

// Check if user is a patient
const isPatient = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'patient') {
    return next();
  }
  
  if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.path.includes('/api/')) {
    return res.status(403).json({ message: 'Patient access required' });
  } else {
    return res.redirect('/unauthorized');
  }
};

// Check if user is either nurse or admin
const isNurseOrAdmin = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role === 'nurse' || req.user.role === 'admin')) {
    return next();
  }
  
  if (req.xhr || req.headers.accept.indexOf('json') > -1 || req.path.includes('/api/')) {
    return res.status(403).json({ message: 'Nurse or admin access required' });
  } else {
    return res.redirect('/unauthorized');
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isNurse,
  isPatient,
  isNurseOrAdmin
}; 