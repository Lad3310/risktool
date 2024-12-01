import React, { useState, useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Grid,
  Typography,
  Box,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import ExportButtons from './ExportButtons';

function TradesTable({ trades = [], initialFilter, id }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    settlementStatus: initialFilter?.status || 'all',
    counterparty: 'all',
    startDate: '',
    endDate: '',
    type: initialFilter?.type || 'all'
  });

  useEffect(() => {
    if (initialFilter) {
      setFilters(prev => ({
        ...prev,
        settlementStatus: initialFilter.status || prev.settlementStatus,
        type: initialFilter.type || prev.type
      }));
      setPage(0);
    }
  }, [initialFilter]);

  const counterparties = ['all', ...new Set(trades.map(trade => trade.counterparty_name || 'Unknown'))];
  
  const filteredTrades = trades.filter(trade => {
    if (filters.settlementStatus !== 'all' && 
        trade.settlement_status?.toLowerCase() !== filters.settlementStatus?.toLowerCase()) return false;
    if (filters.type !== 'all' && 
        trade.buy_sell_indicator !== filters.type) return false;
    if (filters.counterparty !== 'all' && 
        trade.counterparty_name !== filters.counterparty) return false;
    if (filters.startDate && 
        new Date(trade.settlement_date) < new Date(filters.startDate)) return false;
    if (filters.endDate && 
        new Date(trade.settlement_date) > new Date(filters.endDate)) return false;
    return true;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const getVisibleColumns = () => {
    if (isMobile) {
      return ['settlement_date', 'type', 'net_amount', 'status'];
    }
    if (isTablet) {
      return ['settlement_date', 'type', 'counterparty', 'net_amount', 'status'];
    }
    return ['settlement_date', 'type', 'counterparty', 'product', 'quantity', 'price', 'net_amount', 'status'];
  };

  const visibleColumns = getVisibleColumns();

  const formatCurrency = (value) => {
    return value ? value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    }) : '$0.00';
  };

  return (
    <Paper id={id} sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: 3 }}>
      <Box sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Trade Details
          </Typography>
          <ExportButtons data={filteredTrades} />
        </Box>
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            size={isMobile ? "small" : "medium"}
            label="Settlement Status"
            value={filters.settlementStatus}
            onChange={(e) => setFilters({ ...filters, settlementStatus: e.target.value })}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="settled">Settled</MenuItem>
            <MenuItem value="unsettled">Unsettled</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            size={isMobile ? "small" : "medium"}
            label="Counterparty"
            value={filters.counterparty}
            onChange={(e) => setFilters({ ...filters, counterparty: e.target.value })}
          >
            {counterparties.map(cp => (
              <MenuItem key={cp} value={cp}>{cp === 'all' ? 'All Counterparties' : cp}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="date"
            fullWidth
            size={isMobile ? "small" : "medium"}
            label="Start Date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            type="date"
            fullWidth
            size={isMobile ? "small" : "medium"}
            label="End Date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <TableContainer>
        <Table size={isMobile ? "small" : "medium"}>
          <TableHead>
            <TableRow>
              {visibleColumns.includes('settlement_date') && <TableCell>Settlement Date</TableCell>}
              {visibleColumns.includes('type') && <TableCell>Type</TableCell>}
              {visibleColumns.includes('counterparty') && <TableCell>Counterparty</TableCell>}
              {visibleColumns.includes('product') && <TableCell>Product</TableCell>}
              {visibleColumns.includes('quantity') && <TableCell align="right">Qty</TableCell>}
              {visibleColumns.includes('price') && <TableCell align="right">Price</TableCell>}
              {visibleColumns.includes('net_amount') && <TableCell align="right">Net</TableCell>}
              {visibleColumns.includes('status') && <TableCell>Status</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {(filteredTrades || [])
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((trade) => (
                <TableRow key={trade.id}>
                  {visibleColumns.includes('settlement_date') && 
                    <TableCell>
                      {trade.settlement_date ? 
                        new Date(trade.settlement_date).toLocaleDateString() : 
                        'N/A'
                      }
                    </TableCell>
                  }
                  {visibleColumns.includes('type') && <TableCell>{trade.buy_sell_indicator}</TableCell>}
                  {visibleColumns.includes('counterparty') && <TableCell>{trade.counterparty_name}</TableCell>}
                  {visibleColumns.includes('product') && <TableCell>{trade.product_type}</TableCell>}
                  {visibleColumns.includes('quantity') && <TableCell align="right">{trade.quantity?.toLocaleString()}</TableCell>}
                  {visibleColumns.includes('price') && <TableCell align="right">{formatCurrency(trade.price)}</TableCell>}
                  {visibleColumns.includes('net_amount') && <TableCell align="right">{formatCurrency(trade.net_money)}</TableCell>}
                  {visibleColumns.includes('status') && <TableCell>{trade.settlement_status}</TableCell>}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredTrades.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}

export default TradesTable; 