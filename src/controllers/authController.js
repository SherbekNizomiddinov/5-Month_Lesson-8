import User from '../models/User.js';
import bcrypt from 'bcrypt';

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });
    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    res.render('auth/register', { error: 'Username yoki email mavjud!' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.render('auth/login', { error: 'Username yoki password xato!' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.render('auth/login', { error: 'Username yoki password xato!' });

    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    res.render('auth/login', { error: 'Xatolik yuz berdi!' });
  }
};

export const logoutUser = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};
