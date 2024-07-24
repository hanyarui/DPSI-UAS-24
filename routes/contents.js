const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { handleContentUpload } = require("../middleware/upload");
const { Contents } = require("../models");

// authenticate: Middleware ini memastikan bahwa pengguna telah diautentikasi sebelum mereka bisa mengakses rute. Ini biasanya memeriksa token JWT atau sesi login yang valid.
// authorize(["admin"]): Middleware ini memeriksa apakah pengguna memiliki peran tertentu (dalam hal ini, "admin") sebelum mengizinkan mereka mengakses rute tersebut. Ini berguna untuk memastikan bahwa hanya pengguna dengan hak akses yang sesuai yang dapat melakukan operasi tertentu, seperti membuat, memperbarui, atau menghapus konten.

// Route untuk membuat konten baru hanya dapat diakses oleh pengguna dengan role admin
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

// Route untuk mengambil data semua konten oleh semua pengguna
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

// Route untuk mengambil data dari konten tertentu berdasarkan ID konten oleh semua pengguna
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

// Route untuk mengambil data dari konten tertentu berdasarkan nama konten oleh semua pengguna
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

// Route untuk menghapus konten berdasarkan ID konten hanya dapat diakses oleh pengguna dengan role admin
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
