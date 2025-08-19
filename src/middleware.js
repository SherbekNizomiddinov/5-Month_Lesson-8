// src/middleware.js

export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next(); // foydalanuvchi login bo‘lgan bo‘lsa, davom etadi
  } else {
    return res.redirect("/login"); // login qilmagan bo‘lsa, login sahifasiga yuboriladi
  }
}
