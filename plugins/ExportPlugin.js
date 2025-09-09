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
     * Copy to clipboard
     */
    async copyToClipboard() {
        try {
            const exportData = getExportData(this.table, { columns: [1, 2, 3, 4] });
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
    exportCSV() {
        try {
            const exportData = getExportData(this.table, { columns: [1, 2, 3, 4] });
            const csvContent = formatCSV(exportData);
            const filename = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
            
            downloadFile(csvContent, 'text/csv;charset=utf-8;', filename);
            showNotification('CSV file downloaded!', 'success');
        } catch (error) {
            console.error('CSV export error:', error);
            showNotification('Error exporting CSV', 'danger');
        }
    }

    /**
     * Export Excel
     */
    exportExcel() {
        try {
            const exportData = getExportData(this.table, { columns: [1, 2, 3, 4] });
            const excelContent = formatExcel(exportData);
            const filename = `users_export_${new Date().toISOString().split('T')[0]}.xls`;
            
            downloadFile(excelContent, 'application/vnd.ms-excel', filename);
            showNotification('Excel file downloaded!', 'success');
        } catch (error) {
            console.error('Excel export error:', error);
            showNotification('Error exporting Excel', 'danger');
        }
    }

    /**
     * Export PDF
     */
    exportPDF() {
        try {
            const exportData = getExportData(this.table, { columns: [1, 2, 3, 4] });
            const printContent = formatPrint(exportData, 'Users Report');
            
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
    print() {
        try {
            const exportData = getExportData(this.table, { columns: [1, 2, 3, 4] });
            const printContent = formatPrint(exportData, 'Users Table');
            
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