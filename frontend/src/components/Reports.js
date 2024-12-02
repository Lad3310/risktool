import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  TextField,
  Autocomplete,
  ButtonGroup,
  Menu,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

const COLORS = ['#00C49F', '#FF8042'];

export default function Reports() {
  const [reportType, setReportType] = useState('daily');
  const [timeFrame, setTimeFrame] = useState('7d');
  const [reportData, setReportData] = useState([]);
  const [selectedCounterparties, setSelectedCounterparties] = useState('all');
  const [buySellType, setBuySellType] = useState('both');
  const [status, setStatus] = useState('all');
  const [counterpartyOptions, setCounterpartyOptions] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounterparties = async () => {
      try {
        const { data, error } = await supabase
          .from('trades')
          .select('counterparty_name')
          .not('counterparty_name', 'is', null);

        if (error) throw error;

        const uniqueCounterparties = Array.from(
          new Set(data.map(trade => trade.counterparty_name))
        ).sort();

        setCounterpartyOptions(uniqueCounterparties);
      } catch (error) {
        console.error('Error fetching counterparties:', error);
      }
    };

    fetchCounterparties();
  }, []);

  const analytics = useMemo(() => {
    if (!reportData.length) return {
      totalTrades: 0,
      totalProfitLoss: 0,
      winRate: 0,
      averageTradeSize: 0,
      profitableTrades: 0,
      losingTrades: 0,
      averageWin: 0,
      averageLoss: 0,
    };

    const profitableTrades = reportData.filter(trade => trade.profit_loss > 0);
    const losingTrades = reportData.filter(trade => trade.profit_loss <= 0);

    return {
      totalTrades: reportData.length,
      totalProfitLoss: reportData.reduce((sum, trade) => sum + trade.profit_loss, 0),
      winRate: (profitableTrades.length / reportData.length) * 100,
      averageTradeSize: reportData.reduce((sum, trade) => sum + trade.position_size, 0) / reportData.length,
      profitableTrades: profitableTrades.length,
      losingTrades: losingTrades.length,
      averageWin: profitableTrades.length ? 
        profitableTrades.reduce((sum, trade) => sum + trade.profit_loss, 0) / profitableTrades.length : 0,
      averageLoss: losingTrades.length ? 
        losingTrades.reduce((sum, trade) => sum + trade.profit_loss, 0) / losingTrades.length : 0,
    };
  }, [reportData]);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching data with filters:', {
        timeFrame,
        selectedCounterparties,
        buySellType,
        status
      });

      let query = supabase
        .from('trades')
        .select('*');

      const now = new Date();
      let startDate = new Date();
      
      switch (timeFrame) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      query = query.gte('created_at', startDate.toISOString());

      if (selectedCounterparties && selectedCounterparties !== 'all') {
        query = query.eq('counterparty_name', selectedCounterparties);
      }

      if (buySellType !== 'both') {
        query = query.eq('buy_sell_indicator', buySellType.toUpperCase());
      }

      if (status !== 'all') {
        query = query.eq('settlement_status', status);
      }
      
      const { data, error } = await query;

      if (error) throw error;
      
      console.log('Fetched data:', data);
      setReportData(data || []);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'P/L', 'Position Size'];
    const csvData = reportData.map(trade => [
      new Date(trade.created_at).toLocaleDateString(),
      trade.symbol,
      trade.trade_type,
      trade.entry_price,
      trade.exit_price,
      trade.profit_loss,
      trade.position_size,
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `trade_report_${new Date().toISOString().split('T')[0]}.csv`);
    handleExportClose();
  };

  const exportToXLSX = () => {
    const headers = ['Date', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'P/L', 'Position Size'];
    const data = reportData.map(trade => [
      new Date(trade.created_at).toLocaleDateString(),
      trade.symbol,
      trade.trade_type,
      trade.entry_price,
      trade.exit_price,
      trade.profit_loss,
      trade.position_size,
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trades');
    XLSX.writeFile(wb, `trade_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    handleExportClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Trade Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
    
    doc.text(`Total Trades: ${analytics.totalTrades}`, 20, 40);
    doc.text(`Win Rate: ${analytics.winRate.toFixed(2)}%`, 20, 50);
    doc.text(`Total P/L: $${analytics.totalProfitLoss.toFixed(2)}`, 20, 60);
    
    const headers = ['Date', 'Symbol', 'Type', 'P/L'];
    const data = reportData.map(trade => [
      new Date(trade.created_at).toLocaleDateString(),
      trade.symbol,
      trade.trade_type,
      `$${trade.profit_loss.toFixed(2)}`,
    ]);

    doc.autoTable({
      head: [headers],
      body: data,
      startY: 70,
    });

    doc.save(`trade_report_${new Date().toISOString().split('T')[0]}.pdf`);
    handleExportClose();
  };

  const dailyProfitData = useMemo(() => {
    const dailyData = reportData.reduce((acc, trade) => {
      const date = new Date(trade.created_at).toLocaleDateString();
      const existingDay = acc.find(item => item.date === date);
      
      if (existingDay) {
        existingDay.profit_loss += trade.profit_loss;
      } else {
        acc.push({ date, profit_loss: trade.profit_loss });
      }
      return acc;
    }, []);

    return dailyData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [reportData]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Trading Reports</Typography>
        <ButtonGroup variant="contained">
          <Button
            onClick={handleExportClick}
            startIcon={<FileDownloadIcon />}
            endIcon={<KeyboardArrowDownIcon />}
            disabled={!reportData.length}
          >
            Export
          </Button>
        </ButtonGroup>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleExportClose}
        >
          <MenuItem onClick={exportToCSV}>Export as CSV</MenuItem>
          <MenuItem onClick={exportToXLSX}>Export as XLSX</MenuItem>
          <MenuItem onClick={exportToPDF}>Export as PDF</MenuItem>
        </Menu>
      </Box>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="daily">Daily Summary</MenuItem>
                <MenuItem value="weekly">Weekly Summary</MenuItem>
                <MenuItem value="monthly">Monthly Summary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Time Frame</InputLabel>
              <Select
                value={timeFrame}
                label="Time Frame"
                onChange={(e) => setTimeFrame(e.target.value)}
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Buy/Sell</InputLabel>
              <Select
                value={buySellType}
                label="Buy/Sell"
                onChange={(e) => setBuySellType(e.target.value)}
              >
                <MenuItem value="both">Both</MenuItem>
                <MenuItem value="buy">Buy</MenuItem>
                <MenuItem value="sell">Sell</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="all">Both</MenuItem>
                <MenuItem value="settled">Settled</MenuItem>
                <MenuItem value="unsettled">Unsettled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Counterparties</InputLabel>
              <Select
                value={selectedCounterparties}
                label="Counterparties"
                onChange={(e) => {
                  setSelectedCounterparties(e.target.value);
                }}
              >
                <MenuItem value="all">All</MenuItem>
                {counterpartyOptions.map((counterparty) => (
                  <MenuItem key={counterparty} value={counterparty}>
                    {counterparty}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={fetchReportData}
              sx={{ height: '56px' }}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          Error: {error}
        </Typography>
      )}

      {reportData.length > 0 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={3}>
                <Typography variant="h6">Total Trades</Typography>
                <Typography variant="h4">{analytics.totalTrades}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h6">Win Rate</Typography>
                <Typography variant="h4">{analytics.winRate.toFixed(2)}%</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h6">Total P/L</Typography>
                <Typography variant="h4" color={analytics.totalProfitLoss >= 0 ? 'success.main' : 'error.main'}>
                  ${analytics.totalProfitLoss.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h6">Avg Trade Size</Typography>
                <Typography variant="h4">${analytics.averageTradeSize.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Profit/Loss Over Time</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyProfitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="profit_loss"
                  stroke="#8884d8"
                  name="P/L"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>

          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Win/Loss Distribution</Typography>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Winning Trades', value: analytics.profitableTrades },
                    { name: 'Losing Trades', value: analytics.losingTrades },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </>
      )}
    </Container>
  );
} 