const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost/car-dealership', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB ga ulanildi');
  } catch (error) {
    console.error('MongoDB ulanish xatosi:', error);
    process.exit(1);
  }
};

module.exports = connectDB;