const Joi = require('joi');

module.exports = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required()
});