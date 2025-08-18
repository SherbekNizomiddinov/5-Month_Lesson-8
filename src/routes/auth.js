import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController.js';

const router = express.Router();

// Login sahifasi
router.get('/login', (req, res) => {
  res.render('auth/login', { error: null });
});

// Login formani submit qilish
router.post('/login', loginUser);

// Ro'yhatdan o'tish sahifasi
router.get('/register', (req, res) => {
  res.render('auth/register', { error: null });
});

// Ro'yhatdan o'tish formasi submit
router.post('/register', registerUser);

// Logout qilish
router.get('/logout', logoutUser);

export default router;
