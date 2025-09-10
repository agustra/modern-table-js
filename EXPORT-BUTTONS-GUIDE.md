# 📊 Export Buttons & Column Filtering Guide

Complete guide for ModernTable.js export functionality with column filtering.

## 🚀 Overview

This guide covers advanced export functionality. For basic usage, see [EXPORT-QUICK-REFERENCE.md](./EXPORT-QUICK-REFERENCE.md).

### Key Features
- 🎯 **Column Filtering** - Export only specific columns
- 📊 **Multiple Formats** - CSV, PDF, Print, Copy
- 🎨 **Custom Styling** - Bootstrap integration
- 🔧 **Advanced Options** - Conditional exports, data transformation

## 📋 Built-in Export Types

| Type | Description | Format | Icon |
|------|-------------|--------|------|
| `copy` | Copy to clipboard | Tab-separated | 📋 |
| `csv` | CSV export | Excel-compatible CSV | 📊 |
| `excel` | Excel export | CSV (Excel opens perfectly) | 📈 |
| `pdf` | PDF export | HTML print dialog | 📄 |
| `print` | Print table | HTML print | 🖨 |

## 🎯 Column Filtering Options

### 1. Specific Columns Array
```javascript
{
    extend: 'csv',
    exportColumns: ['name', 'email', 'status']  // Only these 3 columns
}
```

### 2. All Columns
```javascript
{
    extend: 'csv',
    exportColumns: 'all'  // All columns including hidden ones
}
```

### 3. Visible Columns Only
```javascript
{
    extend: 'csv', 
    exportColumns: 'visible'  // Only currently visible columns
}
```

### 4. Default (Smart Filtering)
```javascript
{
    extend: 'csv'
    // No exportColumns = smart default:
    // ✅ Include: visible data columns
    // ❌ Exclude: DT_RowIndex, action columns, hidden columns
}
```

## 🔧 Button Configuration Options

### Complete Button Configuration
```javascript
{
    extend: 'csv',                    // Export type
    text: 'Download CSV',             // Button text
    className: 'btn btn-success',     // CSS classes
    titleAttr: 'Export as CSV',       // Tooltip
    filename: 'my-export.csv',        // Download filename
    exportColumns: ['name', 'email'], // Column filtering
    attr: {                           // HTML attributes
        'id': 'csv-btn',
        'data-toggle': 'tooltip'
    }
}
```

### PDF-Specific Options
```javascript
{
    extend: 'pdf',
    text: 'PDF Report',
    exportColumns: ['name', 'email', 'status'],
    title: 'User Report',             // PDF title
    orientation: 'landscape',         // 'portrait' or 'landscape'
    pageSize: 'A4',                  // Page size
    filename: 'users-report.pdf'
}
```

### Print-Specific Options
```javascript
{
    extend: 'print',
    text: 'Print Table',
    exportColumns: ['name', 'email'],
    title: 'User List',              // Print title
    orientation: 'portrait'
}
```

## 🎨 Custom Button Styling

### Bootstrap Integration
```javascript
{
    extend: 'csv',
    text: 'Export',
    className: 'btn btn-success btn-sm',  // Bootstrap classes
    titleAttr: 'Export data as CSV'
}
```

### Custom Icons (Font Awesome)
```javascript
{
    extend: 'csv',
    text: '<i class="fas fa-download"></i> Download',  // Custom icon
    className: 'btn btn-primary'
}
```

### Custom Icons (CSS)
```javascript
{
    extend: 'csv',
    text: 'Export',
    className: 'btn btn-success btn-csv'  // CSS icon via .btn-csv::before
}
```

## 📊 Real-World Examples

### 1. Different Exports for Different Users
```javascript
const isAdmin = user.role === 'admin';

const buttons = [
    'copy',
    {
        extend: 'csv',
        text: 'Basic Export',
        exportColumns: ['name', 'email'],
        filename: 'users-basic.csv'
    }
];

if (isAdmin) {
    buttons.push({
        extend: 'csv',
        text: 'Full Export',
        exportColumns: 'all',
        filename: 'users-complete.csv',
        className: 'btn btn-warning'
    });
}

const table = new ModernTable('#table', { buttons });
```

### 2. Multi-Format Export
```javascript
const table = new ModernTable('#table', {
    buttons: [
        'copy',
        {
            extend: 'csv',
            text: 'CSV',
            exportColumns: ['name', 'email', 'phone'],
            filename: 'contacts.csv'
        },
        {
            extend: 'pdf',
            text: 'PDF Summary', 
            exportColumns: ['name', 'status'],
            title: 'User Summary',
            orientation: 'portrait'
        },
        {
            extend: 'print',
            text: 'Print List',
            exportColumns: ['name', 'email'],
            title: 'Contact List'
        }
    ]
});
```

### 3. Dynamic Column Selection
```javascript
{
    text: 'Custom Export',
    className: 'btn btn-primary',
    action: function(e, dt, node, config) {
        // Get currently visible columns
        const visibleColumns = dt.options.columns
            .filter((col, index) => dt.columnVisibility[index] !== false)
            .map(col => col.data);
            
        // Export only visible columns
        dt.plugins.export.exportCSV({
            columns: visibleColumns,
            filename: 'visible-data.csv'
        });
    }
}
```

## 🔍 Advanced Features

### 1. Conditional Export
```javascript
{
    extend: 'csv',
    text: 'Export Selected',
    exportColumns: ['name', 'email'],
    action: function(e, dt, node, config) {
        const selected = dt.getSelectedRows();
        if (selected.length === 0) {
            alert('Please select rows to export');
            return;
        }
        
        // Custom export logic for selected rows only
        const exportData = {
            headers: ['Name', 'Email'],
            rows: selected.map(row => [row.name, row.email])
        };
        
        dt.plugins.export.exportAsCSV(exportData, config, 'Selected rows exported!');
    }
}
```

### 2. Export with Data Transformation
```javascript
{
    extend: 'csv',
    text: 'Export Processed',
    exportColumns: ['name', 'email', 'status'],
    action: function(e, dt, node, config) {
        // Get filtered data
        const exportData = dt.plugins.export.getFilteredExportData(config);
        
        // Transform data
        exportData.rows = exportData.rows.map(row => [
            row[0].toUpperCase(),           // Name to uppercase
            row[1].toLowerCase(),           // Email to lowercase  
            row[2] === 'active' ? '✅' : '❌' // Status to emoji
        ]);
        
        dt.plugins.export.exportAsCSV(exportData, config, 'Processed data exported!');
    }
}
```

## 🎯 Best Practices

### 1. Column Selection Strategy
```javascript
// ✅ Good: Specific columns for different purposes
buttons: [
    {
        extend: 'csv',
        text: 'Contact List',
        exportColumns: ['name', 'email', 'phone']  // Contact info only
    },
    {
        extend: 'pdf', 
        text: 'Status Report',
        exportColumns: ['name', 'status', 'last_login']  // Status info only
    }
]

// ❌ Avoid: Same columns for all exports
buttons: [
    { extend: 'csv', exportColumns: 'all' },
    { extend: 'pdf', exportColumns: 'all' }  // Too much data for PDF
]
```

### 2. User-Friendly Naming
```javascript
// ✅ Good: Descriptive names
{
    extend: 'csv',
    text: 'Export Contacts',
    filename: 'contacts-' + new Date().toISOString().split('T')[0] + '.csv'
}

// ❌ Avoid: Generic names
{
    extend: 'csv',
    text: 'CSV',
    filename: 'export.csv'
}
```

### 3. Responsive Button Layout
```javascript
// ✅ Good: Responsive classes
{
    extend: 'csv',
    text: '<span class="d-none d-md-inline">Export </span>CSV',
    className: 'btn btn-success btn-sm'
}

// Mobile shows: "CSV"
// Desktop shows: "Export CSV"
```

## 🚨 Common Issues & Solutions

### Issue: Buttons not working
```javascript
// ❌ Problem: Missing extend
{
    text: 'Export',
    exportColumns: ['name', 'email']  // Won't work without extend
}

// ✅ Solution: Add extend
{
    extend: 'csv',
    text: 'Export', 
    exportColumns: ['name', 'email']
}
```

### Issue: Wrong columns exported
```javascript
// ❌ Problem: Column names don't match
columns: [
    { data: 'full_name', title: 'Name' },
    { data: 'email_address', title: 'Email' }
],
buttons: [{
    extend: 'csv',
    exportColumns: ['name', 'email']  // Wrong! Should be 'full_name', 'email_address'
}]

// ✅ Solution: Use correct data names
exportColumns: ['full_name', 'email_address']
```

### Issue: CSV opens in one cell (Excel)
```javascript
// ✅ Solution: Already handled by ModernTable.js
// Uses semicolon delimiter and BOM for Excel compatibility
// No action needed - works automatically
```

## 📚 API Reference

### exportColumns Options
| Value | Description | Example |
|-------|-------------|---------|
| `['col1', 'col2']` | Specific columns | `['name', 'email']` |
| `'all'` | All columns | Includes hidden columns |
| `'visible'` | Visible columns only | Respects column visibility |
| `undefined` | Smart default | Visible - system - action columns |

### Button Properties
| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `extend` | string | Export type | `'csv'`, `'pdf'`, `'print'` |
| `text` | string | Button text | `'Export Data'` |
| `className` | string | CSS classes | `'btn btn-primary'` |
| `exportColumns` | array/string | Column filter | `['name', 'email']` |
| `filename` | string | Download filename | `'users.csv'` |
| `title` | string | Export title | `'User Report'` |
| `orientation` | string | Page orientation | `'landscape'` |
| `titleAttr` | string | Tooltip text | `'Export as CSV'` |
| `attr` | object | HTML attributes | `{id: 'btn-csv'}` |

---

## 🎉 You're Ready!

With this guide, you can create powerful, flexible export functionality that gives users exactly the data they need in the format they want. Happy exporting! 🚀