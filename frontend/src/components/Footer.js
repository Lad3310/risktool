import React from 'react';
import { Box, Container, Link, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Footer() {
  const menuItems = [
    { text: 'Documentation', path: '/docs' },
    { text: 'Guides', path: '/guides' },
    { text: 'Help', path: '/help' },
    { text: 'Contact Sales', path: '/contact' },
    { text: 'Blog', path: '/blog' },
    { text: 'Changelog', path: '/changelog' },
    { text: 'Pricing', path: '/pricing' },
    { text: 'Enterprise', path: '/enterprise' },
    { text: 'Legal', path: '/legal' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        bgcolor: '#f8fafc',
        borderTop: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 2,
        boxShadow: '0 -1px 3px rgba(0,0,0,0.05)'
      }}
    >
      <Container maxWidth={false}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2.5,
          px: { xs: 2, sm: 3 },
          gap: 2,
          overflowX: 'auto',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none'
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 3, sm: 4 }, 
            alignItems: 'center',
            flexWrap: 'nowrap'
          }}>
            {menuItems.map((item) => (
              <Link
                key={item.text}
                component={RouterLink}
                to={item.path}
                sx={{
                  color: '#64748b',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem',
                  fontFamily: 'Inter',
                  fontWeight: 500,
                  '&:hover': { 
                    color: '#4ade80',
                    transition: 'color 0.2s ease-in-out'
                  },
                }}
              >
                {item.text}
              </Link>
            ))}
          </Box>
          <Box sx={{ 
            color: '#64748b',
            whiteSpace: 'nowrap',
            fontSize: '0.875rem',
            fontFamily: 'Inter',
            fontWeight: 500
          }}>
            © 2024
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;