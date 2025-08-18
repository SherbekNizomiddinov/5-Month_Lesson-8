import express from 'express';
import session from 'express-session';
import dotenv from 'dotenv';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';

dotenv.config();
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true }));

app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../views'));
app.use(express.static(join(__dirname, '../public')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/', authRoutes);
app.use('/cars', carRoutes);

app.get('/', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('index', { user: req.session.user });
});// Admin mashina qo'shish sahifasi
app.get('/cars/add', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.redirect('/login');
  }
  res.render('cars/add'); // views/cars/add.ejs sahifasini render qiladi
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
export default app;