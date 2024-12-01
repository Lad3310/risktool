import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AlertPreferences = ({ userId }) => {
  const [email, setEmail] = useState('');
  const [alerts, setAlerts] = useState({
    unsettledTradeThreshold: 0,
    counterpartyTradeThreshold: 10,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAlertPreferences();
  }, [userId]);

  const fetchAlertPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setEmail(data.email);
        setAlerts({
          unsettledTradeThreshold: data.unsettled_trade_threshold,
          counterpartyTradeThreshold: data.counterparty_trade_threshold,
        });
      }
    } catch (error) {
      console.error('Error fetching alert preferences:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('alert_preferences')
        .upsert({
          user_id: userId,
          email: email,
          unsettled_trade_threshold: alerts.unsettledTradeThreshold,
          counterparty_trade_threshold: alerts.counterpartyTradeThreshold,
        });

      if (error) throw error;
      setMessage('Alert preferences saved successfully!');
    } catch (error) {
      setMessage('Error saving preferences: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Alert Preferences</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            Unsettled Trade Value Threshold
          </label>
          <input
            type="number"
            value={alerts.unsettledTradeThreshold}
            onChange={(e) => setAlerts({
              ...alerts,
              unsettledTradeThreshold: parseInt(e.target.value)
            })}
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">
            Counterparty Trade Count Threshold
          </label>
          <input
            type="number"
            value={alerts.counterpartyTradeThreshold}
            onChange={(e) => setAlerts({
              ...alerts,
              counterpartyTradeThreshold: parseInt(e.target.value)
            })}
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>

        {message && (
          <div className="mt-4 text-sm text-gray-600">
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default AlertPreferences; 