const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['patient', 'nurse', 'admin'],
    default: 'patient'
  },
  phoneNumber: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\+?[1-9]\d{1,14}$/.test(v); // Simple E.164 format validation
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  // For patients only
  nurseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    required: function() { return this.role === 'patient'; }
  },
  // For nurses only
  assignedPatients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.role === 'nurse'; }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('User', userSchema); 