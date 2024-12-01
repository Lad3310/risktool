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
  const { 
    trades, 
    loading, 
    error, 
    largestCounterpartyExposure, 
    largestCounterpartyTradeCount,
    topFails 
  } = useTrades();
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
      .sort((a, b) => b[1] - a[1])
      .slice(0, isMobile ? 3 : undefined)
      .map(([name, value]) => ({
        name: isMobile ? name.slice(0, 6) + (name.length > 6 ? '..' : '') : name,
        value
      }));

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
  }, [trades, isMobile]);

  const handleCardClick = (filter) => {
    setSelectedFilter(filter);
    // Scroll to trades table
    document.getElementById('trades-table')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const formatCurrency = (value) => {
    // Format as full dollar amount with commas and 2 decimal places
    return value ? `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}` : '$0.00';
  };

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

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Largest Counterparty Exposure"
            value={formatCurrency(largestCounterpartyExposure.amount)}
            subtitle={`Counterparty: ${largestCounterpartyExposure.name}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Most Active Counterparty"
            value={`${largestCounterpartyTradeCount.total} Trades`}
            subtitle={`${largestCounterpartyTradeCount.name} (Buy: ${largestCounterpartyTradeCount.buyCount}, Sell: ${largestCounterpartyTradeCount.sellCount})`}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Top 3 Largest Fails"
            value={
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1,
                fontSize: '0.875rem',
                minHeight: '100px'
              }}>
                {topFails.map((fail, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'rgba(74, 222, 128, 0.08)',
                      '&:hover': {
                        bgcolor: 'rgba(74, 222, 128, 0.12)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        {fail.type} • {fail.quantity}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fail.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {fail.counterparty}
                      </Typography>
                      <Typography variant="body2" color="error.main" fontWeight="medium">
                        {formatCurrency(fail.amount)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                {topFails.length === 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    No failed trades
                  </Typography>
                )}
              </Box>
            }
            subtitle="Largest failed trades by value"
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
            p: { xs: 2, sm: 3 }, 
            height: { xs: 400, sm: 500 },
            display: 'flex',
            flexDirection: 'column',
            mb: 3
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
                    margin={{ 
                      top: 20, 
                      right: 20, 
                      left: isMobile ? 40 : 60, 
                      bottom: isMobile ? 80 : 20 
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      angle={isMobile ? -45 : 0}
                      textAnchor={isMobile ? "end" : "middle"}
                      height={isMobile ? 60 : 30}
                      interval={0}
                      tick={{ 
                        fontSize: isMobile ? 10 : 12,
                        dy: isMobile ? 10 : 0,
                        fill: '#64748b'
                      }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={{ stroke: '#e2e8f0' }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value / 1000000}M`}
                      width={60}
                    />
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