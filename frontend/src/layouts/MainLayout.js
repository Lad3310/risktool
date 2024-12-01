import React, { useState } from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Navbar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          p: 2,
          mt: 8,
          ml: { xs: 0, sm: 26 },
          width: { xs: '100%', sm: `calc(100% - 240px)` },
          backgroundColor: '#f5f5f5',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
}

export default MainLayout; 