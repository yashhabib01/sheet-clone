import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HeightIcon from '@mui/icons-material/Height';
import StraightenIcon from '@mui/icons-material/Straighten';
import FormatLineSpacingIcon from '@mui/icons-material/FormatLineSpacing';
import FindReplaceIcon from '@mui/icons-material/FindReplace';

const ContextMenu = ({ 
  open, 
  anchorPosition, 
  onClose, 
  isRow, 
  onDelete, 
  onInsertBefore, 
  onInsertAfter,
  onResize,
  onFindReplace,
  showFindReplace 
}) => {
  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        anchorPosition
          ? { top: anchorPosition.y, left: anchorPosition.x }
          : undefined
      }
    >
      <MenuItem onClick={() => { onInsertBefore(); onClose(); }}>
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Insert {isRow ? 'Row' : 'Column'} Before</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { onInsertAfter(); onClose(); }}>
        <ListItemIcon>
          <AddIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Insert {isRow ? 'Row' : 'Column'} After</ListItemText>
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => { onDelete(); onClose(); }}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete {isRow ? 'Row' : 'Column'}</ListItemText>
      </MenuItem>
      <MenuItem onClick={() => { onResize(); onClose(); }}>
        <ListItemIcon>
          {isRow ? <FormatLineSpacingIcon fontSize="small" /> : <StraightenIcon fontSize="small" />}
        </ListItemIcon>
        <ListItemText>Resize {isRow ? 'Row' : 'Column'}</ListItemText>
      </MenuItem>
      {showFindReplace && (
        <>
          <Divider />
          <MenuItem onClick={() => { onFindReplace(); onClose(); }}>
            <ListItemIcon>
              <FindReplaceIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Find and Replace</ListItemText>
          </MenuItem>
        </>
      )}
    </Menu>
  );
};

export default ContextMenu; 