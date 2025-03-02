import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { evaluateFormula, findAndReplace, handleRemoveDuplicates } from '../utils/spreadsheetFunctions';
import ContextMenu from './ContextMenu';
import ResizeDialog from './ResizeDialog';
import FindReplaceDialog from './FindReplaceDialog';

const COLUMNS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
const ROWS = 100;
const DEFAULT_CELL_WIDTH = 100;
const DEFAULT_CELL_HEIGHT = 25;
const ROW_HEADER_WIDTH = 45;

const Cell = styled('div')(({ cellStyle, width, height }) => ({
  border: '1px solid #e0e0e0',
  padding: '0 4px',
  height: height || DEFAULT_CELL_HEIGHT,
  width: width || DEFAULT_CELL_WIDTH,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  userSelect: 'none',
  boxSizing: 'border-box',
  fontWeight: cellStyle?.bold ? 'bold' : 'normal',
  fontStyle: cellStyle?.italic ? 'italic' : 'normal',
  textDecoration: cellStyle?.underline ? 'underline' : 'none',
  fontSize: cellStyle?.fontSize ? `${cellStyle.fontSize}px` : '13px',
  color: cellStyle?.color || 'inherit',
  justifyContent: cellStyle?.textAlign === 'center' ? 'center' : 
                 cellStyle?.textAlign === 'right' ? 'flex-end' : 'flex-start',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}));

const HeaderCell = styled(Cell)({
  backgroundColor: '#f8f9fa',
  justifyContent: 'center',
  fontWeight: 500,
  fontSize: '12px',
  color: '#333',
});

const RowHeader = styled(HeaderCell)({
  width: ROW_HEADER_WIDTH,
  position: 'sticky',
  left: 0,
  zIndex: 2,
  backgroundColor: '#f8f9fa',
});

const GridContainer = styled(Box)({
  height: '100%',
  overflow: 'auto',
  position: 'relative',
  '&::-webkit-scrollbar': {
    width: 8,
    height: 8,
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: '#f1f1f1',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#bbb',
    borderRadius: 4,
    '&:hover': {
      backgroundColor: '#999',
    },
  },
});

const SimpleSpreadsheetGrid = ({
  data,
  cellStyles,
  onCellChange,
  activeCell,
  onCellSelect,
  onGridUpdate,
  cellValidations,
  isFormulaSelecting,
  setIsFormulaSelecting,
  formulaBarValue,
  onFormulaBarChange,
  showFindReplace,
  onFindReplaceComplete,
  onSelectionChange,
  rowHeights,
  columnWidths,
  onRowHeightChange,
  onColumnWidthChange
}) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [formulaSelectionStart, setFormulaSelectionStart] = useState(null);
  const [formulaSelectionEnd, setFormulaSelectionEnd] = useState(null);
  const [inputPosition, setInputPosition] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    open: false,
    position: null,
    isRow: false,
    index: null
  });
  const [resizeDialog, setResizeDialog] = useState({
    open: false,
    isRow: false,
    index: null,
    currentSize: null
  });
  
  const [findReplaceDialogOpen, setFindReplaceDialogOpen] = useState(false);
  const [allowRangeSelection, setAllowRangeSelection] = useState(true);

  

  // Handle selection changes
  useEffect(() => {
    if (selectionStart && selectionEnd) {
      onSelectionChange(`${selectionStart}:${selectionEnd}`);
    } else if (selectionStart) {
      onSelectionChange(selectionStart);
    } else {
      onSelectionChange(null);
    }
  }, [selectionStart, selectionEnd, onSelectionChange]);

  // Handle Find & Replace dialog visibility
  useEffect(() => {
    if (showFindReplace) {
      setFindReplaceDialogOpen(true);
    }
  }, [showFindReplace]);

  const getCellId = (col, row) => `${col}${row}`;

  const isInSelectionRange = (cellId) => {
    if (!selectionStart || !selectionEnd) return false;

    const startCol = selectionStart.match(/[A-Z]+/)[0];
    const startRow = parseInt(selectionStart.match(/\d+/)[0]);
    const endCol = selectionEnd.match(/[A-Z]+/)[0];
    const endRow = parseInt(selectionEnd.match(/\d+/)[0]);
    
    const currentCol = cellId.match(/[A-Z]+/)[0];
    const currentRow = parseInt(cellId.match(/\d+/)[0]);

    const minCol = String.fromCharCode(Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const maxCol = String.fromCharCode(Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    return (
      currentCol >= minCol &&
      currentCol <= maxCol &&
      currentRow >= minRow &&
      currentRow <= maxRow
    );
  };

  const isFormulaStart = (value) => {
    // Separate range-based and single-cell formulas
    const rangeFormulas = ['=sum(', '=average(', '=min(', '=max(', '=count(', '=median('];
    const singleCellFormulas = ['=trim(', '=upper(', '=lower('];
    
    const isRange = rangeFormulas.some(start => value.toLowerCase() === start);
    const isSingleCell = singleCellFormulas.some(start => value.toLowerCase() === start);
    
    return {
      isFormula: isRange || isSingleCell,
      allowRange: isRange
    };
  };

  const handleCellClick = (cellId) => {
    onCellSelect(cellId);
    setSelectionStart(cellId);
    setSelectionEnd(cellId);
  };

  const handleCellDoubleClick = (cellId) => {
    setEditingCell(cellId);
    setEditValue(data[cellId]?.value || '');
  };

  const handleMouseDown = (cellId, e) => {
    if (isFormulaSelecting) {
      e.preventDefault();
      setFormulaSelectionStart(cellId);
      setFormulaSelectionEnd(cellId);
      setEditValue(prev => {
        // For single-cell formulas, don't allow range selection
        if (!allowRangeSelection) {
          return prev + cellId + ')';
        }
        // For range formulas, continue with existing behavior
        const parts = prev.split(':');
        if (parts.length > 1 && parts[1].includes(cellId)) {
          return prev;
        }
        return prev + cellId;
      });
      
      // Immediately complete single-cell formulas
      if (!allowRangeSelection) {
        setIsFormulaSelecting(false);
        setFormulaSelectionStart(null);
        setFormulaSelectionEnd(null);
      }
      return;
    }

    setIsDragging(true);
    setSelectionStart(cellId);
    setSelectionEnd(cellId);
    onCellSelect(cellId);
  };

  const handleMouseEnter = (cellId) => {
    if (isDragging && !isFormulaSelecting) {
      setSelectionEnd(cellId);
    }
    
    if (isFormulaSelecting && formulaSelectionStart && allowRangeSelection) {
      setFormulaSelectionEnd(cellId);
      const range = `${formulaSelectionStart}:${cellId}`;
      setEditValue(prev => {
        const beforeCursor = prev.slice(0, inputPosition);
        const afterCursor = prev.slice(inputPosition).replace(/^[A-Z0-9:]*/, '');
        return beforeCursor + range + afterCursor;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (isFormulaSelecting) {
      setIsFormulaSelecting(false);
      setFormulaSelectionStart(null);
      setFormulaSelectionEnd(null);
      setEditValue(prev => prev.endsWith(')') ? prev : prev + ')');
    }
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setEditValue(newValue);
    
    const { isFormula, allowRange } = isFormulaStart(newValue);
    if (isFormula) {
      setIsFormulaSelecting(true);
      setInputPosition(e.target.selectionStart);
      setAllowRangeSelection(allowRange);
    } else {
      setIsFormulaSelecting(false);
      setAllowRangeSelection(true);
    }
  };

  const getCellDisplayValue = (cellId) => {
    const cellData = data[cellId]?.value;
    if (!cellData) return '';
    
    if (typeof cellData === 'string' && cellData.startsWith('=')) {
      return evaluateFormula(cellData, data);
    }
    return cellData;
  };

  const handleInputBlur = () => {
    if (editingCell) {
      onCellChange(editingCell, editValue);
      setEditingCell(null);
      setEditValue('');
      setIsFormulaSelecting(false);
      setFormulaSelectionStart(null);
      setFormulaSelectionEnd(null);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
      setEditValue('');
    }
  };

  const isInFormulaSelection = (cellId) => {
    if (!formulaSelectionStart || !formulaSelectionEnd) return false;

    const startCol = formulaSelectionStart.match(/[A-Z]+/)[0];
    const startRow = parseInt(formulaSelectionStart.match(/\d+/)[0]);
    const endCol = formulaSelectionEnd.match(/[A-Z]+/)[0];
    const endRow = parseInt(formulaSelectionEnd.match(/\d+/)[0]);
    
    const currentCol = cellId.match(/[A-Z]+/)[0];
    const currentRow = parseInt(cellId.match(/\d+/)[0]);

    const minCol = String.fromCharCode(Math.min(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const maxCol = String.fromCharCode(Math.max(startCol.charCodeAt(0), endCol.charCodeAt(0)));
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);

    return (
      currentCol >= minCol &&
      currentCol <= maxCol &&
      currentRow >= minRow &&
      currentRow <= maxRow
    );
  };

  const handleContextMenu = (e, isRow, index) => {
    e.preventDefault();
    setContextMenu({
      open: true,
      position: { x: e.clientX, y: e.clientY },
      isRow,
      index
    });
  };

  const handleDeleteRow = (index) => {
    const newData = {};
    const newStyles = { ...cellStyles };
    
    // Update data and styles
    Object.entries(data).forEach(([cellId, cellData]) => {
      const [col, row] = [cellId.match(/[A-Z]+/)[0], parseInt(cellId.match(/\d+/)[0])];
      if (row < index) {
        newData[cellId] = cellData;
      } else if (row > index) {
        const newCellId = `${col}${row - 1}`;
        newData[newCellId] = cellData;
        if (newStyles[cellId]) {
          newStyles[newCellId] = newStyles[cellId];
          delete newStyles[cellId];
        }
      }
    });

    // Update row heights
    const newRowHeights = {};
    Object.entries(rowHeights).forEach(([row, height]) => {
      if (parseInt(row) < index) {
        newRowHeights[row] = height;
      } else if (parseInt(row) > index) {
        newRowHeights[parseInt(row) - 1] = height;
      }
    });

    onRowHeightChange(null,newRowHeights);
    onGridUpdate(newData);
  };

  const handleDeleteColumn = (colIndex) => {
    const col = COLUMNS[colIndex];
    const newData = {};
    const newStyles = { ...cellStyles };
    
    Object.entries(data).forEach(([cellId, cellData]) => {
      const [currentCol, row] = [cellId.match(/[A-Z]+/)[0], cellId.match(/\d+/)[0]];
      if (currentCol < col) {
        newData[cellId] = cellData;
      } else if (currentCol > col) {
        const newCol = String.fromCharCode(currentCol.charCodeAt(0) - 1);
        const newCellId = `${newCol}${row}`;
        newData[newCellId] = cellData;
        if (newStyles[cellId]) {
          newStyles[newCellId] = newStyles[cellId];
          delete newStyles[cellId];
        }
      }
    });

    // Update column widths
    const newColumnWidths = {};
    Object.entries(columnWidths).forEach(([column, width]) => {
      if (column < col) {
        newColumnWidths[column] = width;
      } else if (column > col) {
        newColumnWidths[String.fromCharCode(column.charCodeAt(0) - 1)] = width;
      }
    });

    onColumnWidthChange(null,newColumnWidths);
    onGridUpdate(newData);
  };

  const handleInsertRow = (index, before = true) => {
    const insertAt = before ? index : index + 1;
    const newData = {};
    const newStyles = { ...cellStyles };
    
    Object.entries(data).forEach(([cellId, cellData]) => {
      const [col, row] = [cellId.match(/[A-Z]+/)[0], parseInt(cellId.match(/\d+/)[0])];
      if (row < insertAt) {
        newData[cellId] = cellData;
      } else {
        const newCellId = `${col}${row + 1}`;
        newData[newCellId] = cellData;
        if (newStyles[cellId]) {
          newStyles[newCellId] = newStyles[cellId];
          delete newStyles[cellId];
        }
      }
    });
   
    const newHeights = {};
    Object.entries(rowHeights).forEach(([row, height]) => {
      if (parseInt(row) < insertAt) {
        newHeights[row] = height;
      } else {
        newHeights[parseInt(row) + 1] = height;
      }
    });
    onRowHeightChange(null, newHeights);

    onGridUpdate(newData);
  };

  const handleInsertColumn = (colIndex, before = true) => {
    const col = COLUMNS[colIndex];
    const insertAt = before ? col : String.fromCharCode(col.charCodeAt(0) + 1);
    const newData = {};
    const newStyles = { ...cellStyles };
    
    Object.entries(data).forEach(([cellId, cellData]) => {
      const [currentCol, row] = [cellId.match(/[A-Z]+/)[0], cellId.match(/\d+/)[0]];
      if (currentCol < insertAt) {
        newData[cellId] = cellData;
      } else {
        const newCol = String.fromCharCode(currentCol.charCodeAt(0) + 1);
        const newCellId = `${newCol}${row}`;
        newData[newCellId] = cellData;
        if (newStyles[cellId]) {
          newStyles[newCellId] = newStyles[cellId];
          delete newStyles[cellId];
        }
      }
    });

    const newWidths = {};
    Object.entries(columnWidths).forEach(([column, width]) => {
      if (column < insertAt) {
        newWidths[column] = width;
      } else {
        newWidths[String.fromCharCode(column.charCodeAt(0) + 1)] = width;
      }
    });
    onColumnWidthChange(null, newWidths);


    onGridUpdate(newData);
  };

  const handleResize = (size) => {
    if (resizeDialog.isRow) {
      onRowHeightChange(resizeDialog.index, size);
    } else {
      onColumnWidthChange(COLUMNS[resizeDialog.index], size);
    }
    setResizeDialog({ open: false, isRow: false, index: null, currentSize: null });
  };

  const handleFindReplace = (range, findText, replaceText) => {
    const updatedData = findAndReplace(data, range, findText, replaceText);
    onGridUpdate(updatedData);
    onFindReplaceComplete();
  };

  const handleRemoveDuplicatesOperation = (range) => {
    const updatedData = handleRemoveDuplicates(range, data);
    onGridUpdate(updatedData);
  };

  const renderCell = (cellId) => {
    const isActive = cellId === activeCell;
    const isSelected = isInSelectionRange(cellId);
    const isInFormulaSelectionVar = isInFormulaSelection(cellId);
    const cellStyle = cellStyles[cellId];
    
    // Get row and column from cellId
    const col = cellId.match(/[A-Z]+/)[0];
    const row = parseInt(cellId.match(/\d+/)[0]);

    // Get custom width and height if set
    const width = columnWidths[col] || DEFAULT_CELL_WIDTH;
    const height = rowHeights[row] || DEFAULT_CELL_HEIGHT;

    return (
      <Cell
        key={cellId}
        cellStyle={cellStyle}
        width={width}
        height={height}
        onClick={() => handleCellClick(cellId)}
        onDoubleClick={() => handleCellDoubleClick(cellId)}
        onMouseDown={(e) => handleMouseDown(cellId, e)}
        onMouseEnter={() => handleMouseEnter(cellId)}
        style={{
          backgroundColor: isActive ? '#e8f0fe' : 
                          isInFormulaSelectionVar ? 'rgba(26, 115, 232, 0.2)' :
                          isSelected ? 'rgba(26, 115, 232, 0.1)' : 'white',
          outline: isActive ? '2px solid #1a73e8' : 
                  isInFormulaSelectionVar ? '2px solid rgba(26, 115, 232, 0.5)' : 'none',
          zIndex: isActive ? 1 : 'auto',
          cursor: isFormulaSelecting ? 'crosshair' : 'default',
        }}
      >
        {editingCell === cellId ? (
          <input
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              padding: '0',
              fontSize: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              fontStyle: 'inherit',
              textDecoration: 'inherit',
              color: 'inherit',
              textAlign: cellStyle?.textAlign || 'left',
              outline: 'none',
              backgroundColor: 'transparent',
            }}
            autoFocus
          />
        ) : (
          <span style={{ 
            width: '100%',
            textAlign: cellStyle?.textAlign || 'left',
            display: 'block' // Add this to ensure the span takes full width
          }}>
            {getCellDisplayValue(cellId)}
          </span>
        )}
      </Cell>
    );
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <>
      <GridContainer>
        <Box sx={{ display: 'inline-block', position: 'relative' }}>
          {/* Header row */}
          <Box sx={{ display: 'flex', position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#f8f9fa' }}>
            <HeaderCell style={{ width: ROW_HEADER_WIDTH }} />
            {COLUMNS.map((col, index) => (
              <HeaderCell 
                key={col}
                style={{ width: columnWidths[col] || DEFAULT_CELL_WIDTH }}
                onContextMenu={(e) => handleContextMenu(e, false, index)}
              >
                {col}
              </HeaderCell>
            ))}
          </Box>

          {/* Grid body */}
          {Array.from({ length: ROWS }, (_, rowIndex) => (
            <Box key={rowIndex} sx={{ display: 'flex' }}>
              <RowHeader 
                style={{ height: rowHeights[rowIndex + 1] || DEFAULT_CELL_HEIGHT }}
                onContextMenu={(e) => handleContextMenu(e, true, rowIndex + 1)}
              >
                {rowIndex + 1}
              </RowHeader>
              {COLUMNS.map(col => renderCell(getCellId(col, rowIndex + 1)))}
            </Box>
          ))}
        </Box>
      </GridContainer>

      <ContextMenu
        open={contextMenu.open}
        anchorPosition={contextMenu.position}
        onClose={() => setContextMenu({ open: false, position: null, isRow: false, index: null })}
        isRow={contextMenu.isRow}
        onDelete={() => contextMenu.isRow ? handleDeleteRow(contextMenu.index) : handleDeleteColumn(contextMenu.index)}
        onInsertBefore={() => contextMenu.isRow ? handleInsertRow(contextMenu.index, true) : handleInsertColumn(contextMenu.index, true)}
        onInsertAfter={() => contextMenu.isRow ? handleInsertRow(contextMenu.index, false) : handleInsertColumn(contextMenu.index, false)}
        onResize={() => setResizeDialog({
          open: true,
          isRow: contextMenu.isRow,
          index: contextMenu.index,
          currentSize: contextMenu.isRow ? 
            (rowHeights[contextMenu.index] || DEFAULT_CELL_HEIGHT) : 
            (columnWidths[COLUMNS[contextMenu.index]] || DEFAULT_CELL_WIDTH)
        })}
      />

      <ResizeDialog
        open={resizeDialog.open}
        onClose={() => setResizeDialog({ open: false, isRow: false, index: null, currentSize: null })}
        isRow={resizeDialog.isRow}
        onResize={handleResize}
        currentSize={resizeDialog.currentSize}
      />

      <FindReplaceDialog
        open={findReplaceDialogOpen}
        onClose={() => {
          setFindReplaceDialogOpen(false);
          onFindReplaceComplete();
        }}
        onFindReplace={handleFindReplace}
        selectedRange={selectionStart && selectionEnd ? `${selectionStart}:${selectionEnd}` : null}
      />
    </>
  );
};

export default SimpleSpreadsheetGrid; 