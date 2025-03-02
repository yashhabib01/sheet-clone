import { useState, useEffect } from 'react'
import { Box, Paper, ThemeProvider, createTheme, CircularProgress } from '@mui/material'
import './App.css'
import { evaluateFormula, DependencyGraph, spreadsheetFunctions, bulkUpdateCells, getRangeCells, handleRemoveDuplicates, findAndReplace } from './utils/spreadsheetFunctions'
import { useParams } from 'react-router-dom'
import { getSheetById, updateSheet } from './services/sheetService'
// Components will be imported here
import SpreadsheetToolbar from './components/SpreadsheetToolbar'

import SimpleSpreadsheetGrid from './components/SimpleSpreadsheetGrid'
import { format, isValid, parse } from 'date-fns'

function SpreadsheetPage() {
  const [activeCell, setActiveCell] = useState(null)
  const [spreadsheetData, setSpreadsheetData] = useState({})
  const [formulaBarValue, setFormulaBarValue] = useState('')
  const [cellStyles, setCellStyles] = useState({})
  const [dependencyGraph] = useState(new DependencyGraph())
  const [selectedRange, setSelectedRange] = useState(null)
  const [cellValue, setCellValue] = useState('');
  const [cellValidations, setCellValidations] = useState({});
  const [isFormulaSelecting, setIsFormulaSelecting] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [rowHeights, setRowHeights] = useState({});
  const [columnWidths, setColumnWidths] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams();

  // Add handlers for row and column dimensions
  const handleRowHeightChange = (rowIndex, height) => {
    setRowHeights(prev => ({
      ...prev,
      [rowIndex]: height
    }));
  };

  const handleColumnWidthChange = (colIndex, width) => {
    setColumnWidths(prev => ({
      ...prev,
      [colIndex]: width
    }));
  };

  const theme = createTheme({
    palette: {
      mode: 'light',
      background: {
        default: '#ffffff',
      },
    },
  });

  const evaluateFormula = (formula, cellId) => {
    try {
      const expression = formula.substring(1);
      
      // Handle REPLACE function
      if (expression.startsWith('REPLACE(')) {
        const match = expression.match(/^REPLACE\((.*?),(.*?),(.*?)\)$/);
        if (match) {
          const [_, range, searchText, replaceText] = match;
          const result = spreadsheetFunctions.REPLACE(
            range.trim(),
            searchText.trim(),
            replaceText.trim(),
            spreadsheetData
          );

          if (result.type === 'BULK_UPDATE') {
            const cells = getRangeCells(result.range);
            const updates = {};
            cells.forEach((cellId, index) => {
              updates[cellId] = {
                value: result.values[index],
                displayValue: result.values[index]
              };
            });

            setSpreadsheetData(prev => ({
              ...prev,
              ...updates
            }));
            return `Updated range: ${result.range}`;
          }
        }
      } 
      
      // Handle single cell functions (TRIM, UPPER, LOWER)
      const match = expression.match(/^(\w+)\((.*)\)$/);
      if (!match) return formula;

      const [_, functionName, reference] = match;
      const fn = spreadsheetFunctions[functionName.toUpperCase()];
      
      if (!fn) {
        throw new Error(`Unknown function: ${functionName}`);
      }

      const result = fn(reference.trim(), spreadsheetData);

      // Handle bulk updates for REMOVEDUPLICATES
      if (result && result.type === 'BULK_UPDATE') {
        const cells = getRangeCells(result.range);
        const updates = {};
       
        cells.forEach((cellId, index) => {
          updates[cellId] = {
            value: result.values[index],
            displayValue: result.values[index]
          };
        });

        setSpreadsheetData(prev => ({
          ...prev,
          ...updates
        }));
        return `Updated range: ${result.range}`;
      }

      // Return single value for TRIM, UPPER, LOWER
      return result;
    } catch (error) {
      console.error('Formula evaluation error:', error);
      return '#ERROR!';
    }
  };

  const handleFormulaBarChange = (value) => {
    setFormulaBarValue(value);
    setIsFormulaSelecting(value.startsWith('='));
    if (activeCell) {
      handleCellChange(activeCell, value);
    }
  };

  const handleCellChange = (cellId, value) => {
    setFormulaBarValue(value);
    setIsFormulaSelecting(value.startsWith('='));

    if (value.startsWith('=')) {
      try {
        const formulaResult = evaluateFormula(value, spreadsheetData);
        setSpreadsheetData(prev => ({
          ...prev,
          [cellId]: {
            value: value,
            displayValue: formulaResult
          }
        }));
      } catch (error) {
        setSpreadsheetData(prev => ({
          ...prev,
          [cellId]: {
            value: value,
            displayValue: '#ERROR!'
          }
        }));
      }
    } else {
      let displayValue = value;
      
      // Handle date formatting if the cell has date validation
      if (cellValidations[cellId] === 'DATE' && value) {
        displayValue = formatDateValue(value);
      }

      setSpreadsheetData(prev => ({
        ...prev,
        [cellId]: {
          value: value,
          displayValue: displayValue
        }
      }));
    }
  };

  const handleCellSelect = (cellId) => {
    setActiveCell(cellId);
    setCellValue(spreadsheetData[cellId]?.value || '');
    setFormulaBarValue(spreadsheetData[cellId]?.value || '');
  };

  const handleCellValueChange = (value) => {
    setCellValue(value);
    if (activeCell) {
      handleCellChange(activeCell, value);
    }
  };

  const handleFormatChange = (formatType, value) => {
    if (!activeCell) return;

    setCellStyles(prev => {
      const currentCellStyles = prev[activeCell] || {};
      
      switch(formatType) {
        case 'bold':
          return {
            ...prev,
            [activeCell]: { ...currentCellStyles, bold: !currentCellStyles.bold }
          };
        case 'italic':
          return {
            ...prev,
            [activeCell]: { ...currentCellStyles, italic: !currentCellStyles.italic }
          };
        case 'underline':
          return {
            ...prev,
            [activeCell]: { ...currentCellStyles, underline: !currentCellStyles.underline }
          };
        case 'alignLeft':
          return {
            ...prev,
            [activeCell]: { ...currentCellStyles, textAlign: 'left' }
          };
        case 'alignCenter':
          return {
            ...prev,
            [activeCell]: { ...currentCellStyles, textAlign: 'center' }
          };
        case 'alignRight':
          return {
            ...prev,
            [activeCell]: { ...currentCellStyles, textAlign: 'right' }
          };
        case 'fontSize':
          return {
            ...prev,
            [activeCell]: { ...currentCellStyles, fontSize: value }
          };
        case 'color':
          return {
            ...prev,
            [activeCell]: { ...currentCellStyles, color: value }
          };
        default:
          return prev;
      }
    });
  };

  const handleRemoveDuplicatesClick = (range) => {
    if (!range) {
      alert('Please select a range first');
      return;
    }
    
    const updatedData = handleRemoveDuplicates(range, spreadsheetData);
    setSpreadsheetData(updatedData);
  };

  const handleFindReplaceClick = () => {
    if (!selectedRange) {
      alert('Please select a range first');
      return;
    }
    setShowFindReplace(true);
  };

  useEffect(() => {
    if (showFindReplace) {
      setShowFindReplace(false);
    }
  }, [showFindReplace]);

  const handleGridUpdate = (newData) => {
    setSpreadsheetData(newData);
  };

  const handleSetValidation = (range, type) => {
    const [start, end] = range.split(':');
    const startCol = start.match(/[A-Z]+/)[0];
    const startRow = parseInt(start.match(/\d+/)[0]);
    const endCol = end.match(/[A-Z]+/)[0];
    const endRow = parseInt(end.match(/\d+/)[0]);

    const newValidations = { ...cellValidations };

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
        const cellId = `${String.fromCharCode(col)}${row}`;
        newValidations[cellId] = type;
        
        // Format existing data if it's a date validation
        if (type === 'DATE' && spreadsheetData[cellId]?.value) {
          const formattedDate = formatDateValue(spreadsheetData[cellId].value);
          setSpreadsheetData(prev => ({
            ...prev,
            [cellId]: {
              value: spreadsheetData[cellId].value,
              displayValue: formattedDate
            }
          }));
        }
      }
    }

    setCellValidations(newValidations);
  };

  const handleSetNumberFormat = (range) => {
    const [start, end] = range.split(':');
    const startCol = start.match(/[A-Z]+/)[0];
    const startRow = parseInt(start.match(/\d+/)[0]);
    const endCol = end.match(/[A-Z]+/)[0];
    const endRow = parseInt(end.match(/\d+/)[0]);

    const newValidations = { ...cellValidations };

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol.charCodeAt(0); col <= endCol.charCodeAt(0); col++) {
        const cellId = `${String.fromCharCode(col)}${row}`;
        newValidations[cellId] = 'NUMBER';
      }
    }

    setCellValidations(newValidations);
  };

  const handleSelectionChange = (range) => {
    setSelectedRange(range);
  };

  const formatDateForStorage = (data) => {
    const formattedData = {};
    
    Object.entries(data).forEach(([cellId, cellData]) => {
      if (cellValidations[cellId] === 'DATE' && cellData.value && !cellData.value.startsWith('=')) {
        // Format the date for storage while keeping the original input
        const displayValue = formatDateValue(cellData.value);
        formattedData[cellId] = {
          value: cellData.value,
          displayValue: displayValue
        };
      } else {
        formattedData[cellId] = cellData;
      }
    });
    
    return formattedData;
  };

  const formatDateValue = (value) => {
    if (!value) return '';
    
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    
    const dateFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'MM-dd-yyyy'];
    let date = null;
    
    for (const dateFormat of dateFormats) {
      date = parse(value, dateFormat, new Date());
      if (isValid(date)) break;
    }
    
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy');
    }
    
    return value;
  };

  useEffect(() => {
    const loadSheetData = async () => {
      try {
        setIsLoading(true);
        const sheet = await getSheetById(id);
        setSpreadsheetData(sheet.data || {});
        setCellStyles(sheet.cellStyles || {});
        setRowHeights(sheet.rowHeights || {});
        setColumnWidths(sheet.columnWidths || {});
        setCellValidations(sheet.cellValidations || {});
      } catch (error) {
        console.error('Error loading sheet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSheetData();
  }, [id]);

  const handleSave = async () => {
    console.log("Saving sheet...");
    try {
      setIsLoading(true);
      const formattedData = formatDateForStorage(spreadsheetData);
      await updateSheet(id, {
        data: formattedData,
        cellStyles,
        rowHeights,
        columnWidths,
        cellValidations,
      });
    } catch (error) {
      console.error('Error saving sheet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden' // Prevent double scrollbars
      }}>
        <SpreadsheetToolbar 
          onFormatChange={handleFormatChange}
          activeCellStyles={cellStyles[activeCell]}
          selectedRange={selectedRange}
          onRemoveDuplicates={handleRemoveDuplicatesClick}
          onFindReplace={handleFindReplaceClick}
          onSetValidation={handleSetValidation}
          onSetNumberFormat={handleSetNumberFormat}
          activeCell={activeCell}
          cellValue={cellValue}
          onCellValueChange={handleCellValueChange}
          onSave={handleSave}
          isLoading={isLoading}
        />
       
        
          <Box sx={{ 
            flex: 1,
            overflow: 'hidden',
            border: '1px solid #ddd'
          }}>
            <SimpleSpreadsheetGrid
              data={spreadsheetData}
              cellStyles={cellStyles}
              onCellChange={handleCellChange}
              activeCell={activeCell}
              onCellSelect={handleCellSelect}
              onGridUpdate={handleGridUpdate}
              cellValidations={cellValidations}
              isFormulaSelecting={isFormulaSelecting}
              setIsFormulaSelecting={setIsFormulaSelecting}
              formulaBarValue={formulaBarValue}
              onFormulaBarChange={handleFormulaBarChange}
              showFindReplace={showFindReplace}
              onFindReplaceComplete={() => setShowFindReplace(false)}
              onSelectionChange={handleSelectionChange}
              rowHeights={rowHeights}
              columnWidths={columnWidths}
              onRowHeightChange={handleRowHeightChange}
              onColumnWidthChange={handleColumnWidthChange}
            />
          </Box>
        
      </Box>
    </ThemeProvider>
  )
}

export default SpreadsheetPage
