// middleware/auth.js
import { User } from '../models/User.js'; // User modelini import qilish

export const authMiddleware = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      console.error('User topishda xato:', err);
    }
  }
  res.redirect('/login');
};

export const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') return res.render('error', { message: 'Admin ruxsati talab qilinadi' });
  next();
};