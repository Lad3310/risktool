import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  FormControl, 
  Select, 
  MenuItem, 
  Paper,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  FileDownload as DownloadIcon,
  Description as CSVIcon,
  TableChart as XLSXIcon,
  PictureAsPdf as PDFIcon 
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useTrades } from '../hooks/useTrades';

function Reports() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [buySell, setBuySell] = useState('Both');
  const [status, setStatus] = useState('Both');
  const [counterparties, setCounterparties] = useState('All');
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportData, setReportData] = useState(null);
  
  // Get trades data from useTrades hook
  const { trades } = useTrades();

  // Derive counterparty options from trades data
  const counterpartyOptions = useMemo(() => {
    if (!trades) return ['All'];
    
    const uniqueCounterparties = [...new Set(
      trades.map(trade => 
        trade.counterparty_name?.replace(/['"]/g, '').trim()
      )
    )].filter(Boolean).sort();

    return ['All', ...uniqueCounterparties];
  }, [trades]);

  // Helper function for date formatting - fixed to handle timezone
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  };

  // Helper function for number formatting - improved precision
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '';
    try {
      if (typeof num === 'string') num = parseFloat(num);
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch (e) {
      return num;
    }
  };

  // Update filteredTrades with better filtering and formatting
  const filteredTrades = useMemo(() => {
    if (!trades) return [];
    
    return trades.filter(trade => {
      const matchesBuySell = buySell === 'Both' || 
        (trade.buy_sell_indicator && 
         trade.buy_sell_indicator.toLowerCase() === buySell.toLowerCase());
      
      const matchesStatus = status === 'Both' || 
        (trade.settlement_status && 
         trade.settlement_status.toLowerCase() === status.toLowerCase());
      
      const matchesCounterparty = counterparties === 'All' || 
        (trade.counterparty_name && 
         trade.counterparty_name.replace(/['"]/g, '').trim().toLowerCase() === 
         counterparties.replace(/['"]/g, '').trim().toLowerCase());

      return matchesBuySell && matchesStatus && matchesCounterparty;
    }).map(trade => {
      // Ensure all fields are properly formatted
      return {
        id: trade.id?.toString() || '',
        buy_sell_indicator: trade.buy_sell_indicator || '',
        product_type: trade.product_type || '',
        Cusip: trade.Cusip || '',
        isin: trade.isin || '',
        trade_date: formatDate(trade.trade_date),
        settlement_date: formatDate(trade.settlement_date),
        quantity: trade.quantity ? formatNumber(trade.quantity) : '',
        price: trade.price ? formatNumber(trade.price) : '',
        account_number: trade.account_number?.toString() || '',
        counterparty_dtc_number: trade.counterparty_dtc_number?.toString() || '',
        counterparty_name: trade.counterparty_name || '',
        currency: trade.currency || '',
        accrued_interest: trade.accrued_interest ? formatNumber(trade.accrued_interest) : '',
        settlement_location: trade.settlement_location || '',
        settlement_status: trade.settlement_status || '',
        net_money: trade.net_money ? formatNumber(trade.net_money) : '',
        market_price: trade.market_price ? formatNumber(trade.market_price) : ''
      };
    });
  }, [trades, buySell, status, counterparties]);

  const handleGenerateReport = () => {
    setReportData(filteredTrades);
    setReportGenerated(true);
  };

  const handleCSVDownload = () => {
    if (!reportData?.length) return;

    const headerMap = {
      id: 'ID',
      buy_sell_indicator: 'Buy/Sell',
      product_type: 'Product Type',
      Cusip: 'CUSIP',
      isin: 'ISIN',
      trade_date: 'Trade Date',
      settlement_date: 'Settlement Date',
      quantity: 'Quantity',
      price: 'Price',
      account_number: 'Account Number',
      counterparty_dtc_number: 'Counterparty DTC Number',
      counterparty_name: 'Counterparty Name',
      currency: 'Currency',
      accrued_interest: 'Accrued Interest',
      settlement_location: 'Settlement Location',
      settlement_status: 'Settlement Status',
      net_money: 'Net Money',
      market_price: 'Market Price'
    };

    const headers = Object.values(headerMap).join(',');
    const rows = reportData.map(row => 
      Object.keys(headerMap)
        .map(key => {
          const value = row[key];
          // Handle values that might contain commas or are empty
          return value ? (typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value) : '';
        })
        .join(',')
    ).join('\n');

    const csvContent = `${headers}\n${rows}`;
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'trade_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Update XLSX configuration for better column alignment
  const handleXLSXDownload = () => {
    if (!reportData?.length) return;

    const ws = XLSX.utils.json_to_sheet(reportData, {
      header: Object.keys(reportData[0]),
      skipHeader: true
    });

    // Improved column widths
    ws['!cols'] = [
      { wch: 8 },   // ID
      { wch: 6 },   // Buy/Sell
      { wch: 12 },  // Product Type
      { wch: 10 },  // CUSIP
      { wch: 12 },  // ISIN
      { wch: 10 },  // Trade Date
      { wch: 10 },  // Settlement Date
      { wch: 15 },  // Quantity
      { wch: 12 },  // Price
      { wch: 15 },  // Account Number
      { wch: 15 },  // Counterparty DTC
      { wch: 25 },  // Counterparty Name
      { wch: 8 },   // Currency
      { wch: 15 },  // Accrued Interest
      { wch: 12 },  // Settlement Location
      { wch: 12 },  // Settlement Status
      { wch: 15 },  // Net Money
      { wch: 12 }   // Market Price
    ];

    // Add cell formatting
    for (let R = 1; R <= reportData.length; R++) {
      for (let C = 0; C < Object.keys(reportData[0]).length; C++) {
        const cell_ref = XLSX.utils.encode_cell({r: R, c: C});
        if (!ws[cell_ref]) continue;
        
        // Center align text columns
        if (typeof ws[cell_ref].v === 'string') {
          ws[cell_ref].s = { alignment: { horizontal: 'center' } };
        }
        // Right align number columns
        else if (typeof ws[cell_ref].v === 'number') {
          ws[cell_ref].s = { alignment: { horizontal: 'right' } };
        }
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trade Report');
    
    XLSX.writeFile(wb, 'trade_report.xlsx');
  };

  const handlePDFDownload = () => {
    if (!reportData?.length) return;

    const doc = new jsPDF('landscape', 'pt');
    
    // Add title
    doc.setFontSize(16);
    doc.text('Trade Report', 40, 40);
    
    // Add filters info
    doc.setFontSize(10);
    doc.text(`Buy/Sell: ${buySell}`, 40, 60);
    doc.text(`Status: ${status}`, 40, 75);
    doc.text(`Counterparty: ${counterparties}`, 40, 90);

    // Create table with formatted headers
    const headers = [
      'ID', 'Buy/Sell', 'Product Type', 'CUSIP', 'ISIN',
      'Trade Date', 'Settlement Date', 'Quantity', 'Price',
      'Account Number', 'Counterparty DTC Number', 'Counterparty Name',
      'Currency', 'Accrued Interest', 'Settlement Location',
      'Settlement Status', 'Net Money', 'Market Price'
    ];
    
    const data = reportData.map(row => [
      row.id,
      row.buy_sell_indicator,
      row.product_type,
      row.Cusip,
      row.isin,
      row.trade_date,
      row.settlement_date,
      row.quantity,
      row.price,
      row.account_number,
      row.counterparty_dtc_number,
      row.counterparty_name,
      row.currency,
      row.accrued_interest,
      row.settlement_location,
      row.settlement_status,
      row.net_money,
      row.market_price
    ]);
    
    doc.autoTable({
      head: [headers],
      body: data,
      startY: 100,
      theme: 'grid',
      styles: { 
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 30 },  // ID
        1: { cellWidth: 40 },  // Buy/Sell
        2: { cellWidth: 50 },  // Product Type
        3: { cellWidth: 60 },  // CUSIP
        4: { cellWidth: 60 },  // ISIN
        5: { cellWidth: 50 },  // Trade Date
        6: { cellWidth: 50 },  // Settlement Date
        7: { cellWidth: 60, halign: 'right' },  // Quantity
        8: { cellWidth: 40, halign: 'right' },  // Price
        9: { cellWidth: 50 },  // Account Number
        10: { cellWidth: 50 }, // Counterparty DTC
        11: { cellWidth: 60 }, // Counterparty Name
        12: { cellWidth: 40 }, // Currency
        13: { cellWidth: 50, halign: 'right' }, // Accrued Interest
        14: { cellWidth: 50 }, // Settlement Location
        15: { cellWidth: 50 }, // Settlement Status
        16: { cellWidth: 70, halign: 'right' }, // Net Money
        17: { cellWidth: 40, halign: 'right' }  // Market Price
      },
      headStyles: { 
        fillColor: [74, 222, 128],
        fontSize: 7,
        halign: 'center',
        valign: 'middle'
      }
    });

    doc.save('trade_report.pdf');
  };

  return (
    <Box sx={{ p: 2, maxWidth: 800, margin: '0 auto' }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Report Settings
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Buy/Sell
          </Typography>
          <FormControl fullWidth>
            <Select value={buySell} onChange={(e) => setBuySell(e.target.value)}>
              <MenuItem value="Both">Both</MenuItem>
              <MenuItem value="Buy">Buy</MenuItem>
              <MenuItem value="Sell">Sell</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Status
          </Typography>
          <FormControl fullWidth>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="Both">Both</MenuItem>
              <MenuItem value="Settled">Settled</MenuItem>
              <MenuItem value="Unsettled">Unsettled</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Counterparties
          </Typography>
          <FormControl fullWidth>
            <Select 
              value={counterparties} 
              onChange={(e) => setCounterparties(e.target.value)}
            >
              {counterpartyOptions.map(cp => (
                <MenuItem key={cp} value={cp}>{cp}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Button 
          fullWidth 
          variant="contained" 
          sx={{ 
            bgcolor: '#3b82f6',
            '&:hover': { bgcolor: '#2563eb' }
          }}
          onClick={handleGenerateReport}
        >
          GENERATE REPORT
        </Button>
      </Paper>

      {reportGenerated && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Report Ready
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            {reportData?.length || 0} records found. Choose your export format:
          </Typography>
          
          <Grid container spacing={2}>
            {[
              { format: 'CSV', icon: CSVIcon, color: '#4ade80', handler: handleCSVDownload },
              { format: 'XLSX', icon: XLSXIcon, color: '#22c55e', handler: handleXLSXDownload },
              { format: 'PDF', icon: PDFIcon, color: '#15803d', handler: handlePDFDownload }
            ].map((option) => (
              <Grid item xs={12} sm={4} key={option.format}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<option.icon />}
                  onClick={option.handler}
                  sx={{
                    bgcolor: option.color,
                    '&:hover': { bgcolor: option.color, filter: 'brightness(0.9)' },
                    height: '48px',
                    fontSize: isMobile ? '1rem' : '0.875rem'
                  }}
                >
                  {option.format}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

export default Reports; 