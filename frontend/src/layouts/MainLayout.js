import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', backgroundColor: '#f8fafc', overflow: 'hidden' }}>
      <CssBaseline />
      <Navigation mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pl: { xs: 2, sm: 4 },
          pr: { 
            xs: 2,    // Mobile
            sm: 6,    // Tablet
            md: 8,    // Desktop
            lg: 12    // Large screens
          },
          width: { 
            xs: '100%',
            sm: `calc(100% - ${240}px)` 
          },
          ml: { 
            xs: 0,
            sm: '240px'
          },
          mt: '64px',
          minHeight: '100vh',
          overflowX: 'hidden',
          maxWidth: {
            xs: '100%',
            sm: 'calc(100% - 240px)',
            md: '1400px'  // Increased from 1200px
          },
          mx: 'auto',
          position: 'relative',
          '&::after': {  // Add padding element
            content: '""',
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: { xs: '16px', sm: '24px', md: '32px', lg: '48px' },
            backgroundColor: 'transparent'
          }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout; 