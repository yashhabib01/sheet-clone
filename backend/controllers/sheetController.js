const Sheet = require("../schema/Sheet.js");

const getAllSheets = async (req, res) => {
  try {
    const sheets = await Sheet.find().sort({ updatedAt: -1 });
    res.status(200).json(sheets);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sheets",
      error: error.message,
    });
  }
};

// Create new sheet
const createSheet = async (req, res) => {
  try {
    const { name } = req.body;
    const newSheet = new Sheet({
      name: name || "Untitled Spreadsheet",
      // Other fields will use default empty values
    });

    const savedSheet = await newSheet.save();
    res.status(201).json(savedSheet);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating sheet", error: error.message });
  }
};

// Get sheet by ID
const getSheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const sheet = await Sheet.findById(id);

    if (!sheet) {
      return res.status(404).json({ message: "Sheet not found" });
    }

    res.status(200).json(sheet);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching sheet", error: error.message });
  }
};

// Update sheet
const updateSheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, cellStyles, rowHeights, columnWidths } = req.body;

    const updatedSheet = await Sheet.findByIdAndUpdate(
      id,
      {
        $set: {
          data: data || {},
          cellStyles: cellStyles || {},
          rowHeights: rowHeights || {},
          columnWidths: columnWidths || {},
        },
      },
      { new: true } // Return updated document
    );

    if (!updatedSheet) {
      return res.status(404).json({ message: "Sheet not found" });
    }

    res.status(200).json(updatedSheet);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating sheet", error: error.message });
  }
};

module.exports = {
  createSheet,
  getSheetById,
  updateSheet,
  getAllSheets,
};
