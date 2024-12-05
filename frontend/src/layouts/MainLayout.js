import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navigation from '../components/Navigation';

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
      }}
    >
      <CssBaseline />
      <Navigation mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          p: { xs: 0.5, sm: 1, md: 2 },
          mt: '64px',
          ml: { xs: 0, sm: '240px' },
          transition: 'margin 225ms cubic-bezier(0.0, 0, 0.2, 1) 0ms',
          overflowX: 'hidden',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          maxWidth: {
            sm: 'calc(100% - 240px)',
            xs: '100%'
          },
        }}
      >
        <Box
          sx={{
            maxWidth: '1200px',
            mx: 'auto',
            width: '100%',
            position: 'relative',
            px: { xs: 1, sm: 2 },
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout; 