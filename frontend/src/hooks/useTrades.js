import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export function useTrades() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      setLoading(true);
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
          net_money,
          currency
        `)
        .order('trade_date', { ascending: false });

      if (error) throw error;

      setTrades(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { trades, loading, error, refetch: fetchTrades };
} 