const User = require('../models/User');
const BaseService = require('./baseService');
const { sendSMS } = require('../utils/smsUtil');

class FallDetectionService extends BaseService {
  constructor() {
    super(User);
  }

  /**
   * Record a fall event for a patient
   * @param {string} patientId - The ID of the patient who fell
   * @returns {Promise<Object>} - Updated patient data
   */
  async recordFallEvent(patientId) {
    try {
      // Find the patient and update their fall status
      const patient = await this.model.findByIdAndUpdate(
        patientId,
        { 
          fallStatus: true,
          lastFallTimestamp: new Date()
        },
        { new: true }
      ).select('name email phoneNumber fallStatus lastFallTimestamp');

      if (!patient) {
        throw new Error('Patient not found');
      }

      // Notify assigned nurses
      await this.notifyNurses(patient);
      
      // After notification, automatically reset fall status
      // This keeps the lastFallTimestamp but sets fallStatus to false
      const updatedPatient = await this.model.findByIdAndUpdate(
        patientId,
        { fallStatus: false },
        { new: true }
      ).select('name email phoneNumber fallStatus lastFallTimestamp');
      
      console.log(`Fall status automatically reset for patient ${patientId} after nurse notification`);

      return updatedPatient;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset a patient's fall status
   * @param {string} patientId - The ID of the patient
   * @returns {Promise<Object>} - Updated patient data
   */
  async resetFallStatus(patientId) {
    try {
      return await this.model.findByIdAndUpdate(
        patientId,
        { fallStatus: false },
        { new: true }
      ).select('name email phoneNumber fallStatus');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all patients with active fall status
   * @returns {Promise<Array>} - Array of patients with active falls
   */
  async getActiveFalls() {
    try {
      return await this.model.find({
        role: 'patient',
        fallStatus: true
      }).select('name email phoneNumber fallStatus lastFallTimestamp')
        .sort({ lastFallTimestamp: -1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Notify all nurses assigned to a patient about a fall
   * @param {Object} patient - The patient who fell
   */
  async notifyNurses(patient) {
    try {
      // Find all nurses assigned to this patient
      const assignedNurses = await this.model.find({
        role: 'nurse',
        assignedPatients: patient._id
      });

      // Send notifications to each nurse
      const notifications = assignedNurses.map(nurse => {
        // Send SMS if phone number is available
        if (nurse.phoneNumber) {
          return sendSMS(
            nurse.phoneNumber,
            `URGENT: Patient ${patient.name} has fallen. Please check immediately.`
          );
        }
        return Promise.resolve();
      });

      await Promise.all(notifications);

      return { success: true, nursesNotified: assignedNurses.length };
    } catch (error) {
      console.error('Error notifying nurses:', error);
      // Don't throw here to prevent blocking the fall recording
      return { success: false, error: error.message };
    }
  }

  /**
   * Assign a patient to a nurse
   * @param {string} nurseId - The ID of the nurse
   * @param {string} patientId - The ID of the patient to assign
   * @returns {Promise<Object>} - Updated nurse data
   */
  async assignPatientToNurse(nurseId, patientId) {
    try {
      // Verify the patient exists and is a patient
      const patient = await this.model.findOne({
        _id: patientId,
        role: 'patient'
      });

      if (!patient) {
        throw new Error('Patient not found or invalid role');
      }

      // Add the patient to the nurse's assigned patients and populate in a single operation
      const nurse = await this.model.findOneAndUpdate(
        { _id: nurseId, role: 'nurse' },
        { $addToSet: { assignedPatients: patientId } },
        { new: true }
      ).populate({
        path: 'assignedPatients',
        select: 'name email phoneNumber fallStatus'
      });

      if (!nurse) {
        throw new Error('Nurse not found or invalid role');
      }

      return nurse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove a patient assignment from a nurse
   * @param {string} nurseId - The ID of the nurse
   * @param {string} patientId - The ID of the patient to unassign
   * @returns {Promise<Object>} - Updated nurse data
   */
  async unassignPatientFromNurse(nurseId, patientId) {
    try {
      // Remove patient and populate in a single operation
      const nurse = await this.model.findOneAndUpdate(
        { _id: nurseId, role: 'nurse' },
        { $pull: { assignedPatients: patientId } },
        { new: true }
      ).populate({
        path: 'assignedPatients',
        select: 'name email phoneNumber fallStatus'
      });
      
      if (!nurse) {
        throw new Error('Nurse not found or invalid role');
      }

      return nurse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all patients assigned to a nurse
   * @param {string} nurseId - The ID of the nurse
   * @returns {Promise<Array>} - Array of assigned patients
   */
  async getNursePatients(nurseId) {
    try {
      const nurse = await this.model.findOne({ 
        _id: nurseId,
        role: 'nurse'
      });

      if (!nurse) {
        throw new Error('Nurse not found');
      }

      return await this.model.find({
        _id: { $in: nurse.assignedPatients },
        role: 'patient'
      }).select('name email phoneNumber fallStatus');
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FallDetectionService(); 