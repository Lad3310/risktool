import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

function MetricCard({ title, value, subtitle, loading, onClick, type }) {
  // Function to determine text color based on type
  const getValueColor = () => {
    switch (type) {
      case 'buy':
        return '#3b82f6';
      case 'sell':
        return '#ef4444';
      default:
        return 'text.primary';
    }
  };

  return (
    <Paper 
      sx={{ 
        p: { xs: 1.5, sm: 2 },
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05) !important',
        borderRadius: 1,
        '&:hover': {
          backgroundColor: type === 'buy' 
            ? 'rgba(59, 130, 246, 0.08)'
            : type === 'sell' 
            ? 'rgba(239, 68, 68, 0.08)'
            : 'rgba(59, 130, 246, 0.08)',
          transform: 'translateY(-2px)',
          '& .drag-handle': {
            opacity: 1
          }
        },
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={onClick}
      elevation={0}
    >
      <Box 
        className="drag-handle"
        sx={{ 
          position: 'absolute',
          top: 8,
          right: 8,
          opacity: 0,
          transition: 'opacity 0.2s',
          cursor: 'grab',
          color: 'text.secondary',
          '&:hover': {
            color: '#3b82f6'
          },
          zIndex: 1
        }}
      >
        <DragIndicatorIcon />
      </Box>
      
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="h6" 
          color={type ? getValueColor() : 'text.secondary'} 
          gutterBottom
          sx={{ 
            fontWeight: 600,
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {typeof value === 'string' || typeof value === 'number' ? (
            <Typography 
              variant="h4" 
              component="div" 
              gutterBottom
              sx={{ 
                color: getValueColor(),
                fontWeight: type ? 700 : 'inherit',
                letterSpacing: '-0.5px'
              }}
            >
              {value}
            </Typography>
          ) : (
            value
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto' }}>
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
}

export default MetricCard; 