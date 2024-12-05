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
          p: { xs: 1, sm: 3 },
          width: '100%',
          ml: { xs: 0, sm: '240px' },
          mt: '64px',
          minHeight: '100vh',
          overflowX: 'hidden',
          maxWidth: {
            xs: '100%',
            sm: 'calc(100% - 240px)',
            md: '1200px'
          },
          mx: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout; 