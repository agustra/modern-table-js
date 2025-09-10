/**
 * ExportPlugin.js - Export functionality plugin for ModernTable.js
 * Sesuai master plan: plugins/ExportPlugin.js (3KB)
 */

import { getExportData, formatCSV, formatExcel, formatPrint, copyToClipboard, downloadFile, showNotification } from '../utils/exportUtils.js';

export class ExportPlugin {
    constructor(table) {
        this.table = table;
        this.init();
    }

    init() {
        // Plugin initialization
        console.log('ExportPlugin initialized');
    }
    
    /**
     * Get filtered export data based on options
     */
    getFilteredExportData(options = {}) {
        // Get column data names to export
        const columnNames = options.columns || this.getDefaultColumnNames();
        
        // Convert column names to actual data
        const headers = [];
        const columnIndices = [];
        
        columnNames.forEach(columnName => {
            const columnIndex = this.table.options.columns.findIndex(col => col.data === columnName);
            if (columnIndex !== -1) {
                const column = this.table.options.columns[columnIndex];
                headers.push(column.title || column.data);
                columnIndices.push(columnIndex);
            }
        });
        
        // Get rows data
        const rows = this.table.data.map(rowData => {
            return columnIndices.map(colIndex => {
                const column = this.table.options.columns[colIndex];
                if (!column) return '';
                
                let cellValue = this.table.getCellValue(rowData, column.data);
                
                // Apply render function but strip HTML for export
                if (column.render && typeof column.render === 'function') {
                    cellValue = column.render(cellValue, 'export', rowData);
                }
                
                // Strip HTML tags for clean export
                if (typeof cellValue === 'string') {
                    cellValue = cellValue.replace(/<[^>]*>/g, '').trim();
                }
                
                return cellValue || '';
            });
        });
        
        return { headers, rows };
    }
    
    /**
     * Get default column names for export (exclude system columns)
     */
    getDefaultColumnNames() {
        return this.table.options.columns
            .filter(col => {
                // Skip system columns
                if (col.data === 'DT_RowIndex') return false;
                // Skip action columns by default
                if (col.data === 'action') return false;
                return true;
            })
            .map(col => col.data);
    }
    
    /**
     * Generate Excel content in HTML table format (reliable method)
     */
    generateExcelHTML(data, options = {}) {
        const sheetName = options.sheetName || 'Sheet1';
        
        let html = `<?xml version="1.0"?>
`;
        html += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
`;
        html += ` xmlns:o="urn:schemas-microsoft-com:office:office"
`;
        html += ` xmlns:x="urn:schemas-microsoft-com:office:excel"
`;
        html += ` xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
`;
        html += ` xmlns:html="http://www.w3.org/TR/REC-html40">
`;
        
        html += `<Worksheet ss:Name="${sheetName}">
`;
        html += `<Table>
`;
        
        // Add header row
        if (data.headers) {
            html += `<Row>
`;
            data.headers.forEach(header => {
                html += `<Cell><Data ss:Type="String">${this.escapeHTML(header)}</Data></Cell>
`;
            });
            html += `</Row>
`;
        }
        
        // Add data rows
        data.rows.forEach(row => {
            html += `<Row>
`;
            row.forEach(cell => {
                const cellValue = String(cell || '');
                const isNumber = !isNaN(cellValue) && cellValue !== '';
                const dataType = isNumber ? 'Number' : 'String';
                html += `<Cell><Data ss:Type="${dataType}">${this.escapeHTML(cellValue)}</Data></Cell>
`;
            });
            html += `</Row>
`;
        });
        
        html += `</Table>
`;
        html += `</Worksheet>
`;
        html += `</Workbook>`;
        
        return html;
    }
    
    /**
     * Get Excel cell reference (A1, B1, etc.)
     */
    getCellReference(row, col) {
        let colName = '';
        while (col > 0) {
            col--;
            colName = String.fromCharCode(65 + (col % 26)) + colName;
            col = Math.floor(col / 26);
        }
        return colName + row;
    }
    
    /**
     * Escape HTML characters for Excel
     */
    escapeHTML(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /**
     * Copy to clipboard
     */
    async copyToClipboard(options = {}) {
        try {
            const exportData = this.getFilteredExportData(options);
            const success = await copyToClipboard(exportData);
            
            if (success) {
                showNotification('Data copied to clipboard!', 'success');
            } else {
                showNotification('Failed to copy data', 'danger');
            }
        } catch (error) {
            console.error('Copy error:', error);
            showNotification('Error copying data', 'danger');
        }
    }

    /**
     * Export CSV
     */
    exportCSV(options = {}) {
        try {
            // Get export data with column filtering
            const exportData = this.getFilteredExportData(options);
            
            // Use Excel-compatible CSV format
            const csvContent = this.formatExcelCSV(exportData);
            const filename = options.filename || `users_export_${new Date().toISOString().split('T')[0]}.csv`;
            
            // Use Excel-compatible MIME type and encoding
            downloadFile('\ufeff' + csvContent, 'text/csv;charset=utf-8;', filename);
            showNotification('CSV file downloaded!', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            showNotification('Error exporting CSV', 'danger');
        }
    }

    /**
     * Export Excel using simple XLSX binary format
     */
    exportExcel(options = {}) {
        try {
            // Get export data with column filtering
            const exportData = this.getFilteredExportData(options);
            
            // Check if we should use CSV format (safer)
            if (options.format === 'csv' || !this.canGenerateXLSX()) {
                return this.exportAsCSV(exportData, options, 'Excel-compatible CSV');
            }
            
            // Generate proper XLSX using minimal binary format
            const xlsxContent = this.generateMinimalXLSX(exportData, options);
            
            // Use .xlsx extension
            let filename = options.filename || `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
            if (!filename.endsWith('.xlsx')) {
                filename = filename.replace(/\.[^.]+$/, '.xlsx');
            }
            
            // Download as XLSX
            downloadFile(xlsxContent, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', filename);
            showNotification('Excel file downloaded!', 'success');
        } catch (error) {
            console.error('Excel export error:', error);
            // Fallback to CSV
            this.exportAsCSV(this.getFilteredExportData(options), options, 'Excel-compatible CSV (fallback)');
        }
    }
    
    /**
     * Export as CSV with custom message
     */
    exportAsCSV(exportData, options, message = 'CSV downloaded!') {
        // Use Excel-compatible CSV format
        const csvContent = this.formatExcelCSV(exportData);
        let filename = options.filename || `users_export_${new Date().toISOString().split('T')[0]}.csv`;
        
        if (!filename.endsWith('.csv')) {
            filename = filename.replace(/\.[^.]+$/, '.csv');
        }
        
        // Use Excel-compatible MIME type and encoding
        downloadFile('\ufeff' + csvContent, 'text/csv;charset=utf-8;', filename);
        showNotification(message, 'success');
    }
    
    /**
     * Check if we can generate XLSX (for future SheetJS integration)
     */
    canGenerateXLSX() {
        return false; // For now, always use CSV for reliability
    }
    
    /**
     * Generate minimal XLSX (placeholder for future implementation)
     */
    generateMinimalXLSX(data, options) {
        // This would require SheetJS library or similar
        // For now, fallback to CSV
        throw new Error('XLSX generation not implemented, using CSV fallback');
    }
    
    /**
     * Format CSV for Excel compatibility
     */
    formatExcelCSV(data) {
        const lines = [];
        
        // Add headers
        if (data.headers && data.headers.length > 0) {
            // Use semicolon delimiter for Excel
            const csvHeaders = data.headers.map(header => String(header).replace(/;/g, ','));
            lines.push(csvHeaders.join(';'));
        }
        
        // Add data rows
        data.rows.forEach(row => {
            const csvRow = row.map(cell => {
                const cellStr = String(cell || '');
                // Escape semicolons and quotes
                return cellStr.replace(/;/g, ',').replace(/"/g, '""');
            });
            lines.push(csvRow.join(';'));
        });
        
        return lines.join('\r\n');
    }

    /**
     * Export PDF
     */
    exportPDF(options = {}) {
        try {
            // Get export data with column filtering
            const exportData = this.getFilteredExportData(options);
            const printContent = formatPrint(exportData, options.title || 'Users Report');
            
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.onload = () => {
                    printWindow.focus();
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
                showNotification('PDF print dialog opened!', 'info');
            }
        } catch (error) {
            console.error('PDF export error:', error);
            showNotification('Error exporting PDF', 'danger');
        }
    }

    /**
     * Print table
     */
    print(options = {}) {
        try {
            // Get export data with column filtering
            const exportData = this.getFilteredExportData(options);
            const printContent = formatPrint(exportData, options.title || 'Users Table');
            
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.onload = () => {
                    printWindow.focus();
                    printWindow.print();
                    setTimeout(() => printWindow.close(), 1000);
                };
                showNotification('Print dialog opened!', 'info');
            }
        } catch (error) {
            console.error('Print error:', error);
            showNotification('Error printing table', 'danger');
        }
    }
}