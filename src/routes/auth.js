import express from "express";

const router = express.Router();

// login sahifa
router.post("/login", (req, res) => {
  const { username } = req.body;

  // oddiy misol sifatida
  req.session.user = { username };

  res.redirect("/");
});

router.get("/login", (req, res) => {
  res.render("auth/login", { error: null });
});

// POST - Login qilish
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // userni topamiz
  const user = await User.findOne({ username });
  if (!user) {
    return res.render("auth/login", { error: "Bunday foydalanuvchi topilmadi!" });
  }

  // parolni solishtiramiz
  if (user.password !== password) {
    return res.render("auth/login", { error: "Parol noto‘g‘ri!" });
  }

  // Agar hammasi to‘g‘ri bo‘lsa
  res.redirect("/cars"); // Login bo‘lgandan keyin qaysi sahifaga o‘tkazmoqchisan shu yerga yozasan
});

// register sahifa
router.get("/register", (req, res) => {
  res.render("auth/register", { error: null });
});

// POST - Register qilish
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // foydalanuvchi mavjudligini tekshirish
  const user = await User.findOne({ username });
  if (user) {
    return res.render("auth/register", { error: "Bunday foydalanuvchi allaqachon mavjud!" });
  }

  // yangi user yaratamiz
  await User.create({ username, password });

  // Register bo‘lgandan keyin login sahifasiga yo‘naltiramiz
  res.redirect("/login");
});


export default router;
