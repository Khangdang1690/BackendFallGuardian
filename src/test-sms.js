// Simple SMS test
require('dotenv').config();
const { sendSMS } = require('./utils/smsUtil');

const phoneNumber = '14073945370'; // Replace with a real phone number for testing
const message = 'Test message from FallGuardian';

console.log(`Testing SMS to ${phoneNumber}: "${message}"`);
sendSMS(phoneNumber, message);

// Keep the process running for a while to allow callback to complete
console.log('Waiting for callback response...');
setTimeout(() => {
  console.log('Test complete');
}, 5000); 