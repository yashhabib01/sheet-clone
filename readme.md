# Excel Sheet Clone

A powerful web-based spreadsheet application that mimics core Excel functionalities, built with React and Node.js.

## Live Demo

- Frontend: [https://sheet-clone-ruk3.vercel.app/](https://sheet-clone-ruk3.vercel.app/)
- Backend: [https://sheet-clone-zeta.vercel.app/](https://sheet-clone-zeta.vercel.app/)

## Overview

This project is a feature-rich spreadsheet application that provides users with Excel-like functionality in a web browser. It supports real-time data manipulation, formula calculations, cell formatting, and data validation.

## Technical Stack

### Frontend

- React with Vite
- Material-UI (MUI)
- date-fns for date handling

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- CORS for cross-origin support

## Features

### 1. Cell Management

- **Cell Selection**:
  - Single cell selection
  - Range selection with drag and drop
  - Formula-based cell selection
- **Cell Editing**:
  - Direct cell editing
  - Formula support
  - Auto-formatting
- **Row Operations**:
  - Insert row before/after
  - Delete row
  - Resize row height
  - Automatic data adjustment
  - Context menu support
- **Column Operations**:
  - Insert column before/after
  - Delete column
  - Resize column width
  - Automatic data reflow
  - Right-click menu access
- **Custom Dimensions**:
  - Adjustable row heights
  - Customizable column widths
  - Persistent dimension storage
  - Drag handle resizing
  - Double-click auto-fit

### 2. Formatting Options

- **Text Formatting**:
  - Bold, Italic, Underline
  - Font size adjustment (8px to 48px)
  - Text color customization
  - Text alignment (Left, Center, Right)
- **Cell Styling**:
  - Custom background colors
  - Border customization
  - Style persistence

### 3. Data Validation

- **Validation Types**:
  - Number validation
  - Date validation (dd/MM/yyyy format)
  - Email validation
  - Text validation
- **Visual Feedback**:
  - Red border for invalid data
  - Tooltip error messages
  - Validation type indicators

### 4. Data Operations

#### Single Cell Functions

- **Text Manipulation**:
  ```
  =TRIM(A1)    // Remove extra spaces
  =UPPER(A1)   // Convert to uppercase
  =LOWER(A1)   // Convert to lowercase
  ```

#### Range Functions

- **Mathematical Operations**:
  ```
  =SUM(A1:A10)      // Sum of range
  =AVERAGE(A1:A10)  // Average of range
  =MIN(A1:A10)      // Minimum value
  =MAX(A1:A10)      // Maximum value
  =COUNT(A1:A10)    // Count non-empty cells
  =MEDIAN(A1:A10)   // Median of range
  ```

#### Bulk Operations

- **Find & Replace**:
  - Range-based search
  - Bulk text replacement
  - Case-sensitive options
- **Remove Duplicates**:
  - Range-based duplicate removal
  - Maintains data integrity
  - Automatic reordering

### 5. Formula Support

- Basic arithmetic operations (+, -, \*, /)
- Cell reference support (A1, B2, etc.)
- Range-based functions
- Error handling with #ERROR! display

### 6. Save & Load

- **Auto Creation**:
  - New sheet generation
  - Default formatting
- **Data Persistence**:
  - Cell data storage
  - Format retention
  - Validation rules
  - Custom dimensions
- **Quick Access**:
  - Load existing sheets
  - Recent sheets list

### 7. Row & Column Management

#### Row Operations

```javascript
// Insert Row
- Right-click on row number
- Select "Insert Row Before" or "Insert Row After"
- All data below shifts down automatically
- Maintains formatting and formulas

// Delete Row
- Right-click on row number
- Select "Delete Row"
- All data below shifts up
- Updates all dependent formulas

// Resize Row
- Drag row border to resize
- Double-click for auto-fit
- Custom height input via dialog
- Minimum height protection
```

#### Column Operations

```javascript
// Insert Column
- Right-click on column header (A, B, C...)
- Choose "Insert Column Before/After"
- All data shifts right
- Preserves formatting and calculations

// Delete Column
- Right-click column header
- Select "Delete Column"
- All data shifts left
- Updates formula references

// Resize Column
- Drag column border
- Double-click for best-fit
- Numeric width input
- Maintains cell content visibility
```

#### Context Menu Features

- Right-click access for all operations
- Keyboard shortcuts support
- Undo/Redo capability
- Multiple selection support
- Visual feedback during operations

## Environment Setup

### Frontend Setup

```bash
# Clone the repository
git clone <repository-url>

# Navigate to frontend directory
cd client

# Install dependencies
npm install

# Create .env file
VITE_API_URL=https://sheet-clone-zeta.vercel.app/

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
PORT=5000
MONGODB_URI=<your-mongodb-uri>
CORS_ORIGIN=https://sheet-clone-ruk3.vercel.app/

# Start server
npm start
```

## API Documentation

### Sheet Operations

#### 1. Create New Sheet

```http
POST /api/sheets
Request:
{
  "name": "My Sheet"
}
Response:
{
  "_id": "sheet_id",
  "name": "My Sheet",
  "data": {},
  "cellStyles": {},
  "rowHeights": {},
  "columnWidths": {},
  "cellValidations": {}
}
```

#### 2. Get Sheet by ID

```http
GET /api/sheets/:id
Response:
{
  "_id": "sheet_id",
  "name": "Sheet Name",
  "data": {
    "A1": {
      "value": "Hello",
      "displayValue": "Hello"
    }
  },
  "cellStyles": {
    "A1": {
      "bold": true,
      "color": "#000000"
    }
  },
  "cellValidations": {
    "B1": "NUMBER"
  }
}
```

#### 3. Update Sheet

```http
PUT /api/sheets/:id
Request:
{
  "data": {},
  "cellStyles": {},
  "rowHeights": {},
  "columnWidths": {},
  "cellValidations": {}
}
Response:
{
  "message": "Sheet updated successfully",
  "sheet": {
    "_id": "sheet_id",
    ...updated data
  }
}
```

#### 4. Get All Sheets

```http
GET /api/sheets
Response:
[
  {
    "_id": "sheet_id",
    "name": "Sheet Name",
    "updatedAt": "2024-03-20T10:00:00.000Z"
  }
]
```

## Suggested Improvements

1. **Auto-Save Implementation**

   - Debounced save functionality
   - Save status indicators
   - Conflict resolution

2. **Formula Enhancement**

   - Complex formula support
   - Formula suggestions
   - Reference highlighting

3. **Collaboration Features**

   - Real-time editing
   - User presence
   - Change history

4. **Performance Optimization**

   - Virtual scrolling
   - Lazy loading
   - Optimized rendering

5. **Export/Import**

   - Excel compatibility
   - CSV support
   - PDF export

6. **Mobile Support**

   - Responsive design
   - Touch controls
   - Mobile features

7. **Data Analysis**
   - Charts/graphs
   - Pivot tables
   - Data filtering

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
