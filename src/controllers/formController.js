const formService = require('../services/formService');
const BaseController = require('./baseController');

class FormController extends BaseController {
  constructor() {
    super(formService);
  }

  // Create a new form
  createForm = async (req, res, next) => {
    try {
      const { title, nurse, body, attachment } = req.body;
      
      // Validate required fields
      if (!title || !nurse || !body) {
        return res.status(400).json({ 
          message: 'Missing required fields: title, nurse, and body are required' 
        });
      }
      
      // Use the authenticated user as the patient
      const patient = req.user.id;
      
      const newForm = await this.service.createForm({
        title,
        patient,
        nurse,
        body,
        attachment
      });
      
      res.status(201).json(newForm);
    } catch (error) {
      next(error);
    }
  };

  // Get a specific form by ID
  getForm = async (req, res, next) => {
    try {
      const { id } = req.params;
      const form = await this.service.findById(id, { 
        populate: ['patient', 'nurse', 'messages.sender'] 
      });
      
      if (!form) {
        return res.status(404).json({ message: 'Form not found' });
      }
      
      // Check if the user is authorized to view this form
      const userId = req.user.id;
      if (form.patient._id.toString() !== userId && 
          form.nurse._id.toString() !== userId && 
          req.user.role !== 'admin') {
        return res.status(403).json({ 
          message: 'You are not authorized to view this form' 
        });
      }
      
      res.json(form);
    } catch (error) {
      next(error);
    }
  };

  // Add a message to an existing form
  addMessage = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { body, attachment } = req.body;
      
      if (!body) {
        return res.status(400).json({ message: 'Message body is required' });
      }
      
      const messageData = {
        sender: req.user.id,
        body,
        attachment
      };
      
      const updatedForm = await this.service.addMessage(id, messageData);
      res.json(updatedForm);
    } catch (error) {
      next(error);
    }
  };

  // Mark a form as resolved
  resolveForm = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const resolvedForm = await this.service.resolveForm(id, userId);
      res.json(resolvedForm);
    } catch (error) {
      next(error);
    }
  };

  // Get all forms for the current user (based on role)
  getMyForms = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { role } = req.user;
      const { status } = req.query;
      
      let forms;
      
      if (role === 'patient') {
        forms = await this.service.getPatientForms(userId);
      } else if (role === 'nurse') {
        forms = await this.service.getNurseForms(userId);
      } else if (role === 'admin') {
        // Admins can view all forms
        forms = await this.service.findAll({}, {
          populate: ['patient', 'nurse'],
          sort: { updatedAt: -1 }
        });
      } else {
        return res.status(403).json({ message: 'Unauthorized role' });
      }
      
      // Filter by status if requested
      if (status) {
        if (status === 'resolved') {
          forms = forms.filter(form => form.resolved);
        } else if (status === 'unresolved') {
          forms = forms.filter(form => !form.resolved);
        } else if (['pending', 'in-progress', 'cancelled'].includes(status)) {
          forms = forms.filter(form => form.status === status);
        }
      }
      
      res.json(forms);
    } catch (error) {
      next(error);
    }
  };

  // Get unresolved forms for the current user
  getUnresolvedForms = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { role } = req.user;
      
      if (role !== 'patient' && role !== 'nurse') {
        return res.status(403).json({ message: 'Invalid role for this operation' });
      }
      
      const forms = await this.service.getUnresolvedForms(userId, role);
      res.json(forms);
    } catch (error) {
      next(error);
    }
  };

  // Get form statistics for dashboard
  getFormStats = async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { role } = req.user;
      
      let stats = {
        total: 0,
        resolved: 0,
        unresolved: 0,
        pending: 0,
        inProgress: 0,
        cancelled: 0
      };
      
      let query = {};
      
      if (role === 'patient') {
        query.patient = userId;
      } else if (role === 'nurse') {
        query.nurse = userId;
      } else if (role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized role' });
      }
      
      const forms = await this.service.findAll(query);
      
      stats.total = forms.length;
      stats.resolved = forms.filter(form => form.resolved).length;
      stats.unresolved = forms.filter(form => !form.resolved).length;
      stats.pending = forms.filter(form => form.status === 'pending').length;
      stats.inProgress = forms.filter(form => form.status === 'in-progress').length;
      stats.cancelled = forms.filter(form => form.status === 'cancelled').length;
      
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}

const formController = new FormController();

module.exports = {
  createForm: formController.createForm,
  getForm: formController.getForm,
  addMessage: formController.addMessage,
  resolveForm: formController.resolveForm,
  getMyForms: formController.getMyForms,
  getUnresolvedForms: formController.getUnresolvedForms,
  getFormStats: formController.getFormStats
}; 