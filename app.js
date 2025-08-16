const express = require('express');
  const cookieParser = require('cookie-parser');
  const connectDB = require('./src/config/database.js');
  const logger = require('./src/config/winston.js');
  const authRoutes = require('./src/routes/auth.js');
  const categoryRoutes = require('./src/routes/category.js');
  const machineRoutes = require('./src/routes/machine.js');
  const profileRoutes = require('./src/routes/profile.js');

  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.set('view engine', 'ejs');
  app.use(express.static('public'));

  // DB ulanish
  connectDB();

  // Routes
  app.use('/auth', authRoutes);
  app.use('/admin/categories', categoryRoutes);
  app.use('/cars', machineRoutes);
  app.use('/profile', profileRoutes);

  // Asosiy sahifa
  app.get('/', (req, res) => {
    res.render('index', { user: req.user });
  });

  // Error handler
  app.use((err, req, res, next) => {
    logger.error(err.message);
    res.status(500).send('Server xatosi yuz berdi');
  });

  app.listen(3000, () => {
    console.log('Server 3000-portda ishga tushdi');
  });