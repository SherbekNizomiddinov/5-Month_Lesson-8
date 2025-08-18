import express from "express";
import Car from "../models/Car.js";

const router = express.Router();

// Barcha modellari listini ko'rsatish
router.get("/models", isAuthenticated, async (req, res) => {
  const brands = await Car.aggregate([
    { $group: { _id: "$brand", cars: { $push: "$$ROOT" } } }
  ]);
  res.render("cars/models", { brands });
});

// Bitta modelga oid mashinalarni ko'rsatish
router.get("/models/:brand", isAuthenticated, async (req, res) => {
  const brand = req.params.brand;
  const cars = await Car.find({ brand });
  res.render("cars/brand", { brand, cars });
});

// Admin mashina qo'shish sahifasi
router.get("/add", isAuthenticated, (req, res) => {
  res.render("cars/add");
});

// Mashina qo'shish POST
router.post("/add", isAuthenticated, async (req, res) => {
  const { brand, model, year, price, image } = req.body;
  await Car.create({ brand, model, year, price, image });
  res.redirect("/cars/models");
});

export default router;
