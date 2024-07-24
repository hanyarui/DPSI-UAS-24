const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { handleContentUpload } = require("../middleware/upload");
const { Contents } = require("../models");

// Route to create a new content
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  handleContentUpload,
  async (req, res) => {
    try {
      const { wisataName, description, address, lat, lon, country } = req.body;
      const imageUrl = req.file ? req.file.firebaseUrl : null;

      const content = await Contents.create({
        wisataName,
        description,
        address,
        lat,
        lon,
        country,
        imageUrl, // Save the image URL in the database
      });

      res.status(201).json(content);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Route to get all contents
router.get("/", authenticate, async (req, res) => {
  try {
    const content = await Contents.findAll();
    if (content.length === 0) {
      res.status(404).json({ message: "Contents not found" });
    } else {
      res.json(content);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get a content by ID
router.get("/getById/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Contents.findByPk(id);
    if (!content) throw new Error("Content not found");
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get a content by name
router.get("/getByName/:wisataName", authenticate, async (req, res) => {
  try {
    const { wisataName } = req.params;
    const content = await Contents.findOne({ where: { wisataName } });
    if (!content) throw new Error("Content not found");
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update a content by ID
router.put(
  "/updateContent/:id",
  authenticate,
  authorize(["admin"]),
  handleContentUpload,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const content = await Contents.findByPk(id);
      if (!content) throw new Error("Content not found");

      // If a new image is uploaded, update the image URL
      if (req.file) {
        updates.imageUrl = req.file.firebaseUrl;
      }

      Object.keys(updates).forEach((key) => {
        content[key] = updates[key];
      });

      await content.save();
      res.json(content);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Route to delete a content by ID
router.delete(
  "/deleteContent/:id",
  authenticate,
  authorize(["admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const content = await Contents.findByPk(id);
      if (!content) throw new Error("Content not found");
      await content.destroy();
      res.sendStatus(204);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
