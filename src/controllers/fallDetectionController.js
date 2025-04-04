const fallDetectionService = require('../services/fallDetectionService');
const BaseController = require('./baseController');

class FallDetectionController extends BaseController {
  constructor() {
    super(fallDetectionService);
  }

  /**
   * Record a fall event for a patient (called from frontend)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  recordFallEvent = async (req, res, next) => {
    try {
      const { patientId } = req.params;
      
      // Log fall detection from frontend
      console.log(`Fall detected for patient ${patientId} from frontend application`);
      
      const patient = await this.service.recordFallEvent(patientId);
      res.status(200).json({
        success: true,
        message: 'Fall event recorded',
        patient
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset a patient's fall status after assistance is provided
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  resetFallStatus = async (req, res, next) => {
    try {
      const { patientId } = req.params;
      const patient = await this.service.resetFallStatus(patientId);
      res.status(200).json({
        success: true,
        message: 'Fall status reset',
        patient
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all patients with active fall status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getActiveFalls = async (req, res, next) => {
    try {
      const patients = await this.service.getActiveFalls();
      res.status(200).json({
        success: true,
        count: patients.length,
        patients
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assign a patient to a nurse
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  assignPatient = async (req, res, next) => {
    try {
      const { nurseId, patientId } = req.params;
      const nurse = await this.service.assignPatientToNurse(nurseId, patientId);
      res.status(200).json({
        success: true,
        message: 'Patient assigned to nurse successfully',
        nurse
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unassign a patient from a nurse
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  unassignPatient = async (req, res, next) => {
    try {
      const { nurseId, patientId } = req.params;
      const nurse = await this.service.unassignPatientFromNurse(nurseId, patientId);
      res.status(200).json({
        success: true,
        message: 'Patient unassigned from nurse successfully',
        nurse
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all patients assigned to a nurse
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getNursePatients = async (req, res, next) => {
    try {
      const { nurseId } = req.params;
      const patients = await this.service.getNursePatients(nurseId);
      res.status(200).json({
        success: true,
        count: patients.length,
        patients
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all patients assigned to the authenticated nurse
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  getMyPatients = async (req, res, next) => {
    try {
      // Get nurse ID from authenticated user
      const nurseId = req.user._id;
      const patients = await this.service.getNursePatients(nurseId);
      
      res.status(200).json({
        success: true,
        count: patients.length,
        patients
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assign a patient to the authenticated nurse
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  assignPatientToMe = async (req, res, next) => {
    try {
      // Get nurse ID from authenticated user
      const nurseId = req.user._id;
      const { patientId } = req.params;
      
      const nurse = await this.service.assignPatientToNurse(nurseId, patientId);
      
      res.status(200).json({
        success: true,
        message: 'Patient assigned successfully',
        nurse
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Remove a patient from the authenticated nurse
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  removePatientFromMe = async (req, res, next) => {
    try {
      // Get nurse ID from authenticated user
      const nurseId = req.user._id;
      const { patientId } = req.params;
      
      const nurse = await this.service.unassignPatientFromNurse(nurseId, patientId);
      
      res.status(200).json({
        success: true,
        message: 'Patient removed successfully',
        nurse
      });
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * Simulate a fall event for testing and development purposes
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  simulateFallEvent = async (req, res, next) => {
    try {
      const { patientId } = req.params;
      
      // Log who is simulating this fall event
      const simulatedBy = req.user.name || req.user.email || req.user._id;
      console.log(`Fall simulation triggered by ${simulatedBy} for patient ${patientId}`);
      
      // Reuse the existing service method
      const patient = await this.service.recordFallEvent(patientId);
      
      res.status(200).json({
        success: true,
        message: 'Fall event simulated successfully',
        note: 'This simulated fall has triggered actual notifications to assigned nurses',
        patient
      });
    } catch (error) {
      next(error);
    }
  };
}

const fallDetectionController = new FallDetectionController();

module.exports = {
  recordFallEvent: fallDetectionController.recordFallEvent,
  resetFallStatus: fallDetectionController.resetFallStatus,
  getActiveFalls: fallDetectionController.getActiveFalls,
  assignPatient: fallDetectionController.assignPatient,
  unassignPatient: fallDetectionController.unassignPatient,
  getNursePatients: fallDetectionController.getNursePatients,
  // "me" methods for nurses
  getMyPatients: fallDetectionController.getMyPatients,
  assignPatientToMe: fallDetectionController.assignPatientToMe,
  removePatientFromMe: fallDetectionController.removePatientFromMe,
  // Fall simulation method
  simulateFallEvent: fallDetectionController.simulateFallEvent
}; 