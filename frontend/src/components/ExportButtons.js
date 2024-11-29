import React from 'react';
import { Button, Stack } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function ExportButtons({ data }) {
  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : 'N/A';
  };

  const formatTradeData = (trades) => {
    return trades.map(trade => ({
      'Settlement Date': formatDate(trade.settlement_date),
      'Type': trade.buy_sell_indicator,
      'Counterparty': trade.counterparty_name,
      'Product': trade.product_type,
      'Quantity': trade.quantity,
      'Price': trade.price,
      'Net Amount': trade.net_money,
      'Status': trade.settlement_status
    }));
  };

  const exportCSV = () => {
    const formattedData = formatTradeData(data);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `trades_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportXLSX = () => {
    const formattedData = formatTradeData(data);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Trades');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `trades_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={exportCSV}
        size="small"
      >
        Export CSV
      </Button>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={exportXLSX}
        size="small"
      >
        Export XLSX
      </Button>
    </Stack>
  );
}

export default ExportButtons; 