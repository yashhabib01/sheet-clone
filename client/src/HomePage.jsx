import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  IconButton, 
  Divider,
  Button,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DescriptionIcon from '@mui/icons-material/Description';
import { getAllSheets, createSheet } from './services/sheetService';

function HomePage() {
  const [sheets, setSheets] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadSheets();
  }, []);

  const loadSheets = async () => {
    try {
      const data = await getAllSheets();
      setSheets(data);
    } catch (error) {
      console.error('Error loading sheets:', error);
    }
  };

  const handleCreateSheet = async () => {
    try {
      const newSheet = await createSheet("Untitled spreadsheet");
      navigate(`/sheet/${newSheet._id}`);
    } catch (error) {
      console.error('Error creating sheet:', error);
    }
  };

  const handleMenuOpen = (event, sheet) => {
    setAnchorEl(event.currentTarget);
    setSelectedSheet(sheet);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSheet(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid #e0e0e0',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            height: 64 
          }}>
            <Typography variant="h6" sx={{ color: '#202124' }}>
              Sheets
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        {/* Start a new spreadsheet section */}
        <Typography variant="h6" sx={{ mb: 2 }}>Start a new spreadsheet</Typography>
        <Box sx={{ mb: 4 }}>
          <Card 
            sx={{ 
              width: 160, 
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
            onClick={handleCreateSheet}
          >
            <Box sx={{ 
              height: 160, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid #e0e0e0',
            }}>
              <AddIcon sx={{ fontSize: 40, color: '#1a73e8' }} />
            </Box>
            <CardContent sx={{ py: 1 }}>
              <Typography variant="body2">Blank</Typography>
            </CardContent>
          </Card>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Recent spreadsheets */}
        <Typography variant="h6" sx={{ mb: 2 }}>Recent spreadsheets</Typography>
        <Grid container spacing={2}>
          {sheets.map((sheet) => (
            <Grid item key={sheet._id}>
              <Card sx={{ 
                width: 200,
                '&:hover': { boxShadow: 3 }
              }}>
                <Box 
                  sx={{ 
                    height: 160, 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f8f9fa',
                    border: '1px solid #e0e0e0',
                  }}
                  onClick={() => navigate(`/sheet/${sheet._id}`)}
                >
                  <DescriptionIcon sx={{ fontSize: 40, color: '#1a73e8' }} />
                </Box>
                <CardContent sx={{ 
                  py: 1,
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Tooltip title={sheet.name}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 500,
                          maxWidth: 140,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {sheet.name}
                      </Typography>
                    </Tooltip>
                    <Typography 
                      variant="caption" 
                      sx={{ color: '#5f6368' }}
                    >
                      {formatDate(sheet.updatedAt)}
                    </Typography>
                  </Box>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleMenuOpen(e, sheet)}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sheet options menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {
            navigate(`/sheet/${selectedSheet?._id}`);
            handleMenuClose();
          }}>
            Open
          </MenuItem>
          {/* Add more menu items as needed */}
        </Menu>
      </Container>
    </Box>
  );
}

export default HomePage;
