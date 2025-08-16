const Joi = require('joi');

module.exports = Joi.object({
  name: Joi.string().required(),
  category: Joi.string().required(),
  price: Joi.number().required()
});