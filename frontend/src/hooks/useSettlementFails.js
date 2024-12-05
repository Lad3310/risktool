import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSettlementFails() {
  const [settlementFails, setSettlementFails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSettlementFails();
  }, []);

  const fetchSettlementFails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('settlement_fails_view')
        .select('*')
        .order('fail_days', { ascending: false });

      if (error) {
        throw error;
      }

      setSettlementFails(data || []);
    } catch (err) {
      console.error('Error fetching settlement fails:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    settlementFails,
    loading,
    error,
    refetch: fetchSettlementFails
  };
} 