const winston = require('winston');
require('winston-mongodb');
require('dotenv').config(); // .env faylini o'qish

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: '../logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: '../logs/warning.log', level: 'warn' }),
    new winston.transports.MongoDB({
      db: process.env.MONGO_URI || 'mongodb://localhost:27017/car-dealership', // Default qiymat
      level: 'info',
      metaKey: 'meta',
      tryReconnect: true
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: '../logs/exceptions.log' })
  ]
});

logger.on('error', (err) => {
  console.error('Winston xatoligi:', err.message);
});

module.exports = logger;