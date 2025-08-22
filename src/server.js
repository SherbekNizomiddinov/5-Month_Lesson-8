import fs from 'fs';
import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import nodemailer from 'nodemailer';
import winston from 'winston';
import 'winston-mongodb';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import session from 'express-session';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || '5-oy-imtihon-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// VIEWS SOZLAMASI - ASOSIY TUZATISH
app.set('view engine', 'ejs');
// "views" papkasiga o'zgartirildi (eski: "vlews")
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Agar views papkasi mavjud bo'lmasa, yaratamiz
const viewsDir = path.join(__dirname, 'views');
if (!fs.existsSync(viewsDir)) {
  fs.mkdirSync(viewsDir, { recursive: true });
  console.log('Views papkasi yaratildi:', viewsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/5-oy-imtihon')
  .then(() => console.log('MongoDB ulandi'))
  .catch(err => console.error('MongoDB ulanish xatosi:', err));

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'combined.log', level: 'info' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' })
  ]
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: true },
  verificationToken: String,
  resetToken: String,
  resetTokenExpiry: Date
});
const User = mongoose.model('User', userSchema);

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
const Category = mongoose.model('Category', categorySchema);

const machineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  tonirovka: String,
  motor: String,
  year: Number,
  color: String,
  distance: Number,
  gearbook: String,
  narxi: Number,
  rasm360ichki: String,
  rasm360tashqi: String,
  description: String,
  modeliRasm: String,
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
});
const Machine = mongoose.model('Machine', machineSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateAccessToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET || 'access-secret', { expiresIn: '15m' });
const generateRefreshToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET || 'refresh-secret', { expiresIn: '7d' });

// Auth middleware
const authMiddleware = async (req, res, next) => {
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

const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role !== 'admin') {
    return res.status(403).render('error', { message: 'Admin ruxsati talab qilinadi' });
  }
  next();
};

// Joi schemalar
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const forgotSchema = Joi.object({
  email: Joi.string().email().required()
});

const resetSchema = Joi.object({
  password: Joi.string().min(6).required()
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const categorySchemaJoi = Joi.object({
  name: Joi.string().min(3).max(50).required()
});

const machineSchemaJoi = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  category: Joi.string().required(),
  tonirovka: Joi.string().allow(''),
  motor: Joi.string().allow(''),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).allow(null),
  color: Joi.string().allow(''),
  distance: Joi.number().integer().min(0).allow(null),
  gearbook: Joi.string().allow(''),
  narxi: Joi.number().integer().min(0).allow(null),
  rasm360ichki: Joi.string().allow(''),
  rasm360tashqi: Joi.string().allow(''),
  description: Joi.string().allow(''),
  modeliRasm: Joi.string().allow('')
});

const adminSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).render('error', { message: error.details[0].message });
  }
  next();
};

// Error sahifasi uchun middleware - agar error.ejs mavjud bo'lmasa
app.use((req, res, next) => {
  res.renderError = (message) => {
    // Agar error.ejs mavjud bo'lmasa, oddiy HTML qaytaradi
    const errorViewPath = path.join(__dirname, 'views', 'error.ejs');
    if (fs.existsSync(errorViewPath)) {
      res.render('error', { message });
    } else {
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Xato</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #d32f2f; }
          </style>
        </head>
        <body>
          <h1>Xato</h1>
          <p>${message}</p>
          <a href="/">Bosh sahifaga qaytish</a>
        </body>
        </html>
      `);
    }
  };
  next();
});

// Routes
app.get('/', (req, res) => res.redirect('/login'));

// Login sahifasi
app.get('/login', (req, res) => {
  // Agar allaqachon login qilingan bo'lsa, main sahifaga yo'naltirish
  if (req.session.userId) {
    return res.redirect('/main');
  }
  res.render('login', { error: null });
});

// Register
app.get('/register', (req, res) => {
  // Agar allaqachon login qilingan bo'lsa, main sahifaga yo'naltirish
  if (req.session.userId) {
    return res.redirect('/main');
  }
  res.render('register', { error: null, success: null });
});

app.post('/register', (req, res) => {
  // Ro'yxatdan o'tish logikasi
  if (success) {
    // Muvaffaqiyatli ro'yxatdan o'tgandan so'ng bosh sahifaga yo'naltirish
    return res.redirect('/');
  } else {
    // Xatolik yuzaga kelsa, xatoni ko'rsatish
    return res.render('register', { error: 'Xatolik yuz berdi' });
  }
});

// Login
app.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.render('login', { error: 'Noto\'g\'ri ma\'lumotlar' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.render('login', { error: 'Noto\'g\'ri ma\'lumotlar' });

    req.session.userId = user._id;
    res.redirect('/main');

  } catch (err) {
    res.render('login', { error: err.message });
  }
});

// Main sahifa - RO'YXATDAN O'TGANLAR UCHUN
app.get('/main', authMiddleware, (req, res) => {
  res.render('main', { 
    title: 'Asosiy Sahifa',
    user: req.user 
  });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// Profile
app.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let adminData = {};
    
    if (req.user.role === 'admin') {
      adminData.categories = await Category.find({ createdBy: req.user._id });
      adminData.machines = await Machine.find({ createdBy: req.user._id }).populate('category');
    }
    
    res.render('profile', { user, adminData, isAdmin: req.user.role === 'admin', error: null, success: null });
  } catch (err) {
    res.renderError(err.message);
  }
});

// CHANGE-PASSWORD ROUTE
app.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // Validatsiya
    if (!oldPassword || !newPassword) {
      const userData = await User.findById(req.user._id).select('-password');
      let adminData = {};
      if (req.user.role === 'admin') {
        adminData.categories = await Category.find({ createdBy: req.user._id });
        adminData.machines = await Machine.find({ createdBy: req.user._id }).populate('category');
      }
      return res.render('profile', { 
        user: userData, 
        adminData, 
        isAdmin: req.user.role === 'admin',
        error: 'Barcha maydonlarni to\'ldiring', 
        success: null 
      });
    }

    if (newPassword.length < 6) {
      const userData = await User.findById(req.user._id).select('-password');
      let adminData = {};
      if (req.user.role === 'admin') {
        adminData.categories = await Category.find({ createdBy: req.user._id });
        adminData.machines = await Machine.find({ createdBy: req.user._id }).populate('category');
      }
      return res.render('profile', { 
        user: userData, 
        adminData, 
        isAdmin: req.user.role === 'admin',
        error: 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak', 
        success: null 
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    
    if (!isMatch) {
      const userData = await User.findById(req.user._id).select('-password');
      let adminData = {};
      if (req.user.role === 'admin') {
        adminData.categories = await Category.find({ createdBy: req.user._id });
        adminData.machines = await Machine.find({ createdBy: req.user._id }).populate('category');
      }
      return res.render('profile', { 
        user: userData, 
        adminData, 
        isAdmin: req.user.role === 'admin',
        error: 'Eski parol noto\'g\'ri', 
        success: null 
      });
    }

    // Yangi parolni hash qilish
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    const userData = await User.findById(req.user._id).select('-password');
    let adminData = {};
    if (req.user.role === 'admin') {
      adminData.categories = await Category.find({ createdBy: req.user._id });
      adminData.machines = await Machine.find({ createdBy: req.user._id }).populate('category');
    }

    res.render('profile', { 
      user: userData, 
      adminData, 
      isAdmin: req.user.role === 'admin',
      error: null, 
      success: 'Parol muvaffaqiyatli o\'zgartirildi' 
    });

  } catch (err) {
    console.error('Change password error:', err);
    const userData = await User.findById(req.user._id).select('-password');
    let adminData = {};
    if (req.user.role === 'admin') {
      adminData.categories = await Category.find({ createdBy: req.user._id });
      adminData.machines = await Machine.find({ createdBy: req.user._id }).populate('category');
    }
    res.render('profile', { 
      user: userData, 
      adminData, 
      isAdmin: req.user.role === 'admin',
      error: 'Xato: ' + err.message, 
      success: null 
    });
  }
});

// Mavjud foydalanuvchilarni tasdiqlash
app.get('/fix-users', async (req, res) => {
  try {
    const result = await User.updateMany(
      { isVerified: { $ne: true } },
      { $set: { isVerified: true } }
    );
    res.send(`✅ ${result.modifiedCount} ta foydalanuvchi tasdiqlandi`);
  } catch (err) {
    res.send('❌ Xato: ' + err.message);
  }
});

// Categories
app.get('/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.render('categories', { categories, isAdmin: req.user.role === 'admin', error: null });
  } catch (err) {
    res.renderError(err.message);
  }
});

app.post('/categories', authMiddleware, adminMiddleware, validate(categorySchemaJoi), async (req, res) => {
  try {
    const category = new Category({ ...req.body, createdBy: req.user._id });
    await category.save();
    res.redirect('/categories');
  } catch (err) {
    const categories = await Category.find().lean();
    res.render('categories', { categories, isAdmin: true, error: err.message });
  }
});

// Machines
app.get('/machines', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find().lean();
    const machines = await Machine.find({ status: 'available' }).populate('category').lean();
    res.render('machines', { machines, categories, isAdmin: req.user.role === 'admin', error: null, selectedCategory: null });
  } catch (err) {
    res.renderError(err.message);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Xato:', err.message);
  res.renderError('Server xatosi: ' + err.message);
});

// 404 handler
app.use((req, res) => {
  res.renderError('Sahifa topilmadi');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portda ishlamoqda`);
});