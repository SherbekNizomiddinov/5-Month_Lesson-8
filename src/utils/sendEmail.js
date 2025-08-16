const { sendEmail } = require('../services/emailService');

module.exports = (to, subject, text) => sendEmail(to, subject, text);