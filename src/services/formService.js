const Form = require('../models/Form');
const BaseService = require('./baseService');
const userService = require('./userService');

class FormService extends BaseService {
  constructor() {
    super(Form);
  }

  /**
   * Create a new form with initial message
   * @param {Object} data - Form data including title, patient, nurse, and message body
   * @returns {Promise<Object>} Created form
   */
  async createForm(data) {
    try {
      // Check if users exist
      const patient = await userService.findById(data.patient);
      if (!patient) {
        throw { status: 404, message: 'Patient not found' };
      }
      
      const nurse = await userService.findById(data.nurse);
      if (!nurse) {
        throw { status: 404, message: 'Nurse not found' };
      }
      
      // Create initial message
      const initialMessage = {
        sender: data.patient,
        body: data.body,
        attachment: data.attachment
      };
      
      // Create form with the initial message
      const form = await this.create({
        title: data.title,
        patient: data.patient,
        nurse: data.nurse,
        messages: [initialMessage]
      });
      
      return form;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Add a message to an existing form
   * @param {string} formId - The ID of the form
   * @param {Object} messageData - Message data (sender, body, attachment)
   * @returns {Promise<Object>} Updated form
   */
  async addMessage(formId, messageData) {
    try {
      const form = await this.findById(formId);
      if (!form) {
        throw { status: 404, message: 'Form not found' };
      }
      
      // Verify sender exists
      const sender = await userService.findById(messageData.sender);
      if (!sender) {
        throw { status: 404, message: 'Sender not found' };
      }
      
      // Verify sender is either the patient or nurse of this form
      if (form.patient.toString() !== messageData.sender && 
          form.nurse.toString() !== messageData.sender) {
        throw { 
          status: 403, 
          message: 'Only the patient or assigned nurse can add messages to this form' 
        };
      }
      
      // Add the new message
      form.messages.push({
        sender: messageData.sender,
        body: messageData.body,
        attachment: messageData.attachment
      });
      
      // Update the status if it's pending and nurse is responding
      if (form.status === 'pending' && form.nurse.toString() === messageData.sender) {
        form.status = 'in-progress';
      }
      
      form.updatedAt = new Date();
      await form.save();
      
      return form;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Mark a form as resolved
   * @param {string} formId - The ID of the form
   * @param {string} userId - ID of user resolving the form
   * @returns {Promise<Object>} Updated form
   */
  async resolveForm(formId, userId) {
    try {
      const form = await this.findById(formId);
      if (!form) {
        throw { status: 404, message: 'Form not found' };
      }
      
      // Verify the user is either the patient or nurse
      if (form.patient.toString() !== userId && form.nurse.toString() !== userId) {
        throw { 
          status: 403, 
          message: 'Only the patient or assigned nurse can resolve this form' 
        };
      }
      
      // Mark as resolved
      form.resolved = true;
      form.resolvedBy = userId;
      form.resolvedAt = new Date();
      form.status = 'resolved';
      
      await form.save();
      
      return form;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all forms for a patient
   * @param {string} patientId - ID of the patient
   * @returns {Promise<Array>} List of forms
   */
  async getPatientForms(patientId) {
    try {
      return this.findAll({ patient: patientId }, { 
        populate: ['nurse', 'patient'],
        sort: { updatedAt: -1 } 
      });
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all forms assigned to a nurse
   * @param {string} nurseId - ID of the nurse
   * @returns {Promise<Array>} List of forms
   */
  async getNurseForms(nurseId) {
    try {
      return this.findAll({ nurse: nurseId }, { 
        populate: ['patient', 'nurse'],
        sort: { updatedAt: -1 } 
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * Get unresolved forms for a nurse or patient
   * @param {string} userId - ID of the user (nurse or patient)
   * @param {string} role - Role of the user ('nurse' or 'patient')
   * @returns {Promise<Array>} List of unresolved forms
   */
  async getUnresolvedForms(userId, role) {
    try {
      const query = { resolved: false };
      
      if (role === 'nurse') {
        query.nurse = userId;
      } else if (role === 'patient') {
        query.patient = userId;
      } else {
        throw { status: 400, message: 'Invalid role specified' };
      }
      
      return this.findAll(query, { 
        populate: ['patient', 'nurse'],
        sort: { updatedAt: -1 }
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
}

module.exports = new FormService(); 