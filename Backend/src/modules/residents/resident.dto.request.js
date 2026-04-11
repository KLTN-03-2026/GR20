// const { body, validationResult } = require('express-validator');

class CreateResidentRequest {
  constructor(data) {
    this.fullName = data.fullName;
    this.email = data.email;
    this.phone = data.phone;
  }

  validate() {
    if (!this.fullName || !this.email || !this.phone) {
      throw new Error('Missing required fields: fullName, email, phone');
    }
    if (!this.email.includes('@')) {
      throw new Error('Invalid email format');
    }
  }

  static getValidator() {
    return [
      body('fullName').notEmpty().withMessage('Full name is required'),
      body('email').isEmail().withMessage('Valid email is required'),
      body('phone').notEmpty().withMessage('Phone is required')
    ];
  }
}

class UpdateResidentRequest {
  constructor(data) {
    this.fullName = data.fullName;
    this.email = data.email;
    this.phone = data.phone;
  }

  validate() {
    // Optional fields
  }

  static getValidator() {
    return [
      body('fullName').optional().notEmpty().withMessage('Full name is required'),
      body('email').optional().isEmail().withMessage('Valid email is required'),
      body('phone').optional().notEmpty().withMessage('Phone is required')
    ];
  }
}

class DeleteResidentRequest {
  constructor(data) {
    this.id = data.id;
  }

  validate() {
    if (!this.id) {
      throw new Error('ID is required');
    }
  }
}

module.exports = {
  CreateResidentRequest,
  UpdateResidentRequest,
  DeleteResidentRequest
};

