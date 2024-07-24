const express = require("express");
const router = express.Router();
const { Users } = require("../models/index");
const { handleProfilePicUpload } = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");

router.post(
  "/uploadProfilePic",
  authenticate,
  handleProfilePicUpload,
  async (req, res, next) => {
    try {
      const user = await Users.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profilePic = req.file.firebaseUrl;
      await user.save();
      res.json({
        message: "Profile picture uploaded successfully",
        filePath: req.file.firebaseUrl,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
