import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  AppBar,
} from '@mui/material';

// Import icons
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import MoneyOffOutlinedIcon from '@mui/icons-material/MoneyOffOutlined';
import { LogoutOutlined } from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';

const drawerWidth = {
  xs: 200,
  sm: 240,
};

export default function Navigation({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getBreadcrumbText = (path) => {
    switch(path) {
      case '/reports/settlement-fails':
        return 'Fail Charges Report';
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

  const menuItems = [
    { text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { text: 'Reports', path: '/reports', icon: <AssessmentIcon /> },
    { text: 'Analytics', path: '/analytics', icon: <AnalyticsIcon /> },
    { text: 'Fail Charges', path: '/reports/settlement-fails', icon: <MoneyOffOutlinedIcon /> },
    { text: 'Contact', path: '/contact', icon: <ContactSupportIcon /> }
  ];

  const drawer = (
    <div>
      <Toolbar />
      <List sx={{ p: 0 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text} 
            disablePadding 
            sx={{ 
              display: 'block',
              backgroundColor: location.pathname === item.path ? '#ecfdf5' : 'transparent',
            }}
          >
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{
                minHeight: 48,
                pl: 2,
                pr: 2,
                position: 'relative',
                ...(item.indent && {
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: '24px',
                    top: '50%',
                    width: '12px',
                    height: '1px',
                    backgroundColor: location.pathname === item.path ? '#4ade80' : '#94a3b8',
                  }
                }),
                '&:hover': {
                  backgroundColor: location.pathname === item.path 
                    ? '#ecfdf5'
                    : 'rgba(74, 222, 128, 0.04)',
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path ? '#4ade80' : '#64748b',
                  minWidth: 36,
                  ml: item.indent ? 2 : 0,
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.4rem',
                  }
                },
                '& .MuiListItemText-primary': {
                  color: location.pathname === item.path ? '#4ade80' : '#64748b',
                  fontWeight: location.pathname === item.path ? 500 : 400,
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: '#4ade80',
          width: '100%',
        }}
      >
        <Toolbar 
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 48,
            px: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ 
                display: { sm: 'none' },
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
            
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontSize: '1rem',
                color: 'white',
              }}
            >
              Settlement Risk Monitor / {getBreadcrumbText(location.pathname)}
            </Typography>
          </Box>
          
          <IconButton
            color="inherit"
            onClick={handleLogout}
            sx={{ 
              padding: 1,
            }}
          >
            <LogoutOutlined fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ 
          width: { xs: drawerWidth.xs, sm: drawerWidth.sm },
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: drawerWidth.xs, sm: drawerWidth.sm },
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#fff',
            '& .MuiListItemButton-root': {
              transition: 'all 0.15s ease',
            }
          }
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              backgroundColor: '#fff',
            },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              backgroundColor: '#fff',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
} 