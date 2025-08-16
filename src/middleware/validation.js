const Joi = require('joi');

const validateCategory = (req, res, next) => {
  const schema = Joi.object({ name: Joi.string().required() });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  next();
};

module.exports = { validateCategory };