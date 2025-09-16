# Button System

Complete guide for configuring buttons in ModernTable.js.

## Built-in Buttons

```javascript
const table = new ModernTable('#myTable', {
  buttons: [
    'copy',     // Copy to clipboard
    'csv',      // Export as CSV
    'excel',    // Export as Excel
    'pdf',      // Export as PDF
    'print',    // Print table
    'colvis'    // Column visibility toggle
  ]
});
```

## Custom Buttons

```javascript
const table = new ModernTable('#myTable', {
  buttons: [
    {
      text: '<i class="fas fa-plus"></i> Add New',
      className: 'btn btn-success btn-sm',
      action: function(e, dt, node, config) {
        // Custom action
        window.location.href = '/users/create';
      }
    },
    {
      text: 'Refresh',
      className: 'btn btn-secondary btn-sm',
      action: function(e, dt, node, config) {
        dt.reload();
      }
    }
  ]
});
```

## Button Configuration Properties

| Property | Type | Description |
|----------|------|-------------|
| `text` | string | Button text/HTML |
| `className` | string | CSS classes |
| `action` | function | Click handler |
| `init` | function | Initialization callback |
| `destroy` | function | Cleanup callback |
| `enabled` | boolean | Initial enabled state |
| `attr` | object | HTML attributes |
| `extend` | string | Extend built-in button |

## Export Buttons with Options

```javascript
buttons: [
  {
    extend: 'csv',
    text: 'Export CSV',
    filename: 'users-export',
    exportColumns: 'visible', // 'all', 'visible', or array
    title: 'User Report'
  },
  {
    extend: 'excel',
    text: 'Export Excel',
    filename: 'users-data',
    sheetName: 'Users',
    exportColumns: [0, 1, 2, 3] // Specific columns
  },
  {
    extend: 'pdf',
    text: 'Export PDF',
    orientation: 'landscape',
    pageSize: 'A4',
    title: 'User Directory'
  }
]
```

## Conditional Buttons

```javascript
buttons: [
  {
    text: 'Bulk Delete',
    className: 'btn btn-danger btn-sm',
    enabled: false, // Initially disabled
    attr: {
      id: 'bulk-delete-btn'
    },
    action: function(e, dt, node, config) {
      const selected = dt.getSelectedRows();
      if (selected.length > 0) {
        if (confirm(`Delete ${selected.length} selected users?`)) {
          // Perform bulk delete
          bulkDeleteUsers(selected);
        }
      }
    }
  }
]
```

## Dynamic Button Text

```javascript
buttons: [
  {
    text: 'Delete Selected (<span class="selected-count">0</span>)',
    className: 'btn btn-danger btn-sm',
    enabled: false,
    action: function(e, dt, node, config) {
      const selected = dt.getSelectedRows();
      bulkDelete(selected);
    }
  }
]

// Update button text when selection changes
table.on('selectionChange', function(selectedRows) {
  const btn = document.getElementById('bulk-delete-btn');
  const countSpan = btn.querySelector('.selected-count');
  countSpan.textContent = selectedRows.length;
  btn.disabled = selectedRows.length === 0;
});
```

## Button Groups

```javascript
buttons: [
  // Export group
  {
    text: '<i class="fas fa-download"></i>',
    className: 'btn btn-outline-secondary btn-sm dropdown-toggle',
    attr: {
      'data-bs-toggle': 'dropdown'
    }
  },
  
  // Action group
  {
    text: '<i class="fas fa-cog"></i> Actions',
    className: 'btn btn-primary btn-sm dropdown-toggle',
    attr: {
      'data-bs-toggle': 'dropdown'
    }
  }
]
```

## Button Initialization

```javascript
buttons: [
  {
    text: 'Advanced Search',
    className: 'btn btn-info btn-sm',
    init: function(dt, node, config) {
      // Initialize tooltip
      node.setAttribute('data-bs-toggle', 'tooltip');
      node.setAttribute('title', 'Open advanced search panel');
      
      // Initialize Bootstrap tooltip
      new bootstrap.Tooltip(node);
    },
    action: function(e, dt, node, config) {
      toggleAdvancedSearch();
    },
    destroy: function(dt, node, config) {
      // Cleanup tooltip
      const tooltip = bootstrap.Tooltip.getInstance(node);
      if (tooltip) {
        tooltip.dispose();
      }
    }
  }
]
```

## Permission-based Buttons

```javascript
function createButtons(userPermissions) {
  const buttons = ['copy', 'csv'];
  
  if (userPermissions.includes('create_users')) {
    buttons.push({
      text: '<i class="fas fa-plus"></i> Add User',
      className: 'btn btn-success btn-sm',
      action: () => window.location.href = '/users/create'
    });
  }
  
  if (userPermissions.includes('export_data')) {
    buttons.push('excel', 'pdf');
  }
  
  if (userPermissions.includes('bulk_delete')) {
    buttons.push({
      text: 'Bulk Delete',
      className: 'btn btn-danger btn-sm',
      enabled: false,
      action: function(e, dt) {
        const selected = dt.getSelectedRows();
        bulkDeleteUsers(selected);
      }
    });
  }
  
  return buttons;
}

const table = new ModernTable('#myTable', {
  buttons: createButtons(window.userPermissions)
});
```

## Modal Buttons

```javascript
buttons: [
  {
    text: '<i class="fas fa-filter"></i> Filters',
    className: 'btn btn-outline-secondary btn-sm',
    action: function(e, dt, node, config) {
      // Show filter modal
      const modal = new bootstrap.Modal(document.getElementById('filterModal'));
      modal.show();
    }
  },
  {
    text: '<i class="fas fa-cog"></i> Settings',
    className: 'btn btn-outline-secondary btn-sm',
    action: function(e, dt, node, config) {
      // Show settings modal
      showTableSettings(dt);
    }
  }
]
```

## AJAX Buttons

```javascript
buttons: [
  {
    text: '<i class="fas fa-sync"></i> Sync Data',
    className: 'btn btn-warning btn-sm',
    action: async function(e, dt, node, config) {
      // Disable button during sync
      node.disabled = true;
      node.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
      
      try {
        const response = await fetch('/api/sync-users', {
          method: 'POST',
          headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
          }
        });
        
        if (response.ok) {
          dt.reload();
          showNotification('Data synced successfully', 'success');
        } else {
          throw new Error('Sync failed');
        }
      } catch (error) {
        showNotification('Sync failed: ' + error.message, 'error');
      } finally {
        // Re-enable button
        node.disabled = false;
        node.innerHTML = '<i class="fas fa-sync"></i> Sync Data';
      }
    }
  }
]
```

## Button States

```javascript
// Enable/disable buttons programmatically
const button = document.querySelector('.btn-bulk-delete');
button.disabled = selectedRows.length === 0;

// Update button text
button.innerHTML = `Delete (${selectedRows.length})`;

// Add loading state
button.classList.add('loading');
button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
```

## Custom Export Button

```javascript
buttons: [
  {
    text: '<i class="fas fa-file-export"></i> Custom Export',
    className: 'btn btn-info btn-sm',
    action: function(e, dt, node, config) {
      // Get current table data
      const data = dt.data;
      const columns = dt.options.columns;
      
      // Custom export logic
      const exportData = data.map(row => {
        const exportRow = {};
        columns.forEach(col => {
          if (col.data !== 'actions') {
            exportRow[col.title] = row[col.data];
          }
        });
        return exportRow;
      });
      
      // Convert to CSV
      const csv = convertToCSV(exportData);
      downloadCSV(csv, 'custom-export.csv');
    }
  }
]
```

## Keyboard Shortcuts Button

```javascript
buttons: [
  {
    text: '<i class="fas fa-keyboard"></i>',
    className: 'btn btn-outline-secondary btn-sm',
    attr: {
      title: 'Keyboard Shortcuts (Ctrl+H)'
    },
    action: function(e, dt, node, config) {
      dt.showKeyboardShortcuts();
    }
  }
]
```

## Button Styling

```css
/* Custom button styles */
.modern-table .btn-custom {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.modern-table .btn-custom:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

/* Loading state */
.modern-table .btn.loading {
  opacity: 0.7;
  pointer-events: none;
}

/* Button groups */
.modern-table .btn-group .btn {
  margin-right: 0;
}
```

## Complete Example

```javascript
const table = new ModernTable('#userTable', {
  api: '/api/users',
  columns: [...],
  select: true,
  buttons: [
    // Built-in export buttons
    'copy',
    {
      extend: 'csv',
      exportColumns: 'visible',
      filename: 'users-export'
    },
    {
      extend: 'excel',
      exportColumns: [0, 1, 2, 3, 4],
      title: 'User Directory'
    },
    
    // Custom action buttons
    {
      text: '<i class="fas fa-plus"></i> Add User',
      className: 'btn btn-success btn-sm',
      action: () => window.location.href = '/users/create'
    },
    {
      text: 'Bulk Delete (<span class="count">0</span>)',
      className: 'btn btn-danger btn-sm',
      enabled: false,
      attr: { id: 'bulk-delete-btn' },
      action: function(e, dt) {
        const selected = dt.getSelectedRows();
        if (selected.length > 0 && confirm(`Delete ${selected.length} users?`)) {
          bulkDeleteUsers(selected.map(row => row.id));
        }
      }
    },
    {
      text: '<i class="fas fa-sync"></i> Refresh',
      className: 'btn btn-secondary btn-sm',
      action: (e, dt) => dt.reload()
    },
    
    // Column visibility
    'colvis'
  ]
});

// Update bulk delete button on selection change
table.on('selectionChange', function(selectedRows) {
  const btn = document.getElementById('bulk-delete-btn');
  const count = btn.querySelector('.count');
  count.textContent = selectedRows.length;
  btn.disabled = selectedRows.length === 0;
});
```

## Best Practices

1. **Use semantic icons** - FontAwesome or similar icon libraries
2. **Provide tooltips** - Help users understand button functions
3. **Handle loading states** - Show feedback during async operations
4. **Disable when appropriate** - Prevent invalid actions
5. **Group related buttons** - Use button groups for better UX
6. **Consider permissions** - Show only relevant buttons
7. **Mobile-friendly** - Ensure buttons work on touch devices
8. **Accessibility** - Include proper ARIA attributes