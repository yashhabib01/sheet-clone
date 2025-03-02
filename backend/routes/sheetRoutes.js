const express = require("express");
const router = express.Router();
const {
  createSheet,
  getSheetById,
  updateSheet,
  getAllSheets,
} = require("../controllers/sheetController");

// Create new sheet
router.post("/", createSheet);

// Get sheet by ID
router.get("/:id", getSheetById);

// Update sheet
router.put("/:id", updateSheet);

// Get all sheets
router.get("/", getAllSheets);

module.exports = router;
