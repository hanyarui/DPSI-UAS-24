const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { Favorites } = require("../models");

// Route to create a new favorite
router.post("/", authenticate, async (req, res) => {
  try {
    const { email, wisataID, isFavorite } = req.body;
    const Favorite = await Favorites.create({
      email,
      wisataID,
      isFavorite,
    });
    res.status(201).json(Favorite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to get all favorite
router.get("/", authenticate, async (req, res) => {
  try {
    const Favorite = await Favorites.findAll();
    if (Favorite.length === 0) {
      res.status(404).json({ message: "Favorites not found" });
    } else {
      res.json(Favorite);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get favorites by email
router.get("/byEmail/:email", authenticate, async (req, res) => {
  try {
    const { email } = req.params;
    const favorites = await Favorites.findAll({ where: { email } });
    if (favorites.length === 0) {
      res.status(404).json({ message: "No favorites found for this email" });
    } else {
      res.json(favorites);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a favorites by ID
router.delete("/deleteFavorite/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const Favorite = await Favorites.findByPk(id);
    if (!Favorite) throw new Error("Favorite not found");
    await Favorite.destroy();
    res.sendStatus(204);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
