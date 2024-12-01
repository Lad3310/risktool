import React, { useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { usePerformanceData } from '../hooks/usePerformanceData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Analytics() {
  const { performanceData, assetAllocation, alerts, loading, error } = usePerformanceData();

  console.log('Analytics Component State:', {
    performanceData,
    assetAllocation,
    alerts,
    loading,
    error,
    hasData: {
      performance: Boolean(performanceData?.length),
      allocation: Boolean(assetAllocation?.length),
      alerts: Boolean(alerts?.length)
    }
  });

  useEffect(() => {
    console.log('Analytics Component Data:', {
      performanceData,
      assetAllocation,
      alerts,
      loading,
      error,
      performanceLength: performanceData?.length,
      allocationLength: assetAllocation?.length,
      alertsLength: alerts?.length
    });
  }, [performanceData, assetAllocation, alerts, loading, error]);

  console.log('Analytics Component Render:', {
    performanceData,
    assetAllocation,
    alerts,
    loading,
    error,
    hasData: {
      performance: Boolean(performanceData?.length),
      allocation: Boolean(assetAllocation?.length),
      alerts: Boolean(alerts?.length)
    }
  });

  if (assetAllocation?.length) {
    console.log('Sample Asset Allocation:', assetAllocation[0]);
  }
  if (performanceData?.length) {
    console.log('Sample Performance Data:', performanceData[0]);
  }
  if (alerts?.length) {
    console.log('Sample Alert:', alerts[0]);
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Error loading analytics data: {error}
      </Alert>
    );
  }

  const hasNoData = !performanceData?.length && !assetAllocation?.length && !alerts?.length;
  if (hasNoData) {
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        No analytics data available. Please check your database tables.
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, maxWidth: 1600, margin: '0 auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Analytics Dashboard</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Performance & VaR</Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              {performanceData?.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart data={performanceData}>
                    <XAxis dataKey="month" />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="portfolioValue"
                      stroke="#4287f5"
                      name="Portfolio Value"
                      dot={{ r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="var"
                      stroke="#ff964f"
                      name="Value at Risk"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="text.secondary">No performance data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Asset Allocation</Typography>
            <Box sx={{ height: 400 }}>
              {assetAllocation?.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      dataKey="percentage"
                      nameKey="asset_class"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label={({ asset_class, percentage }) => `${asset_class} ${percentage}%`}
                    >
                      {assetAllocation.map((entry) => (
                        <Cell 
                          key={`cell-${entry.asset_class}`} 
                          fill={entry.color_code}
                          stroke="white"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography color="text.secondary">No allocation data available</Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Recent Alerts</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {alerts?.length > 0 ? (
                alerts.map((alert, index) => (
                  <Box
                    key={index}
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      backgroundColor: alert.color,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: alert.textColor, fontWeight: 600 }}>
                        {alert.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: alert.textColor }}>
                        {alert.description}
                      </Typography>
                    </Box>
                    <Typography sx={{ color: alert.textColor }}>{alert.severity}</Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No alerts available</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics; 