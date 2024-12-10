import React from 'react';
import { Button, Box } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

function ExportButtons({ data, filename = 'report', columnDefs, title }) {
  // Add validation check
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null; // Don't render export buttons if no data
  }

  const exportToCSV = () => {
    if (!data || !columnDefs) return;

    const headers = Object.values(columnDefs).map(def => def.header);
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const values = Object.keys(columnDefs).map(key => {
        let value = item[key];
        const def = columnDefs[key];
        if (def.format && value != null) {
          value = def.format(value);
        }
        return `"${value || ''}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToXLSX = () => {
    if (!data || !columnDefs) return;

    const formattedData = data.map(item => {
      const newItem = {};
      Object.keys(columnDefs).forEach(key => {
        const def = columnDefs[key];
        let value = item[key];
        if (def.format && value != null) {
          value = def.format(value);
        }
        newItem[def.header] = value || '';
      });
      return newItem;
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data || !columnDefs) return;

    const doc = new jsPDF('landscape', 'pt', 'a4');
    
    // Add title
    doc.setFontSize(16);
    doc.text(title || 'Report', 40, 40);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 60);

    const headers = Object.values(columnDefs).map(def => def.header);
    const rows = data.map(item => 
      Object.keys(columnDefs).map(key => {
        let value = item[key];
        const def = columnDefs[key];
        if (def.format && value != null) {
          value = def.format(value);
        }
        return value || '';
      })
    );

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 80,
      margin: { top: 80 },
      styles: { 
        fontSize: 9,
        cellPadding: 3,
        halign: 'center', // Center align all cells
      },
      columnStyles: Object.fromEntries(
        Object.entries(columnDefs).map(([key, def], index) => [
          index,
          { 
            cellWidth: def.width,
          }
        ])
      ),
      headStyles: {
        fillColor: [74, 222, 128],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
      {[
        { label: 'CSV', onClick: exportToCSV },
        { label: 'XLSX', onClick: exportToXLSX },
        { label: 'PDF', onClick: exportToPDF }
      ].map((button) => (
        <Button 
          key={button.label}
          onClick={button.onClick}
          startIcon={<FileDownloadIcon />}
          variant="contained"
          fullWidth
          size="large"
          sx={{ 
            backgroundColor: '#3b82f6',
            '&:hover': { backgroundColor: '#2563eb' },
            fontSize: { xs: '0.875rem', sm: '1rem' },
            py: { xs: 1, sm: 1.5 }
          }}
        >
          {button.label}
        </Button>
      ))}
    </Box>
  );
}

export default ExportButtons; 