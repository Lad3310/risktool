import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Button, Box, Breadcrumbs, Link } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { LogoutOutlined } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

function Navbar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getBreadcrumbText = (path) => {
    switch(path) {
      case '/reports/settlement-fails':
        return 'Settlement Fails Report';
      case '/reports':
        return 'Reports';
      case '/analytics':
        return 'Analytics';
      case '/contact':
        return 'Contact';
      default:
        return 'Dashboard';
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: '#4ade80',
        width: '100%',
        '& .MuiToolbar-root': {
          minHeight: { xs: '56px', sm: '64px' },
          px: { xs: 1, sm: 1.5 }
        }
      }}
    >
      <Toolbar 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          minHeight: { xs: '56px', sm: '64px' },
          px: { xs: 1, sm: 2 }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          width: '100%',
          overflow: 'hidden'
        }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 1, display: { sm: 'none' } }}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          
          <Breadcrumbs 
            aria-label="breadcrumb" 
            sx={{ 
              color: 'white',
              '& .MuiBreadcrumbs-separator': {
                color: 'white',
                mx: { xs: 0.5, sm: 1 }
              },
              '& .MuiBreadcrumbs-ol': {
                flexWrap: 'nowrap'
              }
            }}
          >
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '1.25rem' },
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Settlement Risk Monitor
            </Typography>
            <Typography 
              variant="h6" 
              noWrap 
              component="div"
              sx={{ 
                fontSize: { xs: '0.85rem', sm: '1.25rem' },
                maxWidth: { xs: '200px', sm: 'none' },
                textOverflow: 'ellipsis'
              }}
            >
              {getBreadcrumbText(location.pathname)}
            </Typography>
          </Breadcrumbs>
        </Box>
        
        <IconButton
          sx={{
            color: 'white',
            ml: 1
          }}
          onClick={handleLogout}
        >
          <LogoutOutlined sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 