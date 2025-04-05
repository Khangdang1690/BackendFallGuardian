const User = require('../models/User');
const BaseService = require('./baseService');

class NurseService extends BaseService {
  constructor() {
    super(User);
  }

  // Get all patients assigned to a nurse
  async getNursePatients(nurseId) {
    try {
      const nurse = await this.findById(nurseId, { populate: 'assignedPatients' });
      if (!nurse) {
        throw { status: 404, message: 'Nurse not found' };
      }
      
      if (nurse.role !== 'nurse') {
        throw { status: 400, message: 'User is not a nurse' };
      }
      
      return nurse.assignedPatients;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Assign a patient to a nurse
  async assignPatient(nurseId, patientId) {
    try {
      // Check if nurse exists and is actually a nurse
      const nurse = await this.findById(nurseId);
      if (!nurse) {
        throw { status: 404, message: 'Nurse not found' };
      }
      
      if (nurse.role !== 'nurse') {
        throw { status: 400, message: 'User is not a nurse' };
      }
      
      // Check if patient exists and is actually a patient
      const patient = await this.findById(patientId);
      if (!patient) {
        throw { status: 404, message: 'Patient not found' };
      }
      
      if (patient.role !== 'patient') {
        throw { status: 400, message: 'User is not a patient' };
      }
      
      // Check if patient is already assigned to this nurse
      if (nurse.assignedPatients.includes(patientId)) {
        return nurse; // Patient already assigned, no action needed
      }
      
      // Add patient to nurse's assigned patients
      nurse.assignedPatients.push(patientId);
      await nurse.save();
      
      // Update patient's nurseId field to point to this nurse
      patient.nurseId = nurseId;
      await patient.save();
      
      return nurse;
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Remove a patient from a nurse's assignments
  async removePatient(nurseId, patientId) {
    try {
      // Check if nurse exists and is actually a nurse
      const nurse = await this.findById(nurseId);
      if (!nurse) {
        throw { status: 404, message: 'Nurse not found' };
      }
      
      if (nurse.role !== 'nurse') {
        throw { status: 400, message: 'User is not a nurse' };
      }
      
      // Check if patient is assigned to this nurse
      if (!nurse.assignedPatients.includes(patientId)) {
        throw { status: 400, message: 'Patient is not assigned to this nurse' };
      }
      
      // Remove patient from nurse's assigned patients
      nurse.assignedPatients = nurse.assignedPatients.filter(
        id => id.toString() !== patientId.toString()
      );
      await nurse.save();
      
      // Clear the patient's nurseId field
      const patient = await this.findById(patientId);
      if (patient && patient.nurseId && patient.nurseId.toString() === nurseId.toString()) {
        patient.nurseId = null;
        await patient.save();
      }
      
      return nurse;
    } catch (error) {
      return this.handleError(error);
    }
  }
}

module.exports = new NurseService(); 