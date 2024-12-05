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
          pr: { xs: 2, sm: 12 },
          width: { sm: `calc(100% - ${240}px)` },
          ml: { sm: '240px' },
          mt: '64px',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default MainLayout; 