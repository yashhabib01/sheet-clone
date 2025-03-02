import { AppBar, Toolbar, IconButton, Divider, Box, ButtonGroup, Select, MenuItem, InputLabel, FormControl, Button, Tooltip, TextField, Dialog, Typography } from '@mui/material';
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

  return (
    <Box>
      {/* Top toolbar with formatting buttons */}
      <Box sx={{ 
        padding: 1, 
        borderBottom: '1px solid #e0e0e0', 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
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

          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleRemoveDuplicatesClick}
            size="small"
            disabled={!selectedRange}
          >
            Remove Duplicates
          </Button>

          <Button
            variant="outlined"
            startIcon={<FindReplaceIcon />}
            onClick={handleFindReplaceClick}
            size="small"
            disabled={!selectedRange}
          >
            Find & Replace
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          <Button
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={onSave}
            disabled={isLoading}
            size="small"
            color="primary"
          >
            {isLoading ? 'Loading...' : 'Save'}
          </Button>

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
    </Box>
  );
};

export default SpreadsheetToolbar; 