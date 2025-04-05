// Format error message
exports.formatError = (error) => {
  if (error.name === 'ValidationError') {
    return Object.values(error.errors).map(err => err.message);
  }
  return error.message;
};

// Validate email format
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};