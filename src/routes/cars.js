import express from "express";
import { isAuthenticated } from "../middleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.render("cars/index", { title: "Cars" });
});

router.get("/add", isAuthenticated, (req, res) => {
  res.render("cars/add", { title: "Add Car" });
});

router.get("/filter", isAuthenticated, (req, res) => {
  res.render("cars/filter", { title: "Filter Cars" });
});

router.get("/models", isAuthenticated, (req, res) => {
  res.render("cars/models", { title: "Car Models" });
});

export default router;
