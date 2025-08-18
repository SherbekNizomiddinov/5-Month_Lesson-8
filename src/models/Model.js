// src/models/Model.js
import mongoose from "mongoose";

const modelSchema = new mongoose.Schema({
  name: { type: String, required: true }, // masalan: "Chevrolet", "BMW"
});

export default mongoose.model("Model", modelSchema);
