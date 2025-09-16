# ⌨️ Keyboard Navigation

Complete guide for keyboard navigation and shortcuts in ModernTable.js.

## Enable Keyboard Navigation

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true, // Enable keyboard navigation
  accessibility: true, // Enable accessibility features
  select: true, // Required for selection shortcuts
  columns: [...]
});
```

## Available Shortcuts

### 📍 Navigation
- **↑↓ Arrow Keys** - Navigate rows up/down
- **Home** - Jump to first row
- **End** - Jump to last row  
- **Page Up** - Navigate to previous page
- **Page Down** - Navigate to next page

### ✅ Selection
- **Enter/Space** - Toggle row selection
- **Ctrl+A** - Select all rows
- **Escape** - Clear all selections
- **Shift+Arrow** - Extend selection (multi-select)

### 🔧 Actions
- **Ctrl+C** - Copy selected rows
- **Ctrl+D** - Delete selected rows (bulk delete)
- **Ctrl+F** - Focus search input
- **Ctrl+R** - Reload table data
- **Ctrl+H** - Show keyboard shortcuts help

## Usage Examples

### Basic Navigation

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true,
  columns: [
    { data: 'name', title: 'Name' },
    { data: 'email', title: 'Email' },
    { data: 'status', title: 'Status' }
  ]
});

// Users can now navigate with arrow keys
// Click table area first to enable keyboard focus
```

### With Selection

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true,
  select: true, // Enable selection for keyboard shortcuts
  columns: [...],
  
  onSelectionChange: function(selectedRows) {
    console.log('Selected via keyboard:', selectedRows.length);
  }
});
```

### Custom Keyboard Shortcuts

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true,
  columns: [...]
});

// Add custom keyboard handler
table.wrapper.addEventListener('keydown', function(event) {
  const { key, ctrlKey } = event;
  
  // Custom shortcut: Ctrl+E for export
  if (ctrlKey && key === 'e') {
    event.preventDefault();
    table.plugins.export.exportCSV();
  }
  
  // Custom shortcut: Ctrl+N for new record
  if (ctrlKey && key === 'n') {
    event.preventDefault();
    openNewRecordModal();
  }
});
```

## Keyboard Shortcuts Help

ModernTable.js includes a built-in shortcuts help popup:

```javascript
// Show shortcuts popup programmatically
table.showKeyboardShortcuts();

// Or add shortcuts button to toolbar
const table = new ModernTable('#myTable', {
  keyboard: true,
  buttons: [
    'shortcuts', // Built-in shortcuts button
    'copy', 'csv', 'excel'
  ]
});
```

### Custom Shortcuts Help

```javascript
function showCustomKeyboardShortcuts() {
  const shortcuts = `⌨️ KEYBOARD SHORTCUTS

📍 Navigation:
• ↑↓ Arrow Keys - Navigate rows
• Home/End - First/last row  
• Page Up/Down - Navigate pages

✅ Selection:
• Enter/Space - Select row
• Ctrl+A - Select all
• Escape - Clear selection

🔧 Actions:
• Ctrl+C - Copy selected
• Ctrl+D - Delete selected
• Ctrl+F - Focus search
• Ctrl+R - Reload table
• Ctrl+H - Show shortcuts

💡 Tips:
• Click table area first to enable navigation
• Use Shift+Arrow for multi-select`;

  alert(shortcuts); // Or show in modal
}
```

## Focus Management

### Auto Focus

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true,
  
  // Auto-focus table after initialization
  initComplete: function() {
    setTimeout(() => {
      this.wrapper.focus();
    }, 100);
  }
});
```

### Focus Indicators

```css
/* Custom focus styling */
.modern-table tbody tr.keyboard-focused {
  outline: 2px solid #0d6efd;
  outline-offset: -2px;
  background-color: #e3f2fd;
}

/* Focus ring for table wrapper */
.modern-table-wrapper:focus {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}
```

## Advanced Navigation

### Page Navigation

```javascript
// Navigate between pages with keyboard
const table = new ModernTable('#myTable', {
  keyboard: true,
  paging: true,
  pageLength: 10,
  
  // Custom page navigation
  drawCallback: function() {
    // Update page navigation state
    this.hasNextPage = this.currentPage < this.totalPages;
    this.hasPrevPage = this.currentPage > 1;
  }
});
```

### Row Selection with Shift

```javascript
// Multi-row selection with Shift+Arrow
const table = new ModernTable('#myTable', {
  keyboard: true,
  select: true,
  selectMultiple: true, // Enable multi-selection
  
  onSelectionChange: function(selectedRows) {
    // Update UI based on selection
    updateBulkActionButtons(selectedRows.length);
  }
});
```

## Integration with Actions

### Bulk Actions

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true,
  select: true,
  buttons: [
    {
      text: 'Delete Selected (Ctrl+D)',
      className: 'btn btn-danger btn-sm',
      enabled: false,
      attr: { id: 'delete-selected-btn' },
      action: function(e, dt) {
        const selected = dt.getSelectedRows();
        if (selected.length > 0) {
          bulkDeleteRows(selected);
        }
      }
    }
  ],
  
  onSelectionChange: function(selectedRows) {
    // Enable/disable bulk action button
    const deleteBtn = document.getElementById('delete-selected-btn');
    deleteBtn.disabled = selectedRows.length === 0;
  }
});
```

### Search Integration

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true,
  searching: true,
  
  // Custom search behavior
  drawCallback: function() {
    // Return focus to table after search
    const searchInput = this.wrapper.querySelector('.modern-table-search input');
    
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        // Clear search and return focus to table
        searchInput.value = '';
        this.search('');
        this.wrapper.focus();
      }
    });
  }
});
```

## Accessibility Features

### Screen Reader Support

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true,
  accessibility: true, // Enable ARIA attributes
  
  // Add screen reader announcements
  onSelectionChange: function(selectedRows) {
    // Announce selection changes
    const announcement = `${selectedRows.length} rows selected`;
    announceToScreenReader(announcement);
  }
});

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}
```

### ARIA Labels

```javascript
const table = new ModernTable('#myTable', {
  keyboard: true,
  accessibility: true,
  
  // Custom ARIA labels
  createdRow: function(row, data, index) {
    row.setAttribute('aria-label', `Row ${index + 1}: ${data.name}`);
    row.setAttribute('role', 'row');
  },
  
  headerCallback: function(thead) {
    // Add ARIA labels to headers
    const headers = thead.querySelectorAll('th');
    headers.forEach((th, index) => {
      th.setAttribute('role', 'columnheader');
      if (th.classList.contains('sortable')) {
        th.setAttribute('aria-sort', 'none');
      }
    });
  }
});
```

## Performance Optimization

### Debounced Navigation

```javascript
// For large datasets, debounce rapid key presses
let navigationTimeout;

function debouncedNavigation(callback, delay = 50) {
  clearTimeout(navigationTimeout);
  navigationTimeout = setTimeout(callback, delay);
}

// Custom keyboard handler with debouncing
table.wrapper.addEventListener('keydown', function(event) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    debouncedNavigation(() => {
      // Handle navigation
    });
  }
});
```

## Complete Example

```javascript
const table = new ModernTable('#userTable', {
  // Enable keyboard features
  keyboard: true,
  accessibility: true,
  select: true,
  selectMultiple: true,
  
  // Data and columns
  api: '/api/users',
  columns: [
    { data: 'DT_RowIndex', title: 'No', orderable: false, searchable: false },
    { data: 'name', title: 'Name' },
    { data: 'email', title: 'Email' },
    { data: 'status', title: 'Status' },
    { data: 'actions', title: 'Actions', orderable: false, searchable: false }
  ],
  
  // Buttons with keyboard shortcuts
  buttons: [
    {
      text: '<i class="fas fa-plus"></i> Add (Ctrl+N)',
      className: 'btn btn-success btn-sm',
      action: () => openNewUserModal()
    },
    {
      text: 'Delete Selected (Ctrl+D)',
      className: 'btn btn-danger btn-sm',
      enabled: false,
      attr: { id: 'bulk-delete-btn' },
      action: function(e, dt) {
        const selected = dt.getSelectedRows();
        bulkDeleteUsers(selected);
      }
    },
    'shortcuts', // Built-in shortcuts help
    'copy', 'csv', 'excel'
  ],
  
  // Event handlers
  onSelectionChange: function(selectedRows) {
    // Update bulk action buttons
    const bulkBtn = document.getElementById('bulk-delete-btn');
    bulkBtn.disabled = selectedRows.length === 0;
    
    // Announce to screen readers
    const message = selectedRows.length > 0 
      ? `${selectedRows.length} users selected`
      : 'Selection cleared';
    announceToScreenReader(message);
  },
  
  onRowClick: function(rowData, index, event) {
    // Handle row clicks (don't interfere with keyboard navigation)
    if (!event.target.closest('.btn, .form-check-input')) {
      console.log('Row clicked:', rowData.name);
    }
  },
  
  // Auto-focus after initialization
  initComplete: function() {
    setTimeout(() => {
      this.wrapper.focus();
      announceToScreenReader('Table loaded. Use arrow keys to navigate.');
    }, 100);
  }
});

// Custom keyboard shortcuts
table.wrapper.addEventListener('keydown', function(event) {
  const { key, ctrlKey } = event;
  
  // Ctrl+N: New user
  if (ctrlKey && key === 'n') {
    event.preventDefault();
    openNewUserModal();
  }
  
  // Ctrl+E: Export
  if (ctrlKey && key === 'e') {
    event.preventDefault();
    table.plugins.export.exportCSV();
  }
});

// Helper functions
function openNewUserModal() {
  // Open new user modal
  console.log('Opening new user modal...');
}

function bulkDeleteUsers(selectedUsers) {
  if (confirm(`Delete ${selectedUsers.length} selected users?`)) {
    // Perform bulk delete
    console.log('Bulk deleting users:', selectedUsers);
  }
}

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}
```

## Best Practices

1. **Click to Focus** - Users must click table area first to enable keyboard navigation
2. **Visual Feedback** - Provide clear focus indicators
3. **Screen Reader Support** - Use ARIA labels and live regions
4. **Consistent Shortcuts** - Follow standard keyboard conventions
5. **Help Documentation** - Include shortcuts help button
6. **Performance** - Debounce rapid key presses for large datasets
7. **Accessibility** - Test with screen readers and keyboard-only navigation
8. **Custom Shortcuts** - Add application-specific shortcuts as needed

## Browser Support

Keyboard navigation works in all modern browsers:
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Screen readers (NVDA, JAWS, VoiceOver)