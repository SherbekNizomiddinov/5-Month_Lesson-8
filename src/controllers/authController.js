const User = require('../models/User');
const jwt = require('jsonwebtoken');
const logger = require('../config/winston');
const { sendEmail } = require('../utils/sendEmail');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password: await bcrypt.hash(password, 10) });
    await user.save();
    res.status(201).json({ message: 'Foydalanuvchi ro\'yxatdan o\'tildi' });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) throw new Error('Foydalanuvchi topilmadi yoki parol noto\'g\'ri');
    const token = jwt.sign({ id: user._id, role: user.role }, 'secretkey', { expiresIn: '1h' });
    res.cookie('accessToken', token).json({ token });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('accessToken');
  res.json({ message: 'Chiqish muvaffaqiyatli' });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) throw new Error('Foydalanuvchi topilmadi');
    const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '15m' });
    const resetLink = `http://localhost:3000/reset-password/${token}`;
    sendEmail(user.username, 'Parolni tiklash', `Parolni tiklash uchun quyidagi linkni ishlat: ${resetLink}`);
    res.send('Parol tiklash uchun email yuborildi');
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, 'secretkey');
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('Foydalanuvchi topilmadi');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.send('Parol muvaffaqiyatli o\'zgartirildi');
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({ error: error.message });
  }
};