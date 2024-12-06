import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment
} from '@mui/material';
import { NotificationsActive } from '@mui/icons-material';

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

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000); // Message will disappear after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [message]);

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

  const handleTestAlert = async () => {
    try {
      const response = await fetch('/api/test-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          trade_value: 1500000,
          trade_count: 12
        })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setMessage('Test alert sent! Check your email.');
      } else {
        setMessage('Error sending test alert: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Failed to send test alert');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NotificationsActive sx={{ color: 'primary.main', mr: 1 }} />
        <Typography variant="h5" component="h2">
          Alert Preferences
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Unsettled Trade Value Threshold"
          type="number"
          value={alerts.unsettledTradeThreshold}
          onChange={(e) => setAlerts({
            ...alerts,
            unsettledTradeThreshold: parseInt(e.target.value)
          })}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          label="Counterparty Trade Count Threshold"
          type="number"
          value={alerts.counterpartyTradeThreshold}
          onChange={(e) => setAlerts({
            ...alerts,
            counterpartyTradeThreshold: parseInt(e.target.value)
          })}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          type="submit"
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>

        <Button
          fullWidth
          variant="contained"
          onClick={handleTestAlert}
          sx={{ mb: 2 }}
        >
          Send Test Alert
        </Button>

        {message && (
          <Alert 
            severity="success" 
            sx={{ mt: 2 }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default AlertPreferences; 