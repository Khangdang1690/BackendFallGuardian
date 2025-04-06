// Middleware for authentication checks

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
  console.log(`Auth check for ${req.originalUrl}, authenticated: ${req.isAuthenticated()}, sessionID: ${req.sessionID}`);
  console.log('Session data:', JSON.stringify(req.session).substring(0, 200) + '...');
  
  // If already authenticated, proceed
  if (req.isAuthenticated()) {
    console.log('User authenticated, proceeding to next middleware');
    return next();
  }
  
  // Prevent redirect loops for Google auth routes
  if (req.path.includes('/auth/google')) {
    console.log('Google auth route, allowing unauthenticated access');
    return next();
  }
  
  console.log('User not authenticated, redirecting');
  // Check if request is API call or browser request
  if (req.xhr || req.headers.accept?.indexOf('json') > -1 || req.path.includes('/api/')) {
    return res.status(401).json({ message: 'Not authenticated' });
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