import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField,
  Box
} from '@mui/material';
import { useState, useEffect } from 'react';

const FindReplaceDialog = ({ open, onClose, onFindReplace, selectedRange }) => {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFindText('');
      setReplaceText('');
    }
  }, [open]);

  const handleReplace = () => {
    if (!findText || !selectedRange) return;
    onFindReplace(selectedRange, findText, replaceText);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Find and Replace</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Find"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            size="small"
            fullWidth
            autoFocus
          />
          <TextField
            label="Replace with"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            size="small"
            fullWidth
          />
          {selectedRange && (
            <Box sx={{ color: 'text.secondary' }}>
              Selected Range: {selectedRange}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleReplace} 
          variant="contained" 
          disabled={!findText || !selectedRange}
        >
          Replace All
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FindReplaceDialog; 