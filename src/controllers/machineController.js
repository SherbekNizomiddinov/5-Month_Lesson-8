const Car = require('../models/Machine');

exports.getCars = async (req, res) => {
  try {
    const cars = await Car.find().populate('category');
    res.render('cars', { cars });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createCar = async (req, res) => {
  try {
    const car = new Car(req.body);
    await car.save();
    res.redirect('/cars');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};