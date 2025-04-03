class BaseService {
  constructor(model) {
    this.model = model;
  }

  // Common CRUD operations
  async findAll(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit, skip, select, populate } = options;
    
    let query = this.model.find(filter);
    
    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(parseInt(limit));
    if (skip) query = query.skip(parseInt(skip));
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    
    return query.exec();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async findById(id, options = {}) {
    const { select, populate } = options;
    
    let query = this.model.findById(id);
    
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    
    return query.exec();
  }

  async findOne(filter = {}, options = {}) {
    const { select, populate } = options;
    
    let query = this.model.findOne(filter);
    
    if (select) query = query.select(select);
    if (populate) query = query.populate(populate);
    
    return query.exec();
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data, options = { new: true }) {
    return this.model.findByIdAndUpdate(id, data, options);
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  // Utility functions
  async exists(filter) {
    return (await this.model.exists(filter)) !== null;
  }

  async updateMany(filter, data) {
    return this.model.updateMany(filter, data);
  }

  async deleteMany(filter) {
    return this.model.deleteMany(filter);
  }

  // Pagination helper
  async paginate(filter = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 }, select, populate } = options;
    
    const skip = (page - 1) * limit;
    const countPromise = this.count(filter);
    const dataPromise = this.findAll(filter, { sort, limit, skip, select, populate });
    
    const [total, data] = await Promise.all([countPromise, dataPromise]);
    
    return {
      data,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  }

  // Error handling
  handleError(error) {
    console.error('Service error:', error);
    
    // Format MongoDB validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).reduce((acc, key) => {
        acc[key] = error.errors[key].message;
        return acc;
      }, {});
      
      throw {
        status: 400,
        message: 'Validation error',
        errors
      };
    }
    
    // Handle duplicate key errors (e.g., unique constraint violations)
    if (error.name === 'MongoError' && error.code === 11000) {
      throw {
        status: 409,
        message: 'Duplicate entry',
        field: Object.keys(error.keyValue)[0]
      };
    }
    
    // Generic error
    throw error;
  }
}

module.exports = BaseService; 