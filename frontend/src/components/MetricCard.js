import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

function MetricCard({ title, value, subtitle, loading, onClick }) {
  return (
    <Paper 
      sx={{ 
        p: 3, 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          backgroundColor: 'rgba(74, 222, 128, 0.08)',
          transform: 'translateY(-2px)',
        } : {},
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={onClick}
      elevation={1}
    >
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Paper>
  );
}

export default MetricCard; 