// src/models/Car.js
import mongoose from "mongoose";

const carSchema = new mongoose.Schema({
  name: { type: String, required: true }, // masalan: "Malibu", "Cobalt"
  model: { type: mongoose.Schema.Types.ObjectId, ref: "Model", required: true }
});

export default mongoose.model("Car", carSchema);
