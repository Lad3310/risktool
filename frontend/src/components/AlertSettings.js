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
import { NotificationsActive, Email } from '@mui/icons-material';
import { supabase } from '../lib/supabaseClient';
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
    fetchAlertPreferences();
  }, [user?.id]);

  const fetchAlertPreferences = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setEmail(data.email);
        setAlerts({
          unsettledTradeThreshold: Number(data.unsettled_trade_threshold) || 0,
          counterpartyTradeThreshold: Number(data.counterparty_trade_threshold) || 10,
        });
      } else {
        setEmail(user.email || '');
        setAlerts({
          unsettledTradeThreshold: 0,
          counterpartyTradeThreshold: 10,
        });
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
    
    try {
      // Log the data being sent
      const preferenceData = {
        user_id: user.id,
        email: email,
        unsettled_trade_threshold: Number(alerts.unsettledTradeThreshold),
        counterparty_trade_threshold: Number(alerts.counterpartyTradeThreshold),
      };
      
      console.log('Saving preferences:', preferenceData);

      const { error } = await supabase
        .from('alert_preferences')
        .upsert(preferenceData);

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
                unsettledTradeThreshold: parseInt(e.target.value)
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
                counterpartyTradeThreshold: parseInt(e.target.value)
              })}
              fullWidth
              helperText="Get notified when number of trades with a counterparty exceeds this number"
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>

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