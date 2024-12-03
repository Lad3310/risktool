import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function ExportButtons({ data, filename = 'report' }) {
  // Column definitions with friendly names and widths
  const columnDefs = {
    id: { header: 'ID', width: 25 },
    buy_sell_indicator: { header: 'Buy/Sell', width: 35 },
    product_type: { 
      header: 'Product Type', 
      width: 60,
      format: (val) => val === 'Fixed Income' ? 'Fixed Inc' : val 
    },
    Cusip: { header: 'CUSIP', width: 50 },
    isin: { header: 'ISIN', width: 65 },
    trade_date: { header: 'Trade Date', width: 65 },
    settlement_date: { header: 'Settle Date', width: 65 },
    quantity: { 
      header: 'Quantity', 
      width: 60, 
      format: (val) => Number(val).toLocaleString() 
    },
    price: { 
      header: 'Price', 
      width: 40, 
      format: (val) => Number(val).toFixed(2) 
    },
    account_number: { header: 'Account', width: 50 },
    counterparty_dtc_number: { header: 'DTC#', width: 35 },
    counterparty_name: { header: 'Counterparty', width: 65 },
    currency: { header: 'CCY', width: 30 },
    accrued_interest: { 
      header: 'Accr Int', 
      width: 40, 
      format: (val) => Number(val).toFixed(2) 
    },
    settlement_location: { header: 'Location', width: 45 },
    settlement_status: { header: 'Status', width: 45 },
    net_money: { 
      header: 'Net Amount', 
      width: 75, 
      format: (val) => Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 }) 
    },
    market_price: { 
      header: 'Mkt Price', 
      width: 45, 
      format: (val) => Number(val).toFixed(2) 
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const formatNumber = (num) => {
    if (typeof num === 'number') {
      return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return num;
  };

  const exportToCSV = () => {
    // Convert data to CSV
    const csvContent = convertToCSV(data);
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape', 'pt', 'a3');
    
    // Add title
    doc.setFontSize(18);
    doc.text('Trading Report', 40, 40);
    
    // Add timestamp
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

    // Prepare table data
    const headers = Object.keys(columnDefs).map(key => columnDefs[key].header);
    const rows = data.map(item => 
      Object.keys(columnDefs).map(key => {
        let value = item[key];
        const def = columnDefs[key];
        
        // Format dates
        if (key.includes('date')) {
          value = formatDate(value);
        }
        // Format numbers using column-specific formatting
        else if (def.format && value !== null && value !== undefined) {
          value = def.format(value);
        }
        
        return value;
      })
    );

    // Create table
    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 80,
      margin: { top: 80, right: 20, left: 20 },
      styles: { 
        fontSize: 8,  // Increased font size slightly
        cellPadding: { top: 3, right: 4, bottom: 3, left: 4 }, // Increased padding
        overflow: 'linebreak',
        font: 'helvetica',
        cellWidth: 'wrap'
      },
      columnStyles: Object.fromEntries(
        Object.entries(columnDefs).map(([key, def], index) => [
          index,
          { 
            cellWidth: def.width,
            halign: ['price', 'quantity', 'net_money', 'market_price', 'accrued_interest'].includes(key) 
              ? 'right' 
              : ['id', 'buy_sell_indicator', 'product_type', 'settlement_status'].includes(key)
              ? 'center'
              : 'left',
            font: key === 'id' ? 'helvetica' : undefined,
            fontStyle: key === 'id' ? 'bold' : undefined
          }
        ])
      ),
      headStyles: {
        fillColor: [74, 222, 128],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9  // Slightly larger headers
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      didDrawPage: function(data) {
        // Add page number at the bottom
        doc.setFontSize(10);
        const pageNumber = `Page ${doc.internal.getCurrentPageInfo().pageNumber}`;
        doc.text(
          pageNumber,
          doc.internal.pageSize.width - doc.getTextWidth(pageNumber) - 20,
          doc.internal.pageSize.height - 20
        );
      }
    });

    doc.save(`${filename}.pdf`);
  };

  const convertToCSV = (data) => {
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header];
        // Handle values that contain commas or quotes
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  return (
    <ButtonGroup 
      variant="contained" 
      size="large"
      sx={{ 
        '& .MuiButton-root': {
          px: 4,
          py: 1.5,
          fontSize: '1rem'
        }
      }}
    >
      <Button 
        onClick={exportToCSV}
        startIcon={<FileDownloadIcon />}
        sx={{ 
          backgroundColor: '#4ade80',
          '&:hover': { backgroundColor: '#22c55e' }
        }}
      >
        CSV
      </Button>
      <Button 
        onClick={exportToXLSX}
        startIcon={<FileDownloadIcon />}
        sx={{ 
          backgroundColor: '#4ade80',
          '&:hover': { backgroundColor: '#22c55e' }
        }}
      >
        XLSX
      </Button>
      <Button 
        onClick={exportToPDF}
        startIcon={<FileDownloadIcon />}
        sx={{ 
          backgroundColor: '#4ade80',
          '&:hover': { backgroundColor: '#22c55e' }
        }}
      >
        PDF
      </Button>
    </ButtonGroup>
  );
}

export default ExportButtons; 