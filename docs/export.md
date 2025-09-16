# 📤 Export Functions

Complete guide for export functionality in ModernTable.js.

## Built-in Export Buttons

```javascript
const table = new ModernTable('#myTable', {
  buttons: [
    'copy',    // Copy to clipboard
    'csv',     // Export as CSV
    'excel',   // Export as Excel
    'pdf',     // Export as PDF (print)
    'print'    // Print table
  ]
});
```

## Export Options

### CSV Export
```javascript
buttons: [
  {
    extend: 'csv',
    text: 'Export CSV',
    filename: 'users-export',
    exportColumns: 'visible', // 'all', 'visible', or array of indices
    title: 'User Report'
  }
]
```

### Excel Export
```javascript
buttons: [
  {
    extend: 'excel',
    text: 'Export Excel',
    filename: 'users-data.xlsx',
    sheetName: 'Users',
    exportColumns: [0, 1, 2, 3], // Specific columns
    title: 'User Directory'
  }
]
```

### PDF Export (Print)
```javascript
buttons: [
  {
    extend: 'pdf',
    text: 'Export PDF',
    filename: 'users-report',
    orientation: 'landscape', // 'portrait' or 'landscape'
    pageSize: 'A4',
    title: 'User Report',
    exportColumns: 'visible'
  }
]
```

### Copy to Clipboard
```javascript
buttons: [
  {
    extend: 'copy',
    text: 'Copy Data',
    exportColumns: 'visible',
    success: function() {
      alert('Data copied to clipboard!');
    }
  }
]
```

## Column Selection

### Export Specific Columns
```javascript
// By column names (data property)
exportColumns: ['name', 'email', 'status']

// By column indices
exportColumns: [0, 1, 2]

// All columns
exportColumns: 'all'

// Only visible columns
exportColumns: 'visible'
```

### Exclude Columns from Export
```javascript
columns: [
  { data: 'name', title: 'Name' },
  { data: 'email', title: 'Email' },
  { 
    data: 'actions', 
    title: 'Actions',
    exportable: false // Exclude from export
  }
]
```

## Programmatic Export

### Export Methods
```javascript
// Get export plugin
const exportPlugin = table.plugins.export;

// Export CSV
exportPlugin.exportCSV({
  filename: 'custom-export.csv',
  columns: ['name', 'email', 'status']
});

// Export Excel
exportPlugin.exportExcel({
  filename: 'users.xlsx',
  sheetName: 'User Data',
  columns: ['name', 'email', 'status']
});

// Copy to clipboard
exportPlugin.copyToClipboard({
  columns: ['name', 'email']
});

// Print
exportPlugin.print({
  title: 'User Directory',
  columns: ['name', 'email', 'status']
});
```

## Custom Export Functions

### Custom CSV Format
```javascript
function exportCustomCSV() {
  const data = table.getSelectedRows(); // Or table.data for all
  const headers = ['Name', 'Email', 'Status'];
  
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    const values = [
      `"${row.name}"`,
      `"${row.email}"`,
      `"${row.status}"`
    ];
    csv += values.join(',') + '\n';
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'custom-export.csv';
  link.click();
  window.URL.revokeObjectURL(url);
}
```

### Custom Excel Export
```javascript
function exportToExcel() {
  const data = table.data;
  const headers = ['Name', 'Email', 'Status'];
  
  // Create Excel-compatible XML
  let xml = '<?xml version="1.0"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += '<Worksheet ss:Name="Users">\n<Table>\n';
  
  // Headers
  xml += '<Row>\n';
  headers.forEach(header => {
    xml += `<Cell><Data ss:Type="String">${header}</Data></Cell>\n`;
  });
  xml += '</Row>\n';
  
  // Data rows
  data.forEach(row => {
    xml += '<Row>\n';
    xml += `<Cell><Data ss:Type="String">${row.name}</Data></Cell>\n`;
    xml += `<Cell><Data ss:Type="String">${row.email}</Data></Cell>\n`;
    xml += `<Cell><Data ss:Type="String">${row.status}</Data></Cell>\n`;
    xml += '</Row>\n';
  });
  
  xml += '</Table>\n</Worksheet>\n</Workbook>';
  
  // Download
  const blob = new Blob([xml], { 
    type: 'application/vnd.ms-excel' 
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'users.xls';
  link.click();
  window.URL.revokeObjectURL(url);
}
```

## Export Selected Rows Only

### Export Selection Button
```javascript
buttons: [
  {
    text: 'Export Selected',
    className: 'btn btn-info btn-sm',
    enabled: false,
    attr: { id: 'export-selected-btn' },
    action: function(e, dt) {
      const selected = dt.getSelectedRows();
      if (selected.length > 0) {
        exportSelectedData(selected);
      }
    }
  }
]

// Enable/disable based on selection
table.on('selectionChange', function(selectedRows) {
  const btn = document.getElementById('export-selected-btn');
  btn.disabled = selectedRows.length === 0;
});

function exportSelectedData(data) {
  const headers = ['Name', 'Email', 'Status'];
  let csv = headers.join(',') + '\n';
  
  data.forEach(row => {
    csv += `"${row.name}","${row.email}","${row.status}"\n`;
  });
  
  // Download CSV
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'selected-users.csv';
  link.click();
  window.URL.revokeObjectURL(url);
}
```

## Advanced Export Options

### Custom Data Processing
```javascript
buttons: [
  {
    extend: 'csv',
    text: 'Export Processed Data',
    exportColumns: ['name', 'email', 'status'],
    customize: function(csv) {
      // Process CSV before download
      return csv.replace(/inactive/g, 'INACTIVE');
    }
  }
]
```

### Export with Filters Applied
```javascript
function exportFilteredData() {
  // Get current filtered data
  const filteredData = table.filteredData || table.data;
  const filters = table.components.filterPanel?.getFilters() || {};
  
  // Add filter info to filename
  const filterInfo = Object.keys(filters).length > 0 
    ? '_filtered' 
    : '';
  
  const filename = `users${filterInfo}_${new Date().toISOString().split('T')[0]}.csv`;
  
  // Export with custom filename
  table.plugins.export.exportCSV({
    filename: filename,
    data: filteredData
  });
}
```

## Export Formatting

### Clean Data for Export
```javascript
columns: [
  {
    data: 'name',
    title: 'Name',
    render: function(data, type, row) {
      if (type === 'display') {
        return `<strong>${data}</strong>`;
      }
      if (type === 'export') {
        return data; // Clean text for export
      }
      return data;
    }
  },
  {
    data: 'status',
    title: 'Status',
    render: function(data, type, row) {
      if (type === 'display') {
        const badgeClass = data === 'active' ? 'success' : 'danger';
        return `<span class="badge bg-${badgeClass}">${data}</span>`;
      }
      if (type === 'export') {
        return data.toUpperCase(); // Format for export
      }
      return data;
    }
  }
]
```

### Date Formatting for Export
```javascript
{
  data: 'created_at',
  title: 'Created Date',
  render: function(data, type, row) {
    const date = new Date(data);
    
    if (type === 'display') {
      return date.toLocaleDateString();
    }
    if (type === 'export') {
      return date.toISOString().split('T')[0]; // YYYY-MM-DD for export
    }
    return data;
  }
}
```

## Export Notifications

### Success/Error Handling
```javascript
buttons: [
  {
    extend: 'csv',
    text: 'Export CSV',
    action: function(e, dt, node, config) {
      try {
        // Perform export
        dt.plugins.export.exportCSV(config);
        
        // Show success notification
        showNotification('CSV exported successfully!', 'success');
      } catch (error) {
        console.error('Export failed:', error);
        showNotification('Export failed. Please try again.', 'error');
      }
    }
  }
]

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999;';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}
```

## Print Customization

### Custom Print Styles
```javascript
buttons: [
  {
    extend: 'print',
    text: 'Print Report',
    title: 'User Directory',
    customize: function(win) {
      // Add custom CSS to print window
      const style = win.document.createElement('style');
      style.textContent = `
        @media print {
          body { font-family: Arial, sans-serif; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 8px; }
          th { background-color: #f0f0f0; }
          .no-print { display: none; }
        }
      `;
      win.document.head.appendChild(style);
    }
  }
]
```

## Complete Export Example

```javascript
const table = new ModernTable('#userTable', {
  api: '/api/users',
  columns: [
    { data: 'DT_RowIndex', title: 'No', exportable: false },
    { data: 'name', title: 'Name' },
    { data: 'email', title: 'Email' },
    { 
      data: 'status', 
      title: 'Status',
      render: function(data, type, row) {
        if (type === 'export') {
          return data.toUpperCase();
        }
        if (type === 'display') {
          const badgeClass = data === 'active' ? 'success' : 'danger';
          return `<span class="badge bg-${badgeClass}">${data}</span>`;
        }
        return data;
      }
    },
    { 
      data: 'created_at', 
      title: 'Created',
      render: function(data, type, row) {
        const date = new Date(data);
        if (type === 'export') {
          return date.toISOString().split('T')[0];
        }
        return date.toLocaleDateString();
      }
    },
    { data: 'actions', title: 'Actions', exportable: false }
  ],
  
  buttons: [
    // Standard exports
    {
      extend: 'copy',
      text: '<i class="fas fa-copy"></i> Copy',
      exportColumns: 'visible'
    },
    {
      extend: 'csv',
      text: '<i class="fas fa-file-csv"></i> CSV',
      filename: function() {
        return `users_${new Date().toISOString().split('T')[0]}`;
      },
      exportColumns: [1, 2, 3, 4] // Exclude row number and actions
    },
    {
      extend: 'excel',
      text: '<i class="fas fa-file-excel"></i> Excel',
      filename: 'users_export.xlsx',
      sheetName: 'User Data',
      exportColumns: [1, 2, 3, 4]
    },
    {
      extend: 'pdf',
      text: '<i class="fas fa-file-pdf"></i> PDF',
      orientation: 'landscape',
      pageSize: 'A4',
      title: 'User Directory Report',
      exportColumns: [1, 2, 3, 4]
    },
    
    // Custom export for selected rows
    {
      text: '<i class="fas fa-download"></i> Export Selected',
      className: 'btn btn-info btn-sm',
      enabled: false,
      attr: { id: 'export-selected-btn' },
      action: function(e, dt) {
        const selected = dt.getSelectedRows();
        exportSelectedUsers(selected);
      }
    }
  ],
  
  select: true,
  
  // Update export button state
  onSelectionChange: function(selectedRows) {
    const btn = document.getElementById('export-selected-btn');
    if (btn) {
      btn.disabled = selectedRows.length === 0;
    }
  }
});

// Custom export function for selected rows
function exportSelectedUsers(users) {
  const headers = ['Name', 'Email', 'Status', 'Created Date'];
  let csv = headers.join(',') + '\n';
  
  users.forEach(user => {
    const createdDate = new Date(user.created_at).toISOString().split('T')[0];
    const row = [
      `"${user.name}"`,
      `"${user.email}"`,
      `"${user.status.toUpperCase()}"`,
      `"${createdDate}"`
    ];
    csv += row.join(',') + '\n';
  });
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `selected_users_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
  
  showNotification(`Exported ${users.length} selected users`, 'success');
}
```

## Best Practices

1. **Clean data for export** - Use render functions with type checking
2. **Exclude system columns** - Set `exportable: false` for actions, row numbers
3. **Meaningful filenames** - Include dates and descriptive names
4. **Handle large datasets** - Consider pagination for exports
5. **User feedback** - Show notifications for export status
6. **Format consistency** - Use consistent date/number formats
7. **Column selection** - Allow users to choose which columns to export
8. **Error handling** - Gracefully handle export failures
9. **Performance** - Optimize for large data exports
10. **Accessibility** - Ensure export buttons are keyboard accessible