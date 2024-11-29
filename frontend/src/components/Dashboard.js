import React, { useMemo, useState } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { useTrades } from '../hooks/useTrades';
import TradesTable from './TradesTable';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MetricCard from './MetricCard';

function Dashboard() {
  const { trades, loading, error } = useTrades();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedFilter, setSelectedFilter] = useState(null);

  const metrics = useMemo(() => {
    if (!trades?.length) return {
      unsettledCount: 0,
      totalValue: 0,
      exposureData: [],
      largestExposure: 0,
      buyCount: 0,
      sellCount: 0,
      buyValue: 0,
      sellValue: 0
    };

    const unsettledTrades = trades.filter(t => 
      t.settlement_status?.toLowerCase() === 'unsettled' || 
      !t.settlement_status
    );

    // Calculate total value using net_money for more accuracy
    const totalValue = unsettledTrades.reduce((sum, trade) => 
      sum + (Math.abs(trade.net_money) || 0), 0);

    // Calculate counterparty exposure
    const counterpartyExposure = unsettledTrades.reduce((acc, trade) => {
      const value = Math.abs(trade.net_money) || 0;
      const counterparty = trade.counterparty_name || 'Unknown';
      acc[counterparty] = (acc[counterparty] || 0) + value;
      return acc;
    }, {});

    const exposureData = Object.entries(counterpartyExposure)
      .map(([name, value]) => ({
        name,
        value
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending

    // Add buy/sell metrics
    const buyTrades = unsettledTrades.filter(t => t.buy_sell_indicator?.toLowerCase() === 'buy');
    const sellTrades = unsettledTrades.filter(t => t.buy_sell_indicator?.toLowerCase() === 'sell');
    
    const buyValue = buyTrades.reduce((sum, trade) => sum + Math.abs(trade.net_money || 0), 0);
    const sellValue = sellTrades.reduce((sum, trade) => sum + Math.abs(trade.net_money || 0), 0);

    return {
      unsettledCount: unsettledTrades.length,
      totalValue,
      exposureData,
      largestExposure: exposureData[0]?.value || 0,
      buyCount: buyTrades.length,
      sellCount: sellTrades.length,
      buyValue,
      sellValue
    };
  }, [trades]);

  const handleCardClick = (filter) => {
    setSelectedFilter(filter);
    // Scroll to trades table
    document.getElementById('trades-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const formatCurrency = (value) => 
    value ? `$${(value / 1000000).toFixed(2)}M` : '$0.00M';

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid 
        container 
        spacing={{ xs: 1, sm: 2 }} 
        sx={{ 
          p: { xs: 1, sm: 1 },
          maxWidth: 1600,
          margin: '0 auto',
          width: '100%'
        }}
      >
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard 
            title="Unsettled Trades"
            value={metrics.unsettledCount}
            subtitle="Total number of open trades"
            loading={loading}
            onClick={() => handleCardClick({ status: 'unsettled' })}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard 
            title="Total Exposure"
            value={formatCurrency(metrics.totalValue)}
            subtitle="Total value of unsettled trades"
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard 
            title="Largest Exposure"
            value={formatCurrency(metrics.largestExposure)}
            subtitle="Largest counterparty exposure"
            loading={loading}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <MetricCard 
            title="Buy Trades"
            value={`${metrics.buyCount} (${formatCurrency(metrics.buyValue)})`}
            subtitle="Number and value of unsettled buy trades"
            loading={loading}
            onClick={() => handleCardClick({ type: 'Buy' })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <MetricCard 
            title="Sell Trades"
            value={`${metrics.sellCount} (${formatCurrency(metrics.sellValue)})`}
            subtitle="Number and value of unsettled sell trades"
            loading={loading}
            onClick={() => handleCardClick({ type: 'Sell' })}
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ 
            p: { xs: 1, sm: 2, md: 3 }, 
            height: { xs: 300, sm: 400 },
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Counterparty Exposure
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="80%">
                <CircularProgress sx={{ color: '#4ade80' }} />
              </Box>
            ) : metrics.exposureData.length > 0 ? (
              <Box sx={{ flex: 1, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metrics.exposureData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 8 }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                    <Bar 
                      dataKey="value" 
                      fill="#4ade80" 
                      name="Exposure" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="80%">
                <Typography color="text.secondary">No exposure data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <TradesTable 
            trades={trades} 
            initialFilter={selectedFilter} 
            id="trades-table"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 