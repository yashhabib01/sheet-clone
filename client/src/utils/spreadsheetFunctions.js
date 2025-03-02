// Helper to extract numeric values from cell references
const extractNumericValues = (range, data) => {
  return range
    .map((cellId) => {
      const value = data[cellId]?.value;
      return isNaN(value) ? null : Number(value);
    })
    .filter((val) => val !== null);
};

// Parse cell range like "A1:A5" into array of cell IDs
const parseCellRange = (rangeStr) => {
  const [start, end] = rangeStr.split(":");
  if (!end) return [start]; // Single cell

  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/\d+/)[0]);
  const endCol = end.match(/[A-Z]+/)[0];
  const endRow = parseInt(end.match(/\d+/)[0]);

  const cells = [];
  for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
    for (let row = startRow; row <= endRow; row++) {
      cells.push(`${String.fromCharCode(col)}${row}`);
    }
  }
  return cells;
};

export const evaluateRange = (range, data) => {
  // Convert range like "A1:A5" into array of cell values
  const [start, end] = range.split(":");

  if (!end) {
    // Single cell reference
    return [data[start]?.value || ""];
  }

  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/\d+/)[0]);
  const endCol = end.match(/[A-Z]+/)[0];
  const endRow = parseInt(end.match(/\d+/)[0]);

  const minCol = Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0));
  const maxCol = Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0));
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  const values = [];
  for (let col = minCol; col <= maxCol; col++) {
    for (let row = minRow; row <= maxRow; row++) {
      const cellId = `${String.fromCharCode(col)}${row}`;
      values.push(data[cellId]?.value || "");
    }
  }
  return values;
};

// Helper to extract numeric value from a cell or formula result
const getNumericValue = (value, data) => {
  if (typeof value === "number") return value;
  if (!value && value !== 0) return null;

  // If it's a formula, evaluate it first
  if (typeof value === "string" && value.startsWith("=")) {
    const result = evaluateFormula(value, data);
    return typeof result === "number" ? result : parseFloat(result) || null;
  }

  // Convert string to number
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

// Add this helper function for text operations
const getCellValue = (cellId, data) => {
  if (!cellId) return "";
  const value = data[cellId.trim()]?.value;

  // If it's a formula, evaluate it
  if (typeof value === "string" && value.startsWith("=")) {
    return evaluateFormula(value, data).toString();
  }

  return value?.toString() || "";
};

// Helper to get values from a range or comma-separated cells
const getValues = (input, data) => {
  if (input.includes(":")) {
    // Handle range (e.g., A1:B1)
    return getRangeValues(input, data);
  } else {
    // Handle comma-separated cells (e.g., A1,C1)
    return input
      .split(",")
      .map((cellId) => {
        const cellId_trimmed = cellId.trim();
        const value = data[cellId_trimmed]?.value;
        return getNumericValue(value, data);
      })
      .filter((val) => val !== null);
  }
};

// Helper to get values from a range of cells
const getRangeValues = (range, data) => {
  const [start, end] = range.split(":");
  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/\d+/)[0]);
  const endCol = end.match(/[A-Z]+/)[0];
  const endRow = parseInt(end.match(/\d+/)[0]);

  const minCol = String.fromCharCode(
    Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0))
  );
  const maxCol = String.fromCharCode(
    Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0))
  );
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  const values = [];

  for (let col = minCol.charCodeAt(0); col <= maxCol.charCodeAt(0); col++) {
    for (let row = minRow; row <= maxRow; row++) {
      const cellId = `${String.fromCharCode(col)}${row}`;
      const value = data[cellId]?.value;
      const numericValue = getNumericValue(value, data);
      if (numericValue !== null) {
        values.push(numericValue);
      }
    }
  }

  return values;
};

export const spreadsheetFunctions = {
  SUM: (input, data) => {
    const values = getValues(input, data);
    // Ensure we're doing numeric addition
    return values.reduce((acc, val) => Number(acc) + Number(val), 0);
  },

  AVERAGE: (input, data) => {
    const values = getValues(input, data);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => Number(acc) + Number(val), 0);
    return sum / values.length;
  },

  MIN: (input, data) => {
    const values = getValues(input, data);
    if (values.length === 0) return 0;
    return Math.min(...values.map(Number));
  },

  MAX: (input, data) => {
    const values = getValues(input, data);
    if (values.length === 0) return 0;
    return Math.max(...values.map(Number));
  },

  COUNT: (input, data) => {
    const values = getValues(input, data);
    return values.length;
  },

  MEDIAN: (input, data) => {
    const values = getValues(input, data);
    if (values.length === 0) return 0;

    const sorted = [...values].map(Number).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  },

  // New text functions
  TRIM: (input, data) => {
    if (!input.includes(",") && !input.includes(":")) {
      return getCellValue(input, data).trim();
    }
    const values = getValues(input, data);
    return values.map((val) => val.toString().trim()).join(" ");
  },

  UPPER: (input, data) => {
    if (!input.includes(",") && !input.includes(":")) {
      return getCellValue(input, data).toUpperCase();
    }
    const values = getValues(input, data);
    return values.map((val) => val.toString().toUpperCase()).join(" ");
  },

  LOWER: (input, data) => {
    if (!input.includes(",") && !input.includes(":")) {
      return getCellValue(input, data).toLowerCase();
    }
    const values = getValues(input, data);
    return values.map((val) => val.toString().toLowerCase()).join(" ");
  },

  // Range-based functions
  REMOVEDUPLICATES: (range, data) => {
    const values = evaluateRange(range, data);
    console.log("REMOVEDUPLICATES values:", new Set(values));
    return {
      type: "BULK_UPDATE",
      range: range,
      values: [...new Set(values)],
    };
  },

  REPLACE: (range, searchText, replaceText, data) => {
    searchText = searchText.replace(/^["']|["']$/g, "");
    replaceText = replaceText.replace(/^["']|["']$/g, "");

    const values = evaluateRange(range, data);
    const updatedValues = values.map((value) =>
      String(value).replace(new RegExp(searchText, "g"), replaceText)
    );

    return {
      type: "BULK_UPDATE",
      range: range,
      values: updatedValues,
    };
  },
};

// First export the function directly
export const evaluateFormula = (formula, data) => {
  if (!formula.startsWith("=")) return formula;

  try {
    const functionMatch = formula.match(/^=([A-Z]+)\((.*)\)$/);
    if (!functionMatch) return "#ERROR!";

    const [_, functionName, params] = functionMatch;
    const fn = spreadsheetFunctions[functionName];

    if (!fn) return "#INVALID!";
    return fn(params, data);
  } catch (error) {
    console.error("Formula evaluation error:", error);
    return "#ERROR!";
  }
};

// Export findAndReplace directly, remove duplicate export
export const findAndReplace = (data, range, findText, replaceText) => {
  if (!range || !findText || !data) return data;

  const [start, end] = range.split(":");
  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/\d+/)[0]);
  const endCol = end.match(/[A-Z]+/)[0];
  const endRow = parseInt(end.match(/\d+/)[0]);

  // Create a new data object to avoid mutating the original
  const newData = { ...data };

  // Ensure we iterate from min to max for both columns and rows
  const minCol = startCol <= endCol ? startCol : endCol;
  const maxCol = startCol <= endCol ? endCol : startCol;
  const minRow = startRow <= endRow ? startRow : endRow;
  const maxRow = startRow <= endRow ? endRow : startRow;

  // Iterate through the range
  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol.charCodeAt(0); col <= maxCol.charCodeAt(0); col++) {
      const cellId = `${String.fromCharCode(col)}${row}`;
      const cellData = data[cellId];

      // Skip if cell is empty
      if (!cellData) continue;

      // Get the cell value based on data structure
      const currentValue =
        typeof cellData === "object" ? cellData.value : cellData;

      // Skip if value is not a string or is a formula
      if (typeof currentValue !== "string" || currentValue.startsWith("=")) {
        continue;
      }

      // Perform the replacement
      const newValue = currentValue.replaceAll(findText, replaceText);

      // Only update if the value actually changed
      if (newValue !== currentValue) {
        // Preserve the original data structure
        if (typeof cellData === "object") {
          newData[cellId] = {
            ...cellData,
            value: newValue,
          };
        } else {
          newData[cellId] = newValue;
        }
      }
    }
  }

  return newData;
};

// Export other functions if needed
export const isFormulaStart = (value) => {
  // ... existing implementation ...
};

// Track cell dependencies
export class DependencyGraph {
  constructor() {
    this.dependencies = new Map();
    this.dependents = new Map();
  }

  addDependency(cell, dependsOn) {
    if (!this.dependencies.has(cell)) {
      this.dependencies.set(cell, new Set());
    }
    this.dependencies.get(cell).add(dependsOn);

    if (!this.dependents.has(dependsOn)) {
      this.dependents.set(dependsOn, new Set());
    }
    this.dependents.get(dependsOn).add(cell);
  }

  getDependents(cell) {
    return Array.from(this.dependents.get(cell) || []);
  }

  clearCellDependencies(cell) {
    if (this.dependencies.has(cell)) {
      for (const dep of this.dependencies.get(cell)) {
        this.dependents.get(dep)?.delete(cell);
      }
      this.dependencies.delete(cell);
    }
  }
}

// Add helper function to handle multiple cell updates
export const bulkUpdateCells = (range, newValues) => {
  const [start, end] = range.split(":");
  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/\d+/)[0]);
  const endCol = end ? end.match(/[A-Z]+/)[0] : startCol;
  const endRow = end ? parseInt(end.match(/\d+/)[0]) : startRow;

  const updates = {};
  let valueIndex = 0;

  for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
    for (let row = startRow; row <= endRow; row++) {
      const cellId = `${String.fromCharCode(col)}${row}`;
      if (valueIndex < newValues.length) {
        updates[cellId] = {
          value: newValues[valueIndex],
          displayValue: newValues[valueIndex],
        };
        valueIndex++;
      }
    }
  }

  return updates;
};

// Helper function to get all cells in a range
export const getRangeCells = (range) => {
  if (!range || !range.includes(":")) return [];

  const [start, end] = range.split(":");
  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/\d+/)[0]);
  const endCol = end.match(/[A-Z]+/)[0];
  const endRow = parseInt(end.match(/\d+/)[0]);

  const minCol = String.fromCharCode(
    Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0))
  );
  const maxCol = String.fromCharCode(
    Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0))
  );
  const minRow = Math.min(startRow, endRow);
  const maxRow = Math.max(startRow, endRow);

  const cells = [];
  for (let col = minCol.charCodeAt(0); col <= maxCol.charCodeAt(0); col++) {
    for (let row = minRow; row <= maxRow; row++) {
      cells.push(`${String.fromCharCode(col)}${row}`);
    }
  }
  return cells;
};

// Function to handle remove duplicates
export const handleRemoveDuplicates = (range, data) => {
  if (!range || !range.includes(":")) return data;

  // Parse the range
  const [start, end] = range.split(":");
  const startCol = start.match(/[A-Z]+/)[0];
  const startRow = parseInt(start.match(/\d+/)[0]);
  const endCol = end.match(/[A-Z]+/)[0];
  const endRow = parseInt(end.match(/\d+/)[0]);

  // Get all cells in the range
  const cells = [];
  for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
    for (let row = startRow; row <= endRow; row++) {
      cells.push(`${String.fromCharCode(col)}${row}`);
    }
  }

  // Group cells by column
  const columnGroups = {};
  cells.forEach((cellId) => {
    const col = cellId.match(/[A-Z]+/)[0];
    if (!columnGroups[col]) {
      columnGroups[col] = [];
    }
    columnGroups[col].push(cellId);
  });

  // Create a new data object
  const newData = { ...data };

  // Process each column separately
  Object.values(columnGroups).forEach((columnCells) => {
    // Get values for this column
    const seenValues = new Set();
    const duplicateCells = [];

    // Find duplicates
    columnCells.forEach((cellId) => {
      const value = data[cellId]?.value || "";
      if (seenValues.has(value)) {
        duplicateCells.push(cellId);
      } else {
        seenValues.add(value);
      }
    });

    // Clear duplicate cells
    duplicateCells.forEach((cellId) => {
      newData[cellId] = {
        value: "",
        displayValue: "",
      };
    });
  });

  return newData;
};
