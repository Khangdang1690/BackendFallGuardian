const userService = require('../services/userService');
const BaseController = require('./baseController');

class UserController extends BaseController {
  constructor() {
    super(userService);
  }
  
  // You could add user-specific controller methods here if needed
}

const userController = new UserController();

// Export controller methods
module.exports = {
  getAllUsers: userController.getAll,
  getUser: userController.getOne,
  createUser: userController.create,
  updateUser: userController.update,
  deleteUser: userController.delete,
  getMe: userController.getMe,
  updateMe: userController.updateMe
}; 