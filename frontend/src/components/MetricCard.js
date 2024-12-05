import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

function MetricCard({ title, value, subtitle, loading, onClick, type }) {
  // Function to determine text color based on type
  const getValueColor = () => {
    switch (type) {
      case 'buy':
        return '#3b82f6'; // More vibrant blue (Tailwind blue-500)
        // Alternative modern blues:
        // '#0ea5e9' - Sky blue
        // '#6366f1' - Indigo
        // '#818cf8' - Modern blue with purple tint
      case 'sell':
        return '#ef4444'; // More vibrant red (Tailwind red-500)
        // Alternative modern reds:
        // '#f43f5e' - Modern pink-red
        // '#e11d48' - Rose red
        // '#f87171' - Lighter vibrant red
      default:
        return 'text.primary'; // Default color
    }
  };

  return (
    <Paper 
      sx={{ 
        p: 3, 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          ...onClick ? {
            backgroundColor: type === 'buy' 
              ? 'rgba(59, 130, 246, 0.08)'
              : type === 'sell' 
              ? 'rgba(239, 68, 68, 0.08)'
              : 'rgba(74, 222, 128, 0.08)',
            transform: 'translateY(-2px)',
          } : {},
          '& .drag-handle': {
            opacity: 1
          }
        },
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={onClick}
      elevation={1}
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
            color: 'primary.main'
          }
        }}
      >
        <DragIndicatorIcon />
      </Box>
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
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Paper>
  );
}

export default MetricCard; 