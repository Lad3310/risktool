import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topFailCosts, setTopFailCosts] = useState([]);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        console.log('Fetching trades...');

        // First get the total count
        const { count, error: countError } = await supabase
          .from('trades')
          .select('*', { count: 'exact', head: true });

        if (countError) throw countError;
        console.log('Total trades in database:', count);

        // Calculate number of pages needed (1000 records per page)
        const pageSize = 1000;
        const pages = Math.ceil(count / pageSize);
        let allData = [];

        // Fetch all pages
        for (let i = 0; i < pages; i++) {
          const from = i * pageSize;
          const to = from + pageSize - 1;
          
          const { data: pageData, error } = await supabase
            .from('trades')
            .select('*')
            .range(from, to)
            .order('settlement_date', { ascending: false });

          if (error) throw error;
          allData = [...allData, ...pageData];
        }

        console.log('Raw trades count:', allData.length);
        console.log('Goldman Sachs trades count:', 
          allData.filter(t => t.counterparty_name?.toLowerCase() === 'goldman sachs'?.toLowerCase()).length
        );
        console.log('Citadel trades count:', 
          allData.filter(t => t.counterparty_name?.toLowerCase() === 'citadel'?.toLowerCase()).length
        );

        // Validate and transform the data
        const validatedTrades = allData.map(trade => ({
          ...trade,
          quantity: Number(trade.quantity) || 0,
          price: Number(trade.price) || 0,
          net_money: Number(trade.net_money) || 0,
          accrued_interest: Number(trade.accrued_interest) || 0,
          market_price: Number(trade.market_price) || 0,
          trade_date: trade.trade_date ? new Date(trade.trade_date).toISOString() : null,
          settlement_date: trade.settlement_date ? new Date(trade.settlement_date).toISOString() : null,
          settlement_status: trade.settlement_status?.toLowerCase() || 'unknown',
          settlement_location: trade.settlement_location || 'Unknown',
          counterparty_name: trade.counterparty_name?.trim() || '',  // Ensure trimmed values
          Cusip: trade.Cusip || '',
          isin: trade.isin || '',
          account_number: trade.account_number || '',
          counterparty_dtc_number: trade.counterparty_dtc_number || '',
          currency: trade.currency || ''
        })) || [];

        console.log('Validated trades count:', validatedTrades.length);
        setTrades(validatedTrades);

        const fetchFailCosts = async () => {
          const { data, error } = await supabase
            .from('settlement_fails_view')
            .select('id, counterparty_name, fail_days, net_money, fail_cost')
            .eq('settlement_status', 'unsettled')
            .order('fail_cost', { ascending: false });

          if (error) throw error;

          // Aggregate by counterparty
          const counterpartyCosts = data.reduce((acc, trade) => {
            if (!acc[trade.counterparty_name]) {
              acc[trade.counterparty_name] = {
                counterparty_name: trade.counterparty_name,
                total_fail_cost: 0,
                trade_count: 0,
                fail_days: 0
              };
            }
            acc[trade.counterparty_name].total_fail_cost += trade.fail_cost;
            acc[trade.counterparty_name].trade_count += 1;
            acc[trade.counterparty_name].fail_days = Math.max(
              acc[trade.counterparty_name].fail_days, 
              trade.fail_days
            );
            return acc;
          }, {});

          setTopFailCosts(
            Object.values(counterpartyCosts)
              .sort((a, b) => b.total_fail_cost - a.total_fail_cost)
              .slice(0, 3)
          );
        };

        fetchFailCosts();
      } catch (err) {
        console.error('Detailed error:', err);
        setError(err.message);
        setTrades([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrades();
  }, []);

  // Helper function to validate trade data
  const validateTrade = (trade) => ({
    ...trade,
    quantity: Number(trade.quantity) || 0,
    price: Number(trade.price) || 0,
    net_money: Number(trade.net_money) || 0,
    accrued_interest: Number(trade.accrued_interest) || 0,
    market_price: Number(trade.market_price) || 0,
    trade_date: trade.trade_date ? new Date(trade.trade_date).toISOString() : null,
    settlement_date: trade.settlement_date ? new Date(trade.settlement_date).toISOString() : null,
    settlement_status: trade.settlement_status?.toLowerCase() || 'unknown',
    settlement_location: trade.settlement_location || 'Unknown',
    Cusip: trade.Cusip || '',
    isin: trade.isin || '',
    account_number: trade.account_number || '',
    counterparty_dtc_number: trade.counterparty_dtc_number || '',
    currency: trade.currency || ''
  });

  const getCounterpartyExposure = (trades) => {
    const exposureByCounterparty = trades.reduce((acc, trade) => {
      const { counterparty_name, net_money, settlement_location } = trade;
      if (!acc[counterparty_name]) {
        acc[counterparty_name] = {
          amount: 0,
          locations: {
            Fed: 0,
            DTC: 0,
            Euroclear: 0
          }
        };
      }
      acc[counterparty_name].amount += parseFloat(net_money);
      if (settlement_location && trade.settlement_status?.toLowerCase() === 'unsettled') {
        acc[counterparty_name].locations[settlement_location] += 1;
      }
      return acc;
    }, {});

    const sortedCounterparties = Object.entries(exposureByCounterparty)
      .sort(([, a], [, b]) => b.amount - a.amount);

    return sortedCounterparties.length > 0 
      ? { 
          name: sortedCounterparties[0][0], 
          amount: sortedCounterparties[0][1].amount,
          locationCounts: sortedCounterparties[0][1].locations
        }
      : { 
          name: 'N/A', 
          amount: 0,
          locationCounts: { Fed: 0, DTC: 0, Euroclear: 0 }
        };
  };

  const getCounterpartyTradeCount = (trades) => {
    const tradesByCounterparty = trades.reduce((acc, trade) => {
      const { counterparty_name, buy_sell_indicator } = trade;
      if (!acc[counterparty_name]) {
        acc[counterparty_name] = { buy: 0, sell: 0 };
      }
      acc[counterparty_name][buy_sell_indicator.toLowerCase()] += 1;
      return acc;
    }, {});

    const sortedByTotal = Object.entries(tradesByCounterparty)
      .sort(([, a], [, b]) => (b.buy + b.sell) - (a.buy + a.sell));

    return sortedByTotal.length > 0
      ? { 
          name: sortedByTotal[0][0], 
          buyCount: sortedByTotal[0][1].buy, 
          sellCount: sortedByTotal[0][1].sell,
          total: sortedByTotal[0][1].buy + sortedByTotal[0][1].sell
        }
      : { name: 'N/A', buyCount: 0, sellCount: 0, total: 0 };
  };

  const getTopFails = (trades) => {
    const failedTrades = trades
      .filter(trade => trade.settlement_status?.toLowerCase() === 'unsettled')
      .sort((a, b) => Math.abs(b.net_money) - Math.abs(a.net_money))
      .slice(0, 3)
      .map(trade => ({
        type: trade.buy_sell_indicator,
        quantity: trade.quantity?.toLocaleString() || '0',
        date: new Date(trade.settlement_date).toLocaleDateString(),
        amount: Math.abs(trade.net_money),
        counterparty: trade.counterparty_name
      }));

    return failedTrades;
  };

  const getUnsettledByLocation = (trades) => {
    console.log('All trades:', trades.length);
    
    const unsettledTrades = trades.filter(trade => 
      trade.settlement_status?.toLowerCase() === 'unsettled'
    );
    console.log('Unsettled trades:', unsettledTrades.length);

    // Debug: Log first few trades with their locations
    unsettledTrades.slice(0, 3).forEach(trade => {
      console.log('Trade details:', {
        id: trade.id,
        status: trade.settlement_status,
        location: trade.settlement_location,
        amount: trade.net_money
      });
    });

    const locationStats = unsettledTrades.reduce((acc, trade) => {
      const location = trade.settlement_location;
      console.log('Processing location:', location, typeof location);
      
      if (!location) {
        console.log('Missing location for trade:', trade.id);
      }
      
      const locationKey = location || 'Unknown';
      if (!acc[locationKey]) {
        acc[locationKey] = { count: 0, amount: 0 };
      }
      acc[locationKey].count += 1;
      acc[locationKey].amount += Math.abs(trade.net_money || 0);
      return acc;
    }, {});

    const result = Object.entries(locationStats)
      .sort((a, b) => b[1].amount - a[1].amount)
      .map(([location, stats]) => ({
        location,
        count: stats.count,
        amount: stats.amount
      }));

    console.log('Final location stats:', result);
    return result;
  };

  return {
    trades,
    loading,
    error,
    largestCounterpartyExposure: getCounterpartyExposure(trades),
    largestCounterpartyTradeCount: getCounterpartyTradeCount(trades),
    topFails: getTopFails(trades),
    unsettledByLocation: getUnsettledByLocation(trades),
    topFailCosts: topFailCosts,
  };
} 