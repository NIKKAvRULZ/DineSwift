const express = require('express');
const Joi = require('joi');
const {
  assignDelivery,
  getDeliveryStatus,
  updateDeliveryStatus,
  getAvailableDrivers,
  trackDelivery,
  getActiveDelivery,
} = require('../controllers/deliveryController');

const router = express.Router();

const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = source === 'body' ? req.body : source === 'params' ? req.params : req.query;
    const { error } = schema.validate(data, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: error.details.map((err) => err.message),
      });
    }
    next();
  };
};

const assignDeliverySchema = Joi.object({
  orderId: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.min': 'orderId must be a non-empty string',
      'any.required': 'orderId is required',
    }),
  driverId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Invalid driverId format, must be a valid MongoDB ObjectId',
    }),
  location: Joi.array()
    .length(2)
    .items(
      Joi.number().min(-180).max(180).required().messages({
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180',
        'any.required': 'Longitude is required',
      }),
      Joi.number().min(-90).max(90).required().messages({
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90',
        'any.required': 'Latitude is required',
      })
    )
    .required()
    .messages({
      'array.length': 'Location must be an array of [longitude, latitude]',
      'any.required': 'Location is required',
    }),
});

const deliveryIdSchema = Joi.object({
  deliveryId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid deliveryId format, must be a valid MongoDB ObjectId',
      'any.required': 'deliveryId is required',
    }),
});

const updateDeliveryStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pending', 'assigned', 'in_progress', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.only': 'Invalid status value',
      'any.required': 'Status is required',
    }),
});

const availableDriversSchema = Joi.object({
  longitude: Joi.number().min(-180).max(180).optional().messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180',
  }),
  latitude: Joi.number().min(-90).max(90).optional().messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90',
  }),
});

router.post('/assign', validateRequest(assignDeliverySchema, 'body'), assignDelivery);
router.get('/status/:deliveryId', validateRequest(deliveryIdSchema, 'params'), getDeliveryStatus);
router.put('/status/:deliveryId', validateRequest(updateDeliveryStatusSchema, 'body'), updateDeliveryStatus);
router.get('/available-drivers', validateRequest(availableDriversSchema, 'query'), getAvailableDrivers);
router.get('/track/:deliveryId', validateRequest(deliveryIdSchema, 'params'), trackDelivery);
router.get('/active', getActiveDelivery);

module.exports = router;