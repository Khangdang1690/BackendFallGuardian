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
}

const nurseController = new NurseController();

module.exports = {
  getMyPatients: nurseController.getMyPatients,
  getNursePatients: nurseController.getNursePatients,
  assignPatientToMe: nurseController.assignPatientToMe,
  assignPatient: nurseController.assignPatient,
  removePatientFromMe: nurseController.removePatientFromMe,
  unassignPatient: nurseController.unassignPatient
}; 