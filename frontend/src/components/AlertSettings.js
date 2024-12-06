import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Alert, 
  InputAdornment,
  Divider,
  Container
} from '@mui/material';
import { NotificationsActive, Email, Send } from '@mui/icons-material';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';

const AlertSettings = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [alerts, setAlerts] = useState({
    unsettledTradeThreshold: 0,
    counterpartyTradeThreshold: 10,
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ message: '', severity: 'info' });

  useEffect(() => {
    if (user?.id) {
      fetchAlertPreferences();
    }
  }, [user?.id]);

  const fetchAlertPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // If preferences exist, use them
      if (data && data.length > 0) {
        const prefs = data[0];
        setEmail(prefs.email || user.email || '');
        setAlerts({
          unsettledTradeThreshold: Number(prefs.unsettled_trade_threshold) || 0,
          counterpartyTradeThreshold: Number(prefs.counterparty_trade_threshold) || 10,
        });
      } else {
        // If no preferences exist, set defaults
        setEmail(user.email || '');
        setAlerts({
          unsettledTradeThreshold: 0,
          counterpartyTradeThreshold: 10,
        });
        
        // Optionally create default preferences
        const { error: insertError } = await supabase
          .from('alert_preferences')
          .insert({
            user_id: user.id,
            email: user.email || '',
            unsettled_trade_threshold: 0,
            counterparty_trade_threshold: 10
          });
          
        if (insertError) {
          console.error('Error creating default preferences:', insertError);
        }
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setStatus({
        message: 'Error loading preferences: ' + error.message,
        severity: 'error'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: '', severity: 'info' });
    
    try {
      const preferenceData = {
        user_id: user.id,
        email: email,
        unsettled_trade_threshold: Number(alerts.unsettledTradeThreshold),
        counterparty_trade_threshold: Number(alerts.counterpartyTradeThreshold),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('alert_preferences')
        .upsert(preferenceData, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      setStatus({
        message: 'Alert preferences saved successfully!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Save error:', error);
      setStatus({
        message: 'Error saving preferences: ' + error.message,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestAlert = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          trade_value: 1500000,  // Simulated value above threshold
          trade_count: 12        // Simulated count above threshold
        })
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setStatus({
          message: 'Test alert sent! Check your email.',
          severity: 'success'
        });
      } else {
        setStatus({
          message: 'Error sending test alert: ' + data.message,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus({
        message: 'Failed to send test alert',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Alert severity="warning">
          Please log in to manage your alert preferences.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <NotificationsActive sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h1">
            Alert Preferences
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Unsettled Trade Value Threshold"
              type="number"
              value={alerts.unsettledTradeThreshold}
              onChange={(e) => setAlerts({
                ...alerts,
                unsettledTradeThreshold: parseInt(e.target.value) || 0
              })}
              fullWidth
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              helperText="Get notified when unsettled trade value exceeds this amount"
            />

            <TextField
              label="Counterparty Trade Count Threshold"
              type="number"
              value={alerts.counterpartyTradeThreshold}
              onChange={(e) => setAlerts({
                ...alerts,
                counterpartyTradeThreshold: parseInt(e.target.value) || 0
              })}
              fullWidth
              helperText="Get notified when number of trades with a counterparty exceeds this number"
            />

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>

              <Button
                variant="contained"
                onClick={handleTestAlert}
                disabled={loading}
                fullWidth
                startIcon={<Send />}
              >
                Send Test Alert
              </Button>
            </Box>

            {status.message && (
              <Alert severity={status.severity} sx={{ mt: 2 }}>
                {status.message}
              </Alert>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default AlertSettings; 