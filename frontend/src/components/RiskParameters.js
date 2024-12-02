import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, InputAdornment, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EmailIcon from '@mui/icons-material/Email';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { supabase } from '../utils/supabaseClient';

// Custom number input component
const MillionDollarInput = ({ value, onChange }) => {
  const increment = () => {
    const currentValue = parseInt(value) || 1000000;
    onChange((currentValue + 1000000).toString());
  };

  const decrement = () => {
    const currentValue = parseInt(value) || 1000000;
    const newValue = Math.max(1000000, currentValue - 1000000);
    onChange(newValue.toString());
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <TextField
        fullWidth
        value={`$${parseInt(value || 1000000).toLocaleString()}`}
        InputProps={{
          readOnly: true,
        }}
      />
      <Box sx={{ position: 'absolute', right: 8, display: 'flex', flexDirection: 'column' }}>
        <IconButton 
          size="small" 
          onClick={increment}
          sx={{ padding: 0 }}
        >
          <ArrowDropUpIcon />
        </IconButton>
        <IconButton 
          size="small" 
          onClick={decrement}
          sx={{ padding: 0 }}
        >
          <ArrowDropDownIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

function RiskParameters() {
  const [email, setEmail] = useState('');
  const [unsettledThreshold, setUnsettledThreshold] = useState('1000000');
  const [counterpartyThreshold, setCounterpartyThreshold] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_preferences')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setEmail(data.email || '');
        setUnsettledThreshold(
          data.unsettled_threshold?.toString() || '1000000'
        );
        setCounterpartyThreshold(
          data.counterparty_threshold?.toString() || ''
        );
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('alert_preferences')
        .upsert({
          email,
          unsettled_threshold: parseInt(unsettledThreshold),
          counterparty_threshold: counterpartyThreshold === '' ? null : parseInt(counterpartyThreshold),
          id: 1
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <NotificationsIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h5">Alert Preferences</Typography>
      </Box>

      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Email Address *
          </Typography>
          <TextField
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Unsettled Trade Value Threshold
          </Typography>
          <TextField
            fullWidth
            value={parseInt(unsettledThreshold).toLocaleString()}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              endAdornment: (
                <InputAdornment position="end">
                  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Button
                      size="small"
                      onClick={() => {
                        const newValue = parseInt(unsettledThreshold) + 1000000;
                        setUnsettledThreshold(newValue.toString());
                      }}
                      sx={{ minWidth: '30px', p: 0, height: '20px' }}
                    >
                      ▲
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        const currentValue = parseInt(unsettledThreshold);
                        const newValue = Math.max(1000000, currentValue - 1000000);
                        setUnsettledThreshold(newValue.toString());
                      }}
                      sx={{ minWidth: '30px', p: 0, height: '20px' }}
                    >
                      ▼
                    </Button>
                  </Box>
                </InputAdornment>
              ),
              readOnly: true,
            }}
            sx={{
              '& .MuiInputBase-input': {
                textAlign: 'left',
                pl: 1,
                pr: 1,
              },
            }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Get notified when unsettled trade value exceeds this amount
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle1" gutterBottom>
            Counterparty Trade Count Threshold
          </Typography>
          <TextField
            fullWidth
            value={counterpartyThreshold}
            onChange={(e) => setCounterpartyThreshold(e.target.value)}
            placeholder="Enter threshold count"
            type="number"
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Get notified when number of trades with a counterparty exceeds this number
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={handleSave}
          sx={{ mt: 2 }}
          fullWidth
        >
          SAVE PREFERENCES
        </Button>
      </Box>
    </Paper>
  );
}

export default RiskParameters;