/**
 * Export utilities for ModernTable.js
 */

/**
 * Download file helper
 */
export function downloadFile(content, mimeType, filename) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

/**
 * Get table data for export
 */
export function getExportData(table, options = {}) {
    const columns = options.columns || table.options.columns.map((_, index) => index);
    const data = table.data || [];
    
    // Get headers
    const headers = columns.map(colIndex => {
        const column = table.options.columns[colIndex];
        return column ? column.title : '';
    }).filter(Boolean);
    
    // Get rows data
    const rows = data.map(rowData => {
        return columns.map(colIndex => {
            const column = table.options.columns[colIndex];
            if (!column) return '';
            
            let cellValue = table.getCellValue(rowData, column.data);
            
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
 * Format data for CSV
 */
export function formatCSV(data) {
    const lines = [];
    
    // Add headers
    if (data.headers && data.headers.length > 0) {
        const csvHeaders = data.headers.map(header => `"${String(header).replace(/"/g, '""')}"`);
        lines.push(csvHeaders.join(','));
    }
    
    // Add data rows
    data.rows.forEach(row => {
        const csvRow = row.map(cell => {
            const cellStr = String(cell || '');
            const escaped = cellStr.replace(/"/g, '""');
            return `"${escaped}"`;
        });
        lines.push(csvRow.join(','));
    });
    
    return lines.join('\n');
}

/**
 * Format data for Excel (XML format)
 */
export function formatExcel(data) {
    let xml = '<?xml version="1.0"?>\n';
    xml += '<?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += ' xmlns:o="urn:schemas-microsoft-com:office:office"\n';
    xml += ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n';
    xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xml += ' xmlns:html="http://www.w3.org/TR/REC-html40">\n';
    xml += '<Worksheet ss:Name="Sheet1">\n<Table>\n';
    
    // Add headers
    if (data.headers && data.headers.length > 0) {
        xml += '<Row>\n';
        data.headers.forEach(header => {
            xml += `<Cell><Data ss:Type="String">${escapeXml(String(header))}</Data></Cell>\n`;
        });
        xml += '</Row>\n';
    }
    
    // Add data rows
    data.rows.forEach(row => {
        xml += '<Row>\n';
        row.forEach(cell => {
            const cellValue = String(cell || '');
            const isNumber = !isNaN(cellValue) && !isNaN(parseFloat(cellValue)) && cellValue.trim() !== '';
            const dataType = isNumber ? 'Number' : 'String';
            xml += `<Cell><Data ss:Type="${dataType}">${escapeXml(cellValue)}</Data></Cell>\n`;
        });
        xml += '</Row>\n';
    });
    
    xml += '</Table>\n</Worksheet>\n</Workbook>';
    return xml;
}

/**
 * Format data for print
 */
export function formatPrint(data, title = 'Table Data') {
    let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #333; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; font-weight: bold; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                @media print {
                    body { margin: 0; }
                    table { font-size: 12px; }
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <table>
    `;
    
    // Add headers
    if (data.headers && data.headers.length > 0) {
        html += '<thead><tr>';
        data.headers.forEach(header => {
            html += `<th>${escapeHtml(String(header))}</th>`;
        });
        html += '</tr></thead>';
    }
    
    // Add data rows
    html += '<tbody>';
    data.rows.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            html += `<td>${escapeHtml(String(cell || ''))}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += `
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
                Generated on ${new Date().toLocaleString()}
            </p>
        </body>
        </html>
    `;
    
    return html;
}

/**
 * Copy data to clipboard
 */
export async function copyToClipboard(data) {
    const text = formatClipboard(data);
    
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.warn('Clipboard API failed, using fallback');
        }
    }
    
    // Fallback for older browsers
    return copyToClipboardFallback(text);
}

/**
 * Format data for clipboard (tab-separated)
 */
function formatClipboard(data) {
    const lines = [];
    
    // Add headers
    if (data.headers && data.headers.length > 0) {
        lines.push(data.headers.join('\t'));
    }
    
    // Add data rows
    data.rows.forEach(row => {
        lines.push(row.map(cell => String(cell || '')).join('\t'));
    });
    
    return lines.join('\n');
}

/**
 * Fallback clipboard copy for older browsers
 */
function copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
    } catch (err) {
        document.body.removeChild(textarea);
        return false;
    }
}

/**
 * Escape XML characters
 */
function escapeXml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Escape HTML characters
 */
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Show notification
 */
export function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}