import React, { useMemo, useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts';
import { useTrades } from '../hooks/useTrades';
import TradesTable from './TradesTable';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import MetricCard from './MetricCard';
import { useAuth } from '../context/AuthContext';
import { Settings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
)

function Dashboard() {
  const { 
    trades, 
    loading, 
    error, 
    largestCounterpartyExposure, 
    largestCounterpartyTradeCount,
    topFails,
    unsettledByLocation,
    topFailCosts
  } = useTrades();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedFilter, setSelectedFilter] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const formatLargeNumber = (value) => {
    if (!value) return '$0';
    const isWholeNumber = value % 1 === 0;
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: isWholeNumber ? 0 : 2
    })}`;
  };

  const formatCurrency = (value) => {
    if (!value) return '$0';
    const isWholeNumber = value % 1 === 0;
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: isWholeNumber ? 0 : 2,
      maximumFractionDigits: isWholeNumber ? 0 : 2
    })}`;
  };

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

  // Replace the cardOrder state with two separate row states
  const [firstRowOrder, setFirstRowOrder] = useState(() => {
    const savedOrder = localStorage.getItem('dashboardFirstRowOrder');
    return savedOrder ? JSON.parse(savedOrder) : [
      'unsettledTrades',
      'mostActiveCounterparty',
      'largestExposure'
    ];
  });

  const [secondRowOrder, setSecondRowOrder] = useState(() => {
    const savedOrder = localStorage.getItem('dashboardSecondRowOrder');
    return savedOrder ? JSON.parse(savedOrder) : [
      'topFails',
      'settlementLocation',
      'largestCounterpartyExposure'
    ];
  });

  // Update localStorage effect
  useEffect(() => {
    localStorage.setItem('dashboardFirstRowOrder', JSON.stringify(firstRowOrder));
    localStorage.setItem('dashboardSecondRowOrder', JSON.stringify(secondRowOrder));
  }, [firstRowOrder, secondRowOrder]);

  // Update the handleDragEnd function
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceDroppableId = result.source.droppableId;
    const destinationDroppableId = result.destination.droppableId;

    // Only allow reordering within the same row
    if (sourceDroppableId !== destinationDroppableId) return;

    const currentOrder = sourceDroppableId === 'first-row' ? firstRowOrder : secondRowOrder;
    const setOrder = sourceDroppableId === 'first-row' ? setFirstRowOrder : setSecondRowOrder;

    const items = Array.from(currentOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setOrder(items);
  };

  // Define card components map
  const cardComponents = {
    unsettledTrades: (
      <MetricCard 
        title="Unsettled Trades"
        value={metrics.unsettledCount}
        subtitle="Total number of open trades"
        loading={loading}
        onClick={() => handleCardClick({ status: 'unsettled' })}
      />
    ),
    mostActiveCounterparty: (
      <MetricCard
        title="Most Active Counterparty"
        value={`${largestCounterpartyTradeCount.total} Trades`}
        subtitle={`${largestCounterpartyTradeCount.name} (Buy: ${largestCounterpartyTradeCount.buyCount}, Sell: ${largestCounterpartyTradeCount.sellCount})`}
      />
    ),
    largestExposure: (
      <MetricCard 
        title="Largest Exposure"
        value={
          <Typography 
            variant="h4" 
            sx={{ 
              wordBreak: 'break-word',
              fontSize: { xs: '1.2rem', sm: '1.5rem', md: '2rem' },
              whiteSpace: 'normal',
            }}
          >
            {formatLargeNumber(metrics.largestExposure)}
          </Typography>
        }
        subtitle="Largest counterparty exposure"
        loading={loading}
      />
    ),
    topFails: (
      <MetricCard
        title="Top 3 Largest Fails"
        value={
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            minHeight: '250px',
            gap: 2,
          }}>
            {topFails.map((fail, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 2,
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {fail.counterparty}
                  </Typography>
                  <Typography variant="body2" color="error.main" fontWeight="medium">
                    {formatCurrency(fail.amount)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        }
        subtitle="Largest failed trades by value"
      />
    ),
    largestCounterpartyExposure: (
      <MetricCard
        title="Counterparty Exposure"
        value={
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            minHeight: '250px',
          }}>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 2,
                wordBreak: 'break-word',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
              {formatLargeNumber(largestCounterpartyExposure.amount)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Counterparty: {largestCounterpartyExposure.name}
            </Typography>
            <Box sx={{ flex: 1 }}>
              {Object.entries(largestCounterpartyExposure.locationCounts).map(([location, count]) => {
                let bgColor = 'rgba(74, 222, 128, 0.08)';
                if (location === 'Fed') {
                  bgColor = 'rgba(239, 68, 68, 0.08)';
                } else if (location === 'DTC') {
                  bgColor = 'rgba(59, 130, 246, 0.08)';
                }
                
                return count > 0 ? (
                  <Box 
                    key={location}
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 1,
                      bgcolor: bgColor,
                      mb: 1
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {count} unsettled trades
                    </Typography>
                  </Box>
                ) : null;
              })}
            </Box>
          </Box>
        }
        subtitle="Largest counterparty exposure by value"
      />
    ),
    settlementLocation: (
      <MetricCard
        title="Settlement Location Exposure"
        value={
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            height: '100%',
            minHeight: '250px',
          }}>
            {unsettledByLocation.slice(0, 3).map((item, index) => {
              let bgColor = 'rgba(74, 222, 128, 0.08)';
              let hoverBgColor = 'rgba(74, 222, 128, 0.12)';
              
              if (item.location === 'Fed') {
                bgColor = 'rgba(239, 68, 68, 0.08)';
                hoverBgColor = 'rgba(239, 68, 68, 0.12)';
              } else if (item.location === 'DTC') {
                bgColor = 'rgba(59, 130, 246, 0.08)';
                hoverBgColor = 'rgba(59, 130, 246, 0.12)';
              }

              return (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 1,
                    bgcolor: bgColor,
                    mb: 2,
                    '&:hover': {
                      bgcolor: hoverBgColor
                    }
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.location}
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      {item.count} trades
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatCurrency(item.amount)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        }
        subtitle="Top 3 settlement locations by unsettled value"
      />
    ),
    settlementFailCosts: (
      <MetricCard
        title="Settlement Fail Costs"
        value={
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            minHeight: '250px'
          }}>
            {topFailCosts.map((item, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(239, 68, 68, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(239, 68, 68, 0.12)'
                  }
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.counterparty_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.fail_days} days • {item.trade_count} trades
                  </Typography>
                </Box>
                <Typography variant="body2" color="error" sx={{ fontWeight: 600 }}>
                  {formatCurrency(item.total_fail_cost)}
                </Typography>
              </Box>
            ))}
          </Box>
        }
        subtitle="Top counterparties by settlement fail costs"
        onClick={() => navigate('/reports/settlement-fails')}
      />
    ),
  };

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*');
      
      if (error) throw error;
      
      // Use the data here
      if (data) {
        // Do something with the data
        console.log('Trades fetched:', data.length);
      }
    } catch (error) {
      console.error('Error fetching trades:', error.message);
    }
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        mb: 2,
        px: { xs: 1.5, sm: 3 }
      }}>
        <Button
          startIcon={<Settings />}
          onClick={() => navigate('/settings/alerts')}
          variant="outlined"
        >
          Alert Settings
        </Button>
      </Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="first-row">
          {(provided) => (
            <Grid 
              container 
              spacing={2}
              sx={{ 
                mb: { xs: 3, sm: 4 },
                mx: 0,
                width: '100%',
                overflow: 'hidden',
                alignItems: 'stretch',
                px: { xs: 1.5, sm: 3 },
                '& .MuiPaper-root': {  // Ensure consistent shadow on all sides
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                  borderRadius: 1
                }
              }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {firstRowOrder.map((cardId, index) => (
                <Draggable key={cardId} draggableId={cardId} index={index}>
                  {(provided, snapshot) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      md={4}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Box 
                        {...provided.dragHandleProps}
                        sx={{
                          height: '100%',
                          transition: 'transform 0.2s',
                          transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
                        }}
                      >
                        {cardComponents[cardId]}
                      </Box>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>

        <Droppable droppableId="second-row">
          {(provided) => (
            <Grid 
              container 
              spacing={2}
              sx={{ 
                mb: { xs: 3, sm: 4 },
                mx: 0,
                width: '100%',
                overflow: 'hidden',
                alignItems: 'stretch',
                px: { xs: 1.5, sm: 3 },
                '& .MuiPaper-root': {  // Ensure consistent shadow on all sides
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                  borderRadius: 1
                }
              }}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {secondRowOrder.map((cardId, index) => (
                <Draggable key={cardId} draggableId={cardId} index={index}>
                  {(provided, snapshot) => (
                    <Grid 
                      item 
                      xs={12} 
                      sm={6} 
                      md={4}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <Box 
                        {...provided.dragHandleProps}
                        sx={{
                          height: '100%',
                          transition: 'transform 0.2s',
                          transform: snapshot.isDragging ? 'scale(1.02)' : 'none',
                        }}
                      >
                        {cardComponents[cardId]}
                      </Box>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

      {/* Counterparty Exposure Chart */}
      <Grid 
        container 
        spacing={1}
        sx={{ 
          mt: 0, 
          mx: 0,
          width: '100%',
          overflow: 'hidden',
          px: { xs: 1.5, sm: 3 }
        }}
      >
        <Grid item xs={12}>
          <Paper sx={{ 
            p: { xs: 1.5, sm: 3 }, 
            height: { xs: 300, sm: 400, md: 500 },
            display: 'flex',
            flexDirection: 'column',
            mb: { xs: 2, sm: 3 },
            overflow: 'hidden',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',  // Match the cards' shadow
            borderRadius: 1
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Counterparty Exposure
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="80%">
                <CircularProgress sx={{ color: '#3b82f6' }} />
              </Box>
            ) : metrics.exposureData.length > 0 ? (
              <Box sx={{ flex: 1, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={metrics.exposureData}
                    margin={{ 
                      top: 10, 
                      right: isMobile ? 10 : 20, 
                      left: isMobile ? 20 : 60, 
                      bottom: isMobile ? 60 : 20 
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
      </Grid>

      {/* Trades Table */}
      <Grid 
        container 
        spacing={1}
        sx={{ 
          mt: 0, 
          mx: 0,
          width: '100%',
          overflow: 'hidden',
          px: { xs: 1.5, sm: 3 }
        }}
      >
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