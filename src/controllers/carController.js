import Car from '../models/Car.js';

export const listCars = async (req, res) => {
  const cars = await Car.find();
  res.render('cars/models', { cars });
};

export const filterCars = async (req, res) => {
  const { brand, minYear, maxYear, minPrice, maxPrice } = req.query;
  let filter = {};
  if (brand) filter.brand = brand;
  if (minYear || maxYear) filter.year = {};
  if (minYear) filter.year.$gte = Number(minYear);
  if (maxYear) filter.year.$lte = Number(maxYear);
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);

  const cars = await Car.find(filter);
  res.render('cars/filter', { cars });
};
