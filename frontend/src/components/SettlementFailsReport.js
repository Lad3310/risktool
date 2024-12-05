import React from 'react';
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
  Card
} from '@mui/material';
import { useSettlementFails } from '../hooks/useSettlementFails';

function SettlementFailsReport() {
  const { settlementFails, loading, error } = useSettlementFails();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const renderMobileCard = (fail) => (
    <Card 
      key={fail.id}
      sx={{
        p: 2,
        mb: 2,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        '&:last-child': { mb: 0 }
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Counterparty
          </Typography>
          <Typography>{fail.counterparty_name}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Date
          </Typography>
          <Typography>{formatDate(fail.settlement_date)}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Days
          </Typography>
          <Typography>{fail.fail_days}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Value
          </Typography>
          <Typography>{formatCurrency(Math.abs(fail.net_money))}</Typography>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">
            Cost
          </Typography>
          <Typography>{formatCurrency(fail.fail_cost)}</Typography>
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
    <Box sx={{ p: { xs: 0.5, sm: 3 } }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          fontSize: { xs: '1.125rem', sm: '1.5rem' },
          fontWeight: 500,
          px: { xs: 1, sm: 0 }
        }}
      >
        Settlement Fail Analysis
      </Typography>
      
      {settlementFails.length === 0 ? (
        <Alert severity="info" sx={{ mx: { xs: 1, sm: 0 } }}>
          No settlement fails found.
        </Alert>
      ) : (
        <>
          {/* Mobile View */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, px: 1 }}>
            {settlementFails.map(renderMobileCard)}
          </Box>

          {/* Desktop View */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                borderRadius: 1,
                overflow: 'auto',
                maxWidth: '100%',
                '&::-webkit-scrollbar': {
                  height: '6px'
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#cbd5e1',
                  borderRadius: '3px'
                }
              }}
            >
              <Table 
                sx={{
                  minWidth: 650,
                  '& .MuiTableCell-root': {
                    borderBottom: '1px solid #e2e8f0',
                    px: 3,
                    py: 2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  },
                  '& .MuiTableHead-root': {
                    backgroundColor: '#fff',
                    '& .MuiTableCell-root': {
                      borderBottom: '1px solid #e2e8f0',
                      color: '#475569',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }
                  },
                  '& .MuiTableBody-root': {
                    '& .MuiTableRow-root': {
                      '&:hover': {
                        backgroundColor: '#f8fafc',
                      },
                      '& .MuiTableCell-root': {
                        fontSize: '0.875rem',
                        color: '#1e293b',
                        '&[align="right"]': {
                          color: '#475569',
                        }
                      }
                    }
                  }
                }}
              >
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
                  {settlementFails.map(fail => (
                    <TableRow 
                      key={fail.id}
                      sx={{
                        transition: 'background-color 0.2s ease',
                      }}
                    >
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
          </Box>
        </>
      )}
    </Box>
  );
}

export default SettlementFailsReport; 