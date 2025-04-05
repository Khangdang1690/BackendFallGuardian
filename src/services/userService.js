const User = require('../models/User');
const BaseService = require('./baseService');
const { isValidEmail } = require('../utils/helpers');

class UserService extends BaseService {
  constructor() {
    super(User);
  }
  
  async getAllUsers() {
    return this.findAll();
  }

  async getUserById(id) {
    return this.findById(id);
  }

  async createUser(userData) {
    try {
      if (!isValidEmail(userData.email)) {
        throw new Error('Invalid email format');
      }
      return this.create(userData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      if (userData.email && !isValidEmail(userData.email)) {
        throw new Error('Invalid email format');
      }
      
      // If nurseId is being set, validate that it belongs to a nurse
      if (userData.nurseId) {
        const nurse = await this.findById(userData.nurseId);
        if (!nurse) {
          throw new Error('Nurse not found');
        }
        if (nurse.role !== 'nurse') {
          throw new Error('The specified nurseId does not belong to a user with nurse role');
        }
      }
      
      return this.update(id, userData);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteUser(id) {
    return this.delete(id);
  }
}

module.exports = new UserService(); 