import React, { useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { usePerformanceData } from '../hooks/usePerformanceData';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useTrades } from '../hooks/useTrades';

function formatCurrency(value) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value}`;
}

function formatMonth(dateString) {
  if (typeof dateString === 'string' && ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].includes(dateString)) {
    return dateString;
  }
  
  const date = new Date(dateString);
  if (date.toString() === 'Invalid Date') {
    return dateString;
  }
  
  return date.toLocaleString('default', { month: 'short' });
}

function getUniqueMonthData(data) {
  // Create a map to store the latest entry for each month
  const monthMap = new Map();
  
  // Process data in reverse to keep the latest entry for each month
  [...data].reverse().forEach(entry => {
    const month = entry.month;
    if (!monthMap.has(month)) {
      monthMap.set(month, entry);
    }
  });
  
  // Convert map back to array and reverse to maintain chronological order
  return Array.from(monthMap.values()).reverse().slice(-6);
}

function Analytics() {
  const { performanceData, assetAllocation, alerts, loading, error } = usePerformanceData();
  const { trades, largestCounterpartyExposure, largestCounterpartyTradeCount } = useTrades();

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

  useEffect(() => {
    if (performanceData?.length) {
      console.log('Date format check:', performanceData[0].month);
    }
  }, [performanceData]);

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
            <Box sx={{ height: { xs: 300, sm: 400 }, width: '100%' }}>
              {performanceData?.length > 0 ? (
                <ResponsiveContainer>
                  <LineChart 
                    data={getUniqueMonthData(performanceData)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="month" 
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="left" 
                      orientation="left"
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right"
                      tickFormatter={formatCurrency}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      labelStyle={{ fontSize: 12 }}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Legend 
                      verticalAlign="top" 
                      height={36}
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="portfolioValue"
                      stroke="#4287f5"
                      name="Portfolio Value"
                      dot={{ r: 3 }}
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="var"
                      stroke="#ff964f"
                      name="Value at Risk"
                      dot={{ r: 3 }}
                      strokeWidth={2}
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
            <Box sx={{ height: { xs: 300, sm: 400 } }}>
              {assetAllocation?.length > 0 ? (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      dataKey="percentage"
                      nameKey="asset_class"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      label={({ asset_class, percentage, cx, cy, midAngle, innerRadius, outerRadius }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius * 1.2;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill="#666"
                            textAnchor={x > cx ? 'start' : 'end'}
                            dominantBaseline="central"
                            style={{ fontSize: '12px' }}
                          >
                            {`${asset_class} ${percentage}%`}
                          </text>
                        );
                      }}
                      labelLine={false}
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
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
                    />
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