const nurseService = require('../services/nurseService');
const BaseController = require('./baseController');

class NurseController extends BaseController {
  constructor() {
    super(nurseService);
  }

  // Get current nurse's patients
  getMyPatients = async (req, res, next) => {
    try {
      // User ID comes from authenticated user
      const nurseId = req.user.id;
      const patients = await this.service.getNursePatients(nurseId);
      res.json(patients);
    } catch (error) {
      next(error);
    }
  };

  // Get any nurse's patients (admin route)
  getNursePatients = async (req, res, next) => {
    try {
      const nurseId = req.params.nurseId;
      const patients = await this.service.getNursePatients(nurseId);
      res.json(patients);
    } catch (error) {
      next(error);
    }
  };

  // Assign patient to current nurse
  assignPatientToMe = async (req, res, next) => {
    try {
      const nurseId = req.user.id;
      const { patientId } = req.params;
      const updatedNurse = await this.service.assignPatient(nurseId, patientId);
      res.json(updatedNurse);
    } catch (error) {
      next(error);
    }
  };

  // Assign patient to any nurse (admin route)
  assignPatient = async (req, res, next) => {
    try {
      const { nurseId, patientId } = req.params;
      const updatedNurse = await this.service.assignPatient(nurseId, patientId);
      res.json(updatedNurse);
    } catch (error) {
      next(error);
    }
  };

  // Remove patient from current nurse
  removePatientFromMe = async (req, res, next) => {
    try {
      const nurseId = req.user.id;
      const { patientId } = req.params;
      const updatedNurse = await this.service.removePatient(nurseId, patientId);
      res.json(updatedNurse);
    } catch (error) {
      next(error);
    }
  };

  // Remove patient from any nurse (admin route)
  unassignPatient = async (req, res, next) => {
    try {
      const { nurseId, patientId } = req.params;
      const updatedNurse = await this.service.removePatient(nurseId, patientId);
      res.json(updatedNurse);
    } catch (error) {
      next(error);
    }
  };

  // Bulk assign patients to current nurse
  bulkAssignPatientsToMe = async (req, res, next) => {
    try {
      const nurseId = req.user.id;
      const { patientIds } = req.body;
      
      if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'patientIds must be a non-empty array of patient IDs' 
        });
      }
      
      const updatedNurse = await this.service.bulkAssignPatients(nurseId, patientIds);
      res.json(updatedNurse);
    } catch (error) {
      next(error);
    }
  };

  // Bulk assign patients to any nurse (admin route)
  bulkAssignPatients = async (req, res, next) => {
    try {
      const { nurseId } = req.params;
      const { patientIds } = req.body;
      
      if (!patientIds || !Array.isArray(patientIds) || patientIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'patientIds must be a non-empty array of patient IDs' 
        });
      }
      
      const updatedNurse = await this.service.bulkAssignPatients(nurseId, patientIds);
      res.json(updatedNurse);
    } catch (error) {
      next(error);
    }
  };

  // Get all patients in the system
  getAllPatients = async (req, res, next) => {
    try {
      const patients = await this.service.getAllPatients();
      res.json(patients);
    } catch (error) {
      next(error);
    }
  };
}

const nurseController = new NurseController();

module.exports = {
  getMyPatients: nurseController.getMyPatients,
  getNursePatients: nurseController.getNursePatients,
  assignPatientToMe: nurseController.assignPatientToMe,
  assignPatient: nurseController.assignPatient,
  bulkAssignPatientsToMe: nurseController.bulkAssignPatientsToMe,
  bulkAssignPatients: nurseController.bulkAssignPatients,
  removePatientFromMe: nurseController.removePatientFromMe,
  unassignPatient: nurseController.unassignPatient,
  getAllPatients: nurseController.getAllPatients
}; 