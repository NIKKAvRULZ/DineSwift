const { check, validationResult } = require('express-validator');

exports.validatePaymentCreation = [
  check('orderId')
    .not().isEmpty()
    .withMessage('Order ID is required'),
  check('customerId')
    .not().isEmpty()
    .withMessage('Customer ID is required'),
  check('restaurantId')
    .not().isEmpty()
    .withMessage('Restaurant ID is required'),
  check('amount')
    .not().isEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number'),
  check('paymentMethod')
    .not().isEmpty()
    .withMessage('Payment method is required')
    .isIn(['card', 'cash'])
    .withMessage('Payment method must be either card or cash'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.validateCheckoutSession = [
  check('orderId')
    .not().isEmpty()
    .withMessage('Order ID is required'),
  check('customerId')
    .not().isEmpty()
    .withMessage('Customer ID is required'),
  check('restaurantId')
    .not().isEmpty()
    .withMessage('Restaurant ID is required'),
  check('items')
    .isArray()
    .withMessage('Items must be an array'),
  check('items.*.name')
    .not().isEmpty()
    .withMessage('Item name is required'),
  check('items.*.price')
    .isNumeric()
    .withMessage('Item price must be a number'),
  check('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Item quantity must be at least 1'),
  check('totalAmount')
    .isNumeric()
    .withMessage('Total amount must be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];