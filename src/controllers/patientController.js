const patientService = require('../services/patientService');
const BaseController = require('./baseController');

class PatientController extends BaseController {
  constructor() {
    super(patientService);
  }

  // Get the nurse assigned to the current patient
  getMyNurse = async (req, res, next) => {
    try {
      const patientId = req.user.id;
      const nurse = await this.service.getPatientNurse(patientId);
      res.json(nurse);
    } catch (error) {
      next(error);
    }
  };

  // Alert the nurse about current patient's fall
  alertMyFall = async (req, res, next) => {
    try {
      const patientId = req.user.id;
      const result = await this.service.alertNurseAboutFall(patientId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  // Admin route - Alert about any patient's fall
  alertPatientFall = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.service.alertNurseAboutFall(id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}

const patientController = new PatientController();

module.exports = {
  getMyNurse: patientController.getMyNurse,
  alertMyFall: patientController.alertMyFall,
  alertPatientFall: patientController.alertPatientFall
}; 