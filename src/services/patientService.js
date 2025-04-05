const User = require('../models/User');
const BaseService = require('./baseService');
const { sendSMS } = require('../utils/smsUtil');

class PatientService extends BaseService {
  constructor() {
    super(User);
  }

  // Get nurse assigned to a patient
  async getPatientNurse(patientId) {
    try {
      const patient = await this.findById(patientId, { populate: 'nurseId' });
      if (!patient) {
        throw { status: 404, message: 'Patient not found' };
      }
      
      if (patient.role !== 'patient') {
        throw { status: 400, message: 'User is not a patient' };
      }
      
      if (!patient.nurseId) {
        throw { status: 404, message: 'No nurse assigned to this patient' };
      }
      
      return patient.nurseId;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Alert nurse about patient fall
  async alertNurseAboutFall(patientId) {
    try {
      // Get patient with populated nurse
      const patient = await this.findById(patientId, { populate: 'nurseId' });
      if (!patient) {
        throw { status: 404, message: 'Patient not found' };
      }
      
      if (patient.role !== 'patient') {
        throw { status: 400, message: 'User is not a patient' };
      }
      
      if (!patient.nurseId) {
        throw { status: 404, message: 'No nurse assigned to this patient' };
      }
      
      const nurse = patient.nurseId;
      
      // Ensure nurse has a phone number
      if (!nurse.phoneNumber) {
        throw { status: 400, message: 'Nurse does not have a registered phone number' };
      }
      
      // Send SMS notification to nurse
      const message = `ALERT: Your patient ${patient.name} (ID: ${patient._id}) has had a fall and may require immediate assistance.`;
      await sendSMS(nurse.phoneNumber, message);
      
      return {
        success: true,
        message: 'Fall alert sent to nurse',
        patient: patient,
        nurse: nurse
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}

module.exports = new PatientService(); 