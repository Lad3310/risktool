import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        setLoading(true);
        console.log('Fetching trades...');

        // Fetch trades data with specific columns
        const { data, error } = await supabase
          .from('trades')
          .select(`
            id,
            buy_sell_indicator,
            product_type,
            quantity,
            price,
            counterparty_name,
            settlement_date,
            settlement_status,
            net_money
          `)
          .order('settlement_date', { ascending: false });

        if (error) {
          console.error('Error fetching trades:', error);
          throw error;
        }

        // Validate and transform the data
        const validatedTrades = data?.map(trade => ({
          ...trade,
          quantity: Number(trade.quantity) || 0,
          price: Number(trade.price) || 0,
          net_money: Number(trade.net_money) || 0,
          settlement_date: trade.settlement_date ? new Date(trade.settlement_date).toISOString() : null,
          settlement_status: trade.settlement_status?.toLowerCase() || 'unknown'
        })) || [];

        console.log('Processed trades data:', validatedTrades);
        setTrades(validatedTrades);
      } catch (err) {
        console.error('Detailed error:', err);
        setError(err.message);
        setTrades([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    // Set up real-time subscription
    const subscription = supabase
      .channel('trades_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'trades' 
        }, 
        (payload) => {
          console.log('Received real-time update:', payload);
          try {
            switch (payload.eventType) {
              case 'INSERT':
                setTrades(current => [validateTrade(payload.new), ...current]);
                break;
              case 'UPDATE':
                setTrades(current => 
                  current.map(trade => 
                    trade.id === payload.new.id ? validateTrade(payload.new) : trade
                  )
                );
                break;
              case 'DELETE':
                setTrades(current => 
                  current.filter(trade => trade.id !== payload.old.id)
                );
                break;
              default:
                break;
            }
          } catch (err) {
            console.error('Error processing real-time update:', err);
          }
        }
      )
      .subscribe();

    fetchTrades();

    return () => {
      console.log('Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to validate trade data
  const validateTrade = (trade) => ({
    ...trade,
    quantity: Number(trade.quantity) || 0,
    price: Number(trade.price) || 0,
    net_money: Number(trade.net_money) || 0,
    settlement_date: trade.settlement_date ? new Date(trade.settlement_date).toISOString() : null,
    settlement_status: trade.settlement_status?.toLowerCase() || 'unknown'
  });

  const getCounterpartyExposure = (trades) => {
    const exposureByCounterparty = trades.reduce((acc, trade) => {
      const { counterparty_name, net_money } = trade;
      acc[counterparty_name] = (acc[counterparty_name] || 0) + parseFloat(net_money);
      return acc;
    }, {});

    const sortedCounterparties = Object.entries(exposureByCounterparty)
      .sort(([, a], [, b]) => b - a);

    return sortedCounterparties.length > 0 
      ? { name: sortedCounterparties[0][0], amount: sortedCounterparties[0][1] }
      : { name: 'N/A', amount: 0 };
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

  return {
    trades,
    loading,
    error,
    largestCounterpartyExposure: getCounterpartyExposure(trades),
    largestCounterpartyTradeCount: getCounterpartyTradeCount(trades),
    topFails: getTopFails(trades),
  };
} 