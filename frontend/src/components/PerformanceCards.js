import React from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePerformanceData } from '../hooks/usePerformanceData';

export default function PerformanceCards() {
  const { performanceData, assetAllocation, alerts, loading, error } = usePerformanceData();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, bgcolor: '#fee2e2', color: '#991b1b', borderRadius: 1 }}>
        <Typography>Error loading performance data: {error}</Typography>
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Performance & VaR</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceData}>
              <XAxis dataKey="month" />
              <YAxis 
                yAxisId="left" 
                orientation="left"
                tickFormatter={(value) => `$${value / 1000000}M`}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                tickFormatter={(value) => `$${value / 1000000}M`}
              />
              <Tooltip 
                formatter={(value) => `$${(value / 1000000).toFixed(2)}M`}
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
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Asset Allocation</Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Equities', value: 45, color: '#4287f5' },
                  { name: 'Fixed Income', value: 30, color: '#42d4a8' },
                  { name: 'Commodities', value: 15, color: '#ffd700' },
                  { name: 'Cash', value: 10, color: '#ff964f' }
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                startAngle={90}
                endAngle={450}
                label={({ name, value, cx, cy, midAngle, outerRadius }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius * 1.4;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={name === 'Equities' ? '#4287f5' : 
                            name === 'Fixed Income' ? '#42d4a8' :
                            name === 'Commodities' ? '#ffd700' : '#ff964f'}
                      textAnchor={x > cx ? 'start' : 'end'}
                      dominantBaseline="middle"
                    >
                      {`${name} ${value}%`}
                    </text>
                  );
                }}
              >
                {[
                  { name: 'Equities', color: '#4287f5' },
                  { name: 'Fixed Income', color: '#42d4a8' },
                  { name: 'Commodities', color: '#ffd700' },
                  { name: 'Cash', color: '#ff964f' }
                ].map((entry) => (
                  <Cell 
                    key={`cell-${entry.name}`} 
                    fill={entry.color}
                    stroke="white"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Alerts</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {alerts.map((alert, index) => (
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
          ))}
        </Box>
      </Paper>
    </>
  );
} 