const express = require("express");
const router = express.Router();
const { Users } = require("../models/index"); // Ensure correct import
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res, next) => {
  try {
    const { email, name, password, role } = req.body;
    console.log("Creating user:", email, role);
    const newUser = await Users.create({ email, name, password, role });
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      "your_jwt_secret",
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
