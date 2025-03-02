import { IconButton, Divider, Box, ButtonGroup, Select, MenuItem, InputLabel, FormControl, Button, Tooltip, TextField, Dialog, Typography, DialogTitle, DialogContent, DialogActions, FormControlLabel, RadioGroup, Radio } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
} from '@mui/icons-material';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FindReplaceIcon from '@mui/icons-material/FindReplace';
import RuleIcon from '@mui/icons-material/Rule';
import NumbersIcon from '@mui/icons-material/Numbers';
import SaveIcon from '@mui/icons-material/Save';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { useState } from 'react';
import styled from '@emotion/styled';
import { CircularProgress } from '@mui/material';

const FormulaInput = styled(TextField)({
  '& .MuiInputBase-root': {
    height: 28,
    fontSize: '14px',
    padding: '0 8px',
    backgroundColor: 'white',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#e0e0e0',
    },
    '&:hover fieldset': {
      borderColor: '#bdbdbd',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1a73e8',
    },
  },
});

const SpreadsheetToolbar = ({ 
  onFormatChange, 
  activeCellStyles = {}, 
  selectedRange,
  onRemoveDuplicates,
  onFindReplace,
  onSetValidation,
  onSetNumberFormat,
  activeCell,
  cellValue,
  onCellValueChange,
  onSave,
  isLoading
}) => {
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [validationDialog, setValidationDialog] = useState(false);
  const [validationType, setValidationType] = useState('text');

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 44, 48];
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#808080',
  ];

  const handleFormatClick = (formatType, value) => {
    onFormatChange(formatType, value);
  };

  
  
  const handleRemoveDuplicatesClick = () => {
    if (!selectedRange) {
      alert('Please select a range first');
      return;
    }
    onRemoveDuplicates(selectedRange);
  };

  const handleFindReplaceClick = () => {
    if (!selectedRange) {
      alert('Please select a range first');
      return;
    }
    onFindReplace();
  };

  const handleSetValidation = () => {
    if (!selectedRange) {
      alert('Please select a range first');
      return;
    }
    onSetValidation(selectedRange, validationType.toUpperCase());
    setValidationDialog(false);
  };

  return (
    <Box>
      {/* Top toolbar with formatting buttons */}
      <Box sx={{ 
        padding: 0.5,
        borderBottom: '1px solid #e0e0e0', 
        display: 'flex', 
        alignItems: 'center',
        gap: 0.5,
        backgroundColor: '#f8f9fa'
      }}>
        <Box display="flex" gap={1}>
          <ButtonGroup variant="outlined" size="small">
            <IconButton 
              onClick={() => handleFormatClick('bold')}
              color={activeCellStyles.bold ? "primary" : "default"}
              sx={{ 
                backgroundColor: activeCellStyles.bold ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }}
            >
              <FormatBold />
            </IconButton>
            <IconButton 
              onClick={() => handleFormatClick('italic')}
              color={activeCellStyles.italic ? "primary" : "default"}
              sx={{ 
                backgroundColor: activeCellStyles.italic ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }}
            >
              <FormatItalic />
            </IconButton>
            <IconButton 
              onClick={() => handleFormatClick('underline')}
              color={activeCellStyles.underline ? "primary" : "default"}
              sx={{ 
                backgroundColor: activeCellStyles.underline ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }}
            >
              <FormatUnderlined />
            </IconButton>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <ButtonGroup variant="outlined" size="small">
            <IconButton 
              onClick={() => handleFormatClick('alignLeft')}
              color={activeCellStyles.textAlign === 'left' ? "primary" : "default"}
              sx={{ 
                backgroundColor: activeCellStyles.textAlign === 'left' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }}
            >
              <FormatAlignLeft />
            </IconButton>
            <IconButton 
              onClick={() => handleFormatClick('alignCenter')}
              color={activeCellStyles.textAlign === 'center' ? "primary" : "default"}
              sx={{ 
                backgroundColor: activeCellStyles.textAlign === 'center' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }}
            >
              <FormatAlignCenter />
            </IconButton>
            <IconButton 
              onClick={() => handleFormatClick('alignRight')}
              color={activeCellStyles.textAlign === 'right' ? "primary" : "default"}
              sx={{ 
                backgroundColor: activeCellStyles.textAlign === 'right' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
              }}
            >
              <FormatAlignRight />
            </IconButton>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <FormControl size="small" sx={{ minWidth: 80, mx: 1 }}>
            <Select
              value={activeCellStyles.fontSize || 11}
              onChange={(e) => handleFormatClick('fontSize', e.target.value)}
              displayEmpty
            >
              {fontSizes.map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <ButtonGroup variant="outlined" size="small">
            <IconButton
              onClick={(e) => {
                const colorPicker = document.createElement('input');
                colorPicker.type = 'color';
                colorPicker.value = activeCellStyles.color || '#000000';
                colorPicker.addEventListener('change', (e) => {
                  handleFormatClick('color', e.target.value);
                });
                colorPicker.click();
              }}
              sx={{
                color: activeCellStyles.color || '#000000',
              }}
            >
              <FormatColorTextIcon />
            </IconButton>
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <ButtonGroup variant="outlined" size="small" sx={{ ml: 1 }}>
            {colors.map((color) => (
              <IconButton
                key={color}
                onClick={() => handleFormatClick('color', color)}
                sx={{
                  width: '24px',
                  height: '24px',
                  minWidth: '24px',
                  backgroundColor: color,
                  border: activeCellStyles.color === color ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: color,
                    opacity: 0.8,
                  },
                }}
              />
            ))}
          </ButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            ml: 'auto',
            mr: 1
          }}>
            <Tooltip title="Remove Duplicates">
              <Button
                variant="contained"
                size="small"
                onClick={handleRemoveDuplicatesClick}
                disabled={!selectedRange}
                startIcon={<DeleteSweepIcon sx={{ fontSize: 18 }} />}
                sx={{
                  backgroundColor: '#5c6bc0',
                  '&:hover': {
                    backgroundColor: '#3f51b5',
                  },
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none'
                }}
              >
                Duplicates
              </Button>
            </Tooltip>

            <Tooltip title="Find and Replace">
              <Button
                variant="contained"
                size="small"
                onClick={handleFindReplaceClick}
                disabled={!selectedRange}
                startIcon={<FindReplaceIcon sx={{ fontSize: 18 }} />}
                sx={{
                  backgroundColor: '#66bb6a',
                  '&:hover': {
                    backgroundColor: '#43a047',
                  },
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none'
                }}
              >
                Find
              </Button>
            </Tooltip>

            <Tooltip title="Set Cell Validation">
              <Button
                variant="contained"
                size="small"
                onClick={() => setValidationDialog(true)}
                disabled={!selectedRange}
                startIcon={<RuleIcon sx={{ fontSize: 18 }} />}
                sx={{
                  backgroundColor: '#ffa726',
                  '&:hover': {
                    backgroundColor: '#fb8c00',
                  },
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none'
                }}
              >
                Validate
              </Button>
            </Tooltip>

            <Tooltip title="Save Spreadsheet">
              <Button
                variant="contained"
                size="small"
                onClick={onSave}
                disabled={isLoading}
                startIcon={isLoading ? 
                  <CircularProgress size={16} color="inherit" /> : 
                  <SaveIcon sx={{ fontSize: 18 }} />
                }
                sx={{
                  backgroundColor: '#ef5350',
                  '&:hover': {
                    backgroundColor: '#e53935',
                  },
                  minWidth: 'auto',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&.Mui-disabled': {
                    backgroundColor: '#ef5350',
                    opacity: 0.7,
                    color: 'white'
                  }
                }}
              >
                {isLoading ? 'Saving' : 'Save'}
              </Button>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Formula bar */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '4px 8px',
        gap: 1,
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#f8f9fa'
      }}>
        <Box sx={{ 
          minWidth: 60,
          padding: '4px 8px',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          backgroundColor: 'white',
          fontSize: '14px',
          color: '#666'
        }}>
          {activeCell || ''}
        </Box>

        <FormulaInput
          size="small"
          value={cellValue || ''}
          onChange={(e) => onCellValueChange(e.target.value)}
          sx={{ flex: 1 }}
          placeholder="Enter cell value"
        />
      </Box>

      {/* Find and Replace Dialog */}
      <Dialog open={findReplaceOpen} onClose={() => setFindReplaceOpen(false)}>
        <Box sx={{ p: 2, minWidth: 300 }}>
          <Typography variant="h6" mb={2}>Find and Replace</Typography>
          <TextField
            fullWidth
            label="Find"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            margin="normal"
            size="small"
          />
          <TextField
            fullWidth
            label="Replace with"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            margin="normal"
            size="small"
          />
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setFindReplaceOpen(false)}>Cancel</Button>
            <Button 
              variant="contained"
              onClick={() => {
                onFindReplace(selectedRange, findText, replaceText);
                setFindReplaceOpen(false);
                setFindText('');
                setReplaceText('');
              }}
            >
              Replace All
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Validation Dialog */}
      <Dialog open={validationDialog} onClose={() => setValidationDialog(false)}>
        <DialogTitle>Set Cell Validation</DialogTitle>
        <DialogContent>
          <FormControl>
            <RadioGroup
              value={validationType}
              onChange={(e) => setValidationType(e.target.value)}
            >
              <FormControlLabel value="TEXT" control={<Radio />} label="Text" />
              <FormControlLabel value="NUMBER" control={<Radio />} label="Number" />
              <FormControlLabel value="EMAIL" control={<Radio />} label="Email" />
              <FormControlLabel value="DATE" control={<Radio />} label="Date" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValidationDialog(false)}>Cancel</Button>
          <Button onClick={handleSetValidation} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};



export default SpreadsheetToolbar; 