const mongoose = require('mongoose');

// Schema for individual messages within a form thread
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  body: {
    type: String,
    required: true
  },
  attachment: {
    type: String, // URL to attachment if any
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Main Form schema
const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nurse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // This automatically updates the timestamps
});

// Virtual property to get the initial message
formSchema.virtual('initialMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[0];
  }
  return null;
});

// Virtual property to get the latest message
formSchema.virtual('latestMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

// Pre-save middleware to update status based on resolved flag
formSchema.pre('save', function(next) {
  if (this.resolved && this.status !== 'resolved') {
    this.status = 'resolved';
    this.resolvedAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Form', formSchema); 