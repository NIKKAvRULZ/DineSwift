/*const Joi = require('joi');

// Joi validation schema for Payment
const paymentValidationSchema = Joi.object({
  userId: Joi.string().required().messages({
    'string.empty': 'User ID is required',
    'any.required': 'User ID is required',
  }),
  orderId: Joi.string().required().messages({
    'string.empty': 'Order ID is required',
    'any.required': 'Order ID is required',
  }),
  amount: Joi.number().required().messages({
    'number.base': 'Amount must be a number',
    'any.required': 'Amount is required',
  }),
  method: Joi.string().valid('Credit Card', 'Debit Card', 'PayPal').required().messages({
    'string.empty': 'Payment method is required',
    'any.required': 'Payment method is required',
    'any.only': 'Payment method must be one of Credit Card, Debit Card, or PayPal',
  }),
  status: Joi.string().valid('Pending', 'Completed', 'Failed', 'Refunded').default('Pending').messages({
    'string.empty': 'Status is required',
    'any.only': 'Invalid status. It must be one of Pending, Completed, Failed, or Refunded',
  }),
});

module.exports = paymentValidationSchema;
*/


const Joi = require("joi");

const paymentValidationSchema = Joi.object({
  userId: Joi.string().required(),
  orderId: Joi.string().required(),
  amount: Joi.number().positive().required(),
  method: Joi.string().valid("card", "paypal", "other").required(),
});

module.exports = paymentValidationSchema;
