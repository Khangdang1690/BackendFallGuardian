class BaseController {
  constructor(service) {
    this.service = service;
  }

  // Get all resources
  getAll = async (req, res, next) => {
    try {
      const items = await this.service.findAll(req.query);
      res.json(items);
    } catch (error) {
      next(error);
    }
  };

  // Get single resource
  getOne = async (req, res, next) => {
    try {
      const item = await this.service.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  // Create resource
  create = async (req, res, next) => {
    try {
      const newItem = await this.service.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  };

  // Update resource
  update = async (req, res, next) => {
    try {
      const updatedItem = await this.service.update(req.params.id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      res.json(updatedItem);
    } catch (error) {
      next(error);
    }
  };

  // Delete resource
  delete = async (req, res, next) => {
    try {
      const deletedItem = await this.service.delete(req.params.id);
      if (!deletedItem) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  // Get current user profile
  getMe = async (req, res, next) => {
    try {
      // req.user is set by Passport middleware
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      const user = await this.service.findById(req.user.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  // Update current user profile
  updateMe = async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      // Prevent changing sensitive fields
      delete req.body.role;
      delete req.body.googleId;
      delete req.body.email; // Prevent changing email
      
      const updatedUser = await this.service.update(req.user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = BaseController; 