const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { Visits, Contents } = require("../models");
const { Op } = require("sequelize");

// Create or update a visit
router.post("/", authenticate, async (req, res) => {
  const { wisataID, listVisitor, visitDate } = req.body;

  try {
    // Validate visitors are registered users
    const validVisitors = await Users.findAll({
      where: {
        email: {
          [Op.in]: listVisitor,
        },
      },
    });

    if (validVisitors.length !== listVisitor.length) {
      return res
        .status(400)
        .json({ message: "Some visitors are not registered users." });
    }

    // Check if a visit with the same wisataID and visitDate exists
    const existingVisit = await Visits.findOne({
      where: {
        wisataID,
        visitDate: {
          [Op.eq]: new Date(visitDate),
        },
      },
    });

    if (existingVisit) {
      // Merge new visitors with existing list
      const existingVisitors = existingVisit.listVisitor;
      const updatedVisitors = [
        ...new Set([...existingVisitors, ...listVisitor]),
      ];
      existingVisit.listVisitor = updatedVisitors;
      await existingVisit.save();
      res.status(200).json(existingVisit);
    } else {
      // Create a new visit entry
      const newVisit = await Visits.create({
        wisataID,
        listVisitor,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
      });
      res.status(201).json(newVisit);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all visits
router.get("/", authenticate, async (req, res) => {
  try {
    const allVisits = await Visits.findAll({
      include: [{ model: Contents }],
    });
    res.status(200).json(allVisits);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get visits by date
router.get("/by-date/:date", authenticate, async (req, res) => {
  const { date } = req.params;
  try {
    const visitByDate = await Visits.findAll({
      where: {
        visitDate: {
          [Op.eq]: new Date(date),
        },
      },
      include: [{ model: Contents }],
    });
    res.status(200).json(visitByDate);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get visits by week
router.get("/by-week/:week", authenticate, async (req, res) => {
  const { week } = req.params;
  const startOfWeek = new Date(week);
  const endOfWeek = new Date(week);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  try {
    const visitByWeek = await Visits.findAll({
      where: {
        visitDate: {
          [Op.between]: [startOfWeek, endOfWeek],
        },
      },
      include: [{ model: Contents }],
    });
    res.status(200).json(visitByWeek);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get visits by month
router.get("/by-month/:month", authenticate, async (req, res) => {
  const { month } = req.params;
  const startOfMonth = new Date(month);
  const endOfMonth = new Date(
    startOfMonth.getFullYear(),
    startOfMonth.getMonth() + 1,
    0
  );

  try {
    const visitByMonth = await Visits.findAll({
      where: {
        visitDate: {
          [Op.between]: [startOfMonth, endOfMonth],
        },
      },
      include: [{ model: Contents }],
    });
    res.status(200).json(visitByMonth);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get visits by year
router.get("/by-year/:year", authenticate, async (req, res) => {
  const { year } = req.params;
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);

  try {
    const visitByYear = await Visits.findAll({
      where: {
        visitDate: {
          [Op.between]: [startOfYear, endOfYear],
        },
      },
      include: [{ model: Contents }],
    });
    res.status(200).json(visitByYear);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
