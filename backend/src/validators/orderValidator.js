const { body } = require('express-validator');

const validateCheckout = [
  body('customer.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),

  body('customer.email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('customer.mobile')
    .trim()
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian mobile number'),

  body('address.flat')
    .trim()
    .notEmpty()
    .withMessage('House/Flat/Building address is required'),

  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),

  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('address.pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit Indian PIN code'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Cart must contain at least 1 product item'),

  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Valid product ID is required for each cart item'),

  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1 for each cart item')
];

module.exports = {
  validateCheckout
};
