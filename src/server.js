import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

// Routelar
import authRoutes from "./routes/auth.js";
import carRoutes from "./routes/cars.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// __dirname olish (ESM uchun)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static fayllar
app.use(express.static(path.join(__dirname, "public")));

// Session sozlamalari
app.use(
  session({
    secret: "sirli-kalit",
    resave: false,
    saveUninitialized: false,
  })
);

// EJS sozlash
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routelarni ulash
app.use("/auth", authRoutes);   // login, register
app.use("/cars", carRoutes);    // add, filter, models, index
app.use("/admin", adminRoutes); // dashboard

// Bosh sahifa
app.get("/", (req, res) => {
  res.render("cars/index", { title: "Bosh sahifa", user: req.session.user });
});

// Serverni ishga tushirish
app.listen(3000, () => {
  console.log("✅ Server http://localhost:3000 da ishlayapti");
});
