# 📋 Export Buttons - Quick Reference

## 🚀 Basic Usage

```javascript
const table = new ModernTable('#table', {
    buttons: [
        'copy',                    // Default: all visible columns
        'csv',                     // Default: all visible columns  
        'pdf',                     // Default: all visible columns
        'print'                    // Default: all visible columns
    ]
});
```

## 🎯 Column Filtering

```javascript
buttons: [
    {
        extend: 'csv',
        text: 'Export',
        exportColumns: ['name', 'email']        // ✅ Specific columns
    },
    {
        extend: 'pdf',
        exportColumns: 'all'                    // ✅ All columns
    },
    {
        extend: 'print', 
        exportColumns: 'visible'                // ✅ Visible columns only
    }
]
```

## 📊 Export Types

| Button | Format | Best For |
|--------|--------|----------|
| `copy` | Tab-separated | Quick paste to Excel/Sheets |
| `csv` | Excel-compatible CSV | Data analysis |
| `pdf` | HTML print | Reports, presentations |
| `print` | HTML print | Physical documents |

## 🔧 Common Configurations

### Essential Data Export
```javascript
{
    extend: 'csv',
    text: 'Export Essential',
    exportColumns: ['name', 'email', 'phone'],
    filename: 'contacts.csv'
}
```

### Summary Report
```javascript
{
    extend: 'pdf',
    text: 'Summary Report', 
    exportColumns: ['name', 'status', 'created_at'],
    title: 'User Summary',
    orientation: 'landscape'
}
```

### Print List
```javascript
{
    extend: 'print',
    text: 'Print List',
    exportColumns: ['name', 'email'],
    title: 'Contact List'
}
```

## 🎨 Styling

```javascript
{
    extend: 'csv',
    text: 'Export',
    className: 'btn btn-success btn-sm',        // Bootstrap classes
    titleAttr: 'Export data as CSV file'        // Tooltip
}
```

## ⚡ Pro Tips

- Use `exportColumns: ['col1', 'col2']` for specific data
- Use `exportColumns: 'visible'` for user-controlled exports  
- Use different columns per export type
- Add descriptive `text` and `filename`
- Test with your actual data structure

## 🚨 Common Mistakes

❌ **Wrong column names**
```javascript
exportColumns: ['name', 'email']  // But column.data is 'full_name', 'email_address'
```

✅ **Correct column names**
```javascript
exportColumns: ['full_name', 'email_address']  // Match column.data exactly
```

---

**Need more details?** See [EXPORT-BUTTONS-GUIDE.md](./EXPORT-BUTTONS-GUIDE.md) for complete documentation.