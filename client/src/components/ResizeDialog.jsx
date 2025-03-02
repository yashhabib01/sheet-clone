import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  TextField,
  Typography 
} from '@mui/material';
import { useState, useEffect } from 'react';

const ResizeDialog = ({ open, onClose, isRow, onResize, currentSize }) => {
  const [size, setSize] = useState('');
  
  const MIN_ROW_HEIGHT = 21;    // Google Sheets minimum
  const MAX_ROW_HEIGHT = 500;   // Google Sheets maximum
  const MIN_COLUMN_WIDTH = 30;  // Google Sheets minimum
  const MAX_COLUMN_WIDTH = 500; // Google Sheets maximum

  useEffect(() => {
    if (open) {
      setSize(currentSize.toString());
    }
  }, [open, currentSize]);

  const minSize = isRow ? MIN_ROW_HEIGHT : MIN_COLUMN_WIDTH;
  const maxSize = isRow ? MAX_ROW_HEIGHT : MAX_COLUMN_WIDTH;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Resize {isRow ? 'Row' : 'Column'}</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          Enter new {isRow ? 'height' : 'width'} in pixels:
        </Typography>
        <TextField
          type="number"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          fullWidth
          autoFocus
          inputProps={{
            min: minSize,
            max: maxSize
          }}
          helperText={`Min: ${minSize}px, Max: ${maxSize}px`}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={() => {
            onResize(parseInt(size));
          }}
          variant="contained"
          disabled={!size || isNaN(parseInt(size)) || parseInt(size) < minSize || parseInt(size) > maxSize}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResizeDialog; 