const mongoose = require("mongoose");

const sheetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: "Untitled Spreadsheet",
    },
    data: {
      type: Object,
      default: {},
    },
    cellStyles: {
      type: Object,
      default: {},
    },
    rowHeights: {
      type: Object,
      default: {},
    },
    columnWidths: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Sheet", sheetSchema);
