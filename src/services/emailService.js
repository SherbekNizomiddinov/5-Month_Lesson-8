const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: 'your.email@gmail.com', pass: 'your-password' }
});

const sendEmail = (to, subject, text) => {
  const mailOptions = { from: 'your.email@gmail.com', to, subject, text };
  transporter.sendMail(mailOptions, (error) => {
    if (error) console.log(error);
  });
};

module.exports = { sendEmail };