import React, { useState } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Stack,
  Card,
  Select,
  MenuItem,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import { useSettlementFails } from '../hooks/useSettlementFails';
import ExportButtons from './ExportButtons';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function SettlementFailsReport() {
  const { settlementFails, loading, error } = useSettlementFails();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const formatCurrency = (value) => {
    return value ? `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}` : '$0.00';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate pagination
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedFails = settlementFails.slice(startIndex, endIndex);
  const totalPages = Math.ceil(settlementFails.length / rowsPerPage);

  const handlePreviousPage = () => {
    setPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const renderMobileCard = (fail) => (
    <Card 
      key={fail.id}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 2,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '&:last-child': { mb: 0 },
        mx: { xs: 1, sm: 0 },
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          pb: 1,
          flexWrap: 'wrap',
        }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ minWidth: '80px' }}
          >
            Counterparty
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 500,
              maxWidth: '60%',
              wordBreak: 'break-word'
            }}
          >
            {fail.counterparty_name}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          pb: 1,
          flexWrap: 'wrap',
        }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ minWidth: '80px' }}
          >
            Date
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 500,
              maxWidth: '60%',
              wordBreak: 'break-word'
            }}
          >
            {formatDate(fail.settlement_date)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          pb: 1,
          flexWrap: 'wrap',
        }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ minWidth: '80px' }}
          >
            Days
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 500,
              maxWidth: '60%',
              wordBreak: 'break-word'
            }}
          >
            {fail.fail_days}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          pb: 1,
          flexWrap: 'wrap',
        }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ minWidth: '80px' }}
          >
            Value
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 500,
              maxWidth: '60%',
              wordBreak: 'break-word'
            }}
          >
            {formatCurrency(Math.abs(fail.net_money))}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          pb: 1,
          flexWrap: 'wrap',
        }}>
          <Typography 
            variant="subtitle2" 
            color="text.secondary"
            sx={{ minWidth: '80px' }}
          >
            Cost
          </Typography>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 500,
              maxWidth: '60%',
              wordBreak: 'break-word'
            }}
          >
            {formatCurrency(fail.fail_cost)}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '400px'
        }}
      >
        <CircularProgress sx={{ color: '#4ade80' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          Error loading settlement fails: {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 0.5, sm: 1 },
      maxWidth: '100%',
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        p: { xs: 0.5, sm: 1 },
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        mb: { xs: 1, sm: 2 },
        gap: { xs: 0.5, sm: 1 }
      }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontSize: { xs: '1.5rem', sm: '1.5rem' },
            fontWeight: 500,
          }}
        >
          Settlement Fail Analysis
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: 1,
          width: { xs: '100%', sm: 'auto' }
        }}>
          <ExportButtons 
            data={settlementFails}
            filename="settlement-fails"
          />
        </Box>
      </Box>
      
      {settlementFails.length === 0 ? (
        <Alert severity="info" sx={{ mx: { xs: 1, sm: 0 } }}>
          No settlement fails found.
        </Alert>
      ) : (
        <>
          {/* Mobile View */}
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>
            {paginatedFails.map(renderMobileCard)}

            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              px: { xs: 2, sm: 1 },
              flexWrap: 'wrap',
              gap: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                {`${startIndex + 1}–${Math.min(endIndex, settlementFails.length)} of ${settlementFails.length}`}
              </Typography>
              <Box>
                <IconButton 
                  onClick={handlePreviousPage} 
                  disabled={page === 0}
                  size="small"
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton 
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                  size="small"
                >
                  <NavigateNextIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Desktop View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Counterparty</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">Cost</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFails.map(fail => (
                    <TableRow key={fail.id}>
                      <TableCell>{fail.counterparty_name}</TableCell>
                      <TableCell>{formatDate(fail.settlement_date)}</TableCell>
                      <TableCell>{fail.fail_days}</TableCell>
                      <TableCell align="right">
                        {formatCurrency(Math.abs(fail.net_money))}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(fail.fail_cost)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Controls */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              alignItems: 'center',
              mt: 2,
              gap: 2
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  Rows per page:
                </Typography>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  size="small"
                  sx={{ mr: 2 }}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                  {`${startIndex + 1}–${Math.min(endIndex, settlementFails.length)} of ${settlementFails.length}`}
                </Typography>
              </Box>
              <Box>
                <IconButton 
                  onClick={handlePreviousPage} 
                  disabled={page === 0}
                  size="small"
                >
                  <NavigateBeforeIcon />
                </IconButton>
                <IconButton 
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                  size="small"
                >
                  <NavigateNextIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

export default SettlementFailsReport; 