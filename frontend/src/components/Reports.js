import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Fade
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import ExportButtons from './ExportButtons';

function Reports() {
  const [reportType, setReportType] = useState('Daily Summary');
  const [timeFrame, setTimeFrame] = useState('Last 7 Days');
  const [buySell, setBuySell] = useState('Both');
  const [status, setStatus] = useState('Both');
  const [counterparties, setCounterparties] = useState('All');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Convert timeFrame to actual date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeFrame) {
        case 'Last 7 Days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'Last 30 Days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'Last 90 Days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Construct query based on filters
      let query = supabase
        .from('trades')
        .select('*')
        .gte('trade_date', startDate.toISOString())
        .lte('trade_date', endDate.toISOString());

      if (buySell !== 'Both') {
        query = query.eq('buy_sell_indicator', buySell);
      }

      if (status !== 'Both') {
        query = query.eq('settlement_status', status);
      }

      if (counterparties !== 'All') {
        query = query.eq('counterparty_name', counterparties);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setReport(data);
      setSuccess(true);
    } catch (error) {
      console.error('Error generating report:', error.message);
      setError('Failed to generate report. Please try again.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  // Update the counterparties dropdown to match actual values in the data
  const counterpartyOptions = [
    'All',
    'UBS',
    'Goldman Sachs',
    'Morgan Stanley',
    'Deutsche Bank',
    'Citadel',
    'Tradeweb'
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trading Reports
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="Daily Summary">Daily Summary</MenuItem>
                <MenuItem value="Weekly Summary">Weekly Summary</MenuItem>
                <MenuItem value="Monthly Summary">Monthly Summary</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Time Frame</InputLabel>
              <Select
                value={timeFrame}
                label="Time Frame"
                onChange={(e) => setTimeFrame(e.target.value)}
              >
                <MenuItem value="Last 7 Days">Last 7 Days</MenuItem>
                <MenuItem value="Last 30 Days">Last 30 Days</MenuItem>
                <MenuItem value="Last 90 Days">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Buy/Sell</InputLabel>
              <Select
                value={buySell}
                label="Buy/Sell"
                onChange={(e) => setBuySell(e.target.value)}
              >
                <MenuItem value="Both">Both</MenuItem>
                <MenuItem value="Buy">Buy</MenuItem>
                <MenuItem value="Sell">Sell</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="Both">Both</MenuItem>
                <MenuItem value="Settled">Settled</MenuItem>
                <MenuItem value="Unsettled">Unsettled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <FormControl fullWidth>
              <InputLabel>Counterparties</InputLabel>
              <Select
                value={counterparties}
                label="Counterparties"
                onChange={(e) => setCounterparties(e.target.value)}
              >
                {counterpartyOptions.map(cp => (
                  <MenuItem key={cp} value={cp}>{cp}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            disabled={loading}
            sx={{ 
              width: '100%',
              backgroundColor: '#4ade80',
              '&:hover': {
                backgroundColor: '#22c55e'
              }
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'GENERATE REPORT'}
          </Button>
        </Box>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && report && (
        <Fade in={true}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Report Ready
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {report.length} records found. Choose your export format:
                </Typography>
              </Box>
              <ExportButtons 
                data={report} 
                filename={`trade_report_${new Date().toISOString().split('T')[0]}`}
              />
            </Box>
          </Paper>
        </Fade>
      )}
    </Box>
  );
}

export default Reports; 