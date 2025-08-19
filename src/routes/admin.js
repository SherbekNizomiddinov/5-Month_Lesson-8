import express from "express";
import { isAuthenticated } from "../middleware.js";

const router = express.Router();

router.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("admin/dashboard", { title: "Admin Dashboard" });
});

export default router;
