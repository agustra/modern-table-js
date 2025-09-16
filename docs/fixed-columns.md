# 📌 Fixed Columns

Complete guide for fixed columns feature in ModernTable.js.

## Enable Fixed Columns

```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: true, // Fix first column
  // or
  fixedColumns: 2, // Fix first 2 columns
  // or
  fixedColumns: {
    left: 2,  // Fix 2 columns on left
    right: 1  // Fix 1 column on right
  },
  columns: [...]
});
```

## Configuration Options

### Simple Configuration
```javascript
// Fix first column only
fixedColumns: true

// Fix first N columns
fixedColumns: 3

// Fix columns on both sides
fixedColumns: {
  left: 2,      // Fix 2 columns on left
  right: 1      // Fix 1 column on right
}
```

### Advanced Configuration
```javascript
fixedColumns: {
  left: 2,           // Number of left fixed columns
  right: 1,          // Number of right fixed columns
  leftColumns: 2,    // Alternative syntax
  rightColumns: 1    // Alternative syntax
}
```

## Use Cases

### Left Fixed Columns
Perfect for keeping important columns visible while scrolling:

```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 2 },
  columns: [
    { data: 'id', title: 'ID', width: '60px' },        // Fixed
    { data: 'name', title: 'Name', width: '150px' },   // Fixed
    { data: 'email', title: 'Email' },                 // Scrollable
    { data: 'phone', title: 'Phone' },                 // Scrollable
    { data: 'address', title: 'Address' },             // Scrollable
    { data: 'city', title: 'City' },                   // Scrollable
    { data: 'country', title: 'Country' }              // Scrollable
  ]
});
```

### Right Fixed Columns
Keep action columns always visible:

```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { right: 1 },
  columns: [
    { data: 'name', title: 'Name' },                   // Scrollable
    { data: 'email', title: 'Email' },                 // Scrollable
    { data: 'phone', title: 'Phone' },                 // Scrollable
    { data: 'address', title: 'Address' },             // Scrollable
    { data: 'actions', title: 'Actions', width: '120px' } // Fixed right
  ]
});
```

### Both Sides Fixed
Keep key columns and actions always visible:

```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 1, right: 1 },
  columns: [
    { data: 'name', title: 'Name', width: '150px' },   // Fixed left
    { data: 'email', title: 'Email' },                 // Scrollable
    { data: 'phone', title: 'Phone' },                 // Scrollable
    { data: 'department', title: 'Department' },       // Scrollable
    { data: 'salary', title: 'Salary' },               // Scrollable
    { data: 'actions', title: 'Actions', width: '120px' } // Fixed right
  ]
});
```

## Responsive Behavior

Fixed columns automatically adapt to screen size:

```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 2, right: 1 },
  responsive: true, // Works with responsive plugin
  
  // On mobile (≤768px), fixed columns are automatically disabled
  // when responsive mode is active
});
```

### Manual Responsive Control
```javascript
// Disable fixed columns on mobile
window.addEventListener('resize', () => {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    table.plugins.fixedColumns.disableTemporarily();
  } else {
    table.plugins.fixedColumns.applyFixedColumns();
  }
});
```

## Styling Fixed Columns

### Default Styling
Fixed columns automatically get:
- Sticky positioning
- Background color inheritance
- Border separators
- Z-index layering

### Custom Styling
```css
/* Custom fixed column styling */
.modern-table-fixed .fixed-left {
  background: #f8f9fa;
  border-right: 2px solid #007bff;
  box-shadow: 2px 0 4px rgba(0,0,0,0.1);
}

.modern-table-fixed .fixed-right {
  background: #fff3cd;
  border-left: 2px solid #ffc107;
  box-shadow: -2px 0 4px rgba(0,0,0,0.1);
}

/* Dark theme support */
[data-bs-theme="dark"] .modern-table-fixed .fixed-left,
[data-bs-theme="dark"] .modern-table-fixed .fixed-right {
  background: #212529;
  border-color: #495057;
}
```

## Column Search Integration

Fixed columns work seamlessly with column search:

```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 2 },
  columnSearch: true, // Column search inputs are also fixed
  columns: [
    { data: 'id', title: 'ID' },       // Fixed with search
    { data: 'name', title: 'Name' },   // Fixed with search
    { data: 'email', title: 'Email' }, // Scrollable with search
    // ...
  ]
});
```

## Performance Considerations

### Optimal Column Widths
```javascript
// Specify widths for better performance
columns: [
  { data: 'id', title: 'ID', width: '60px' },
  { data: 'name', title: 'Name', width: '150px' },
  { data: 'email', title: 'Email', width: '200px' },
  // ...
]
```

### Large Datasets
```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 1 },
  serverSide: true, // Use server-side processing for large datasets
  pageLength: 25,   // Reasonable page size
  columns: [...]
});
```

## Programmatic Control

### Update Fixed Columns
```javascript
// Change fixed columns configuration
table.plugins.fixedColumns.update({ left: 3, right: 0 });

// Disable fixed columns
table.plugins.fixedColumns.update({ left: 0, right: 0 });

// Re-enable fixed columns
table.plugins.fixedColumns.update({ left: 2, right: 1 });
```

### Check Current State
```javascript
// Get current configuration
const config = table.plugins.fixedColumns.options;
console.log('Left fixed:', config.left);
console.log('Right fixed:', config.right);

// Check if enabled
const isEnabled = table.plugins.fixedColumns.isEnabled;
```

## Common Patterns

### ID + Name + Actions
```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 2, right: 1 },
  columns: [
    { data: 'id', title: 'ID', width: '60px' },
    { data: 'name', title: 'Name', width: '150px' },
    { data: 'email', title: 'Email' },
    { data: 'phone', title: 'Phone' },
    { data: 'department', title: 'Department' },
    { data: 'actions', title: 'Actions', width: '120px' }
  ]
});
```

### Selection + Key Data
```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 2 },
  select: true, // Selection column is automatically fixed
  columns: [
    { data: 'name', title: 'Name', width: '150px' },
    { data: 'email', title: 'Email' },
    { data: 'phone', title: 'Phone' },
    { data: 'address', title: 'Address' }
  ]
});
```

### Financial Data Table
```javascript
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 1, right: 2 },
  columns: [
    { data: 'account', title: 'Account', width: '120px' }, // Fixed left
    { data: 'jan', title: 'Jan' },                         // Scrollable
    { data: 'feb', title: 'Feb' },                         // Scrollable
    { data: 'mar', title: 'Mar' },                         // Scrollable
    // ... more months
    { data: 'total', title: 'Total', width: '100px' },     // Fixed right
    { data: 'actions', title: 'Actions', width: '80px' }   // Fixed right
  ]
});
```

## Troubleshooting

### Common Issues

#### Fixed columns not working
```javascript
// Ensure table has horizontal scroll
.modern-table-wrapper {
  overflow-x: auto;
  max-width: 100%;
}

// Check if responsive mode is interfering
const table = new ModernTable('#myTable', {
  fixedColumns: { left: 2 },
  responsive: false // Disable if needed
});
```

#### Column widths not calculated correctly
```javascript
// Specify explicit widths
columns: [
  { data: 'id', title: 'ID', width: '60px' },
  { data: 'name', title: 'Name', width: '150px' },
  // ...
]

// Or recalculate after data load
table.on('dataLoaded', () => {
  setTimeout(() => {
    table.plugins.fixedColumns.applyFixedColumns();
  }, 100);
});
```

#### Dark theme styling issues
```css
/* Ensure proper dark theme support */
[data-bs-theme="dark"] .modern-table-fixed .fixed-left,
[data-bs-theme="dark"] .modern-table-fixed .fixed-right {
  background: var(--bs-dark);
  border-color: var(--bs-border-color);
}
```

## Complete Example

```javascript
const table = new ModernTable('#financialTable', {
  api: '/api/financial-data',
  
  // Fix account column on left, total and actions on right
  fixedColumns: { left: 1, right: 2 },
  
  // Enable horizontal scrolling
  scrollX: true,
  
  columns: [
    // Fixed left
    { 
      data: 'account', 
      title: 'Account Name', 
      width: '180px',
      className: 'font-weight-bold'
    },
    
    // Scrollable columns
    { data: 'jan', title: 'January', width: '100px' },
    { data: 'feb', title: 'February', width: '100px' },
    { data: 'mar', title: 'March', width: '100px' },
    { data: 'apr', title: 'April', width: '100px' },
    { data: 'may', title: 'May', width: '100px' },
    { data: 'jun', title: 'June', width: '100px' },
    { data: 'jul', title: 'July', width: '100px' },
    { data: 'aug', title: 'August', width: '100px' },
    { data: 'sep', title: 'September', width: '100px' },
    { data: 'oct', title: 'October', width: '100px' },
    { data: 'nov', title: 'November', width: '100px' },
    { data: 'dec', title: 'December', width: '100px' },
    
    // Fixed right
    { 
      data: 'total', 
      title: 'Total', 
      width: '120px',
      className: 'font-weight-bold text-end',
      render: (data) => `$${parseFloat(data).toLocaleString()}`
    },
    { 
      data: 'actions', 
      title: 'Actions', 
      width: '100px',
      orderable: false,
      searchable: false,
      render: (data, type, row) => `
        <button class="btn btn-sm btn-primary" onclick="editAccount(${row.id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteAccount(${row.id})">
          <i class="fas fa-trash"></i>
        </button>
      `
    }
  ],
  
  // Other options
  pageLength: 25,
  ordering: true,
  searching: true,
  
  // Responsive behavior
  responsive: true,
  
  // Custom CSS for better appearance
  drawCallback: function() {
    // Add custom styling after each draw
    this.wrapper.querySelector('.modern-table-fixed')?.classList.add('financial-table');
  }
});

// Custom CSS
const style = document.createElement('style');
style.textContent = `
  .financial-table .fixed-left {
    background: linear-gradient(90deg, #f8f9fa 0%, #e9ecef 100%);
    border-right: 3px solid #007bff;
  }
  
  .financial-table .fixed-right {
    background: linear-gradient(270deg, #f8f9fa 0%, #e9ecef 100%);
    border-left: 3px solid #28a745;
  }
  
  .financial-table td {
    white-space: nowrap;
  }
`;
document.head.appendChild(style);
```

## Best Practices

1. **Specify column widths** - Improves performance and appearance
2. **Limit fixed columns** - Too many fixed columns reduce scrollable space
3. **Consider mobile users** - Fixed columns auto-disable on small screens
4. **Use meaningful columns** - Fix important identification or action columns
5. **Test horizontal scrolling** - Ensure smooth scrolling experience
6. **Style consistently** - Match fixed column styling with table theme
7. **Performance testing** - Test with large datasets
8. **Responsive design** - Consider how fixed columns work with responsive features