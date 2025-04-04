// const twilio = require('twilio');
const TeleSignSDK = require('telesignsdk');
/**
 * Send an SMS message using Telesign
 * @param {string} phoneNumber - Recipient's phone number in E.164 format
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Response from the SMS provider
 */
const sendSMS = async (phoneNumber, message) => {
  try {
    console.log(`Preparing to send SMS to ${phoneNumber} with message: "${message}"`);

    // Initialize Telesign client
    const customerId = process.env.TELESIGN_CUSTOMER_I || "C796F385-EE56-4E66-B150-167642A7AA06";
    const apiKey = process.env.TELESIGN_API_KEY || "jJ46P2nLG7XhaY125xNDgbYlc0XlQqkzGhoq5oxho7rFpNmk8Y0DAaagbUHNkfUOUTH73mfLppXNm+MCs+kWZQ==";
    const client = new TeleSignSDK(customerId, apiKey);
    console.log('Telesign client initialized successfully.');

    // Send the message
    client.sms.message(smsCallback, phoneNumber, message, 'ARN');
    console.log(`SMS request sent to Telesign for ${phoneNumber}.`);

  } catch (error) {
    console.error('Error in sendSMS function:', error);
    return { 
      success: false, 
      error: error.message,
      errorDetails: error
    };
  }
};

const smsCallback = async (error, responseBody) => {
  if (error) {
    console.error('Error sending SMS:', error);
  } else {
    console.log('SMS sent successfully. Response from Telesign:', responseBody);
    // Log additional response details if needed
    console.log(`Response status: ${responseBody.status}`);
    console.log(`Response message: ${responseBody.message}`);
  }
};

module.exports = {
  sendSMS
}; 