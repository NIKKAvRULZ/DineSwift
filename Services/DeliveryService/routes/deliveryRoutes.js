const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { assignDelivery, getDeliveryStatus, updateDeliveryStatus, trackDelivery } = require('../controllers/deliveryController');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  next();
};

router.post('/assign', [
  body('orderId').isMongoId().withMessage('Invalid orderId format'),
  body('driverId').isMongoId().withMessage('Invalid driverId format'),
  body('location').isArray({ min: 2, max: 2 }).withMessage('Location must be an array of [longitude, latitude]'),
  body('location.0').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('location.1').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
], validate, assignDelivery);

router.get('/status/:deliveryId', [
  param('deliveryId').isMongoId().withMessage('Invalid deliveryId format'),
], validate, getDeliveryStatus);

router.put('/status/:deliveryId', [
  param('deliveryId').isMongoId().withMessage('Invalid deliveryId format'),
  body('status').isIn(['pending', 'assigned', 'in_progress', 'delivered', 'cancelled']).withMessage('Invalid status value'),
], validate, updateDeliveryStatus);

router.get('/track/:deliveryId', [
  param('deliveryId').isMongoId().withMessage('Invalid deliveryId format'),
], validate, trackDelivery);

module.exports = router;