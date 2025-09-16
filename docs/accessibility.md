# ♿ Accessibility Features

Complete guide for accessibility features in ModernTable.js.

## Enable Accessibility

```javascript
const table = new ModernTable('#myTable', {
  accessibility: true, // Enable ARIA labels and screen reader support
  keyboard: true, // Enable keyboard navigation
  columns: [...]
});
```

## ARIA Support

### Table Structure
ModernTable.js automatically adds proper ARIA attributes:

```html
<!-- Generated table structure -->
<table role="table" aria-label="Data table with sorting, filtering, and pagination">
  <thead>
    <tr role="row">
      <th role="columnheader" scope="col" aria-colindex="1" aria-sort="none">Name</th>
      <th role="columnheader" scope="col" aria-colindex="2">Email</th>
    </tr>
  </thead>
  <tbody>
    <tr role="row" aria-rowindex="2" aria-selected="false">
      <td role="gridcell" aria-colindex="1">John Doe</td>
      <td role="gridcell" aria-colindex="2">john@example.com</td>
    </tr>
  </tbody>
</table>
```

### Screen Reader Announcements

```javascript
const table = new ModernTable('#myTable', {
  accessibility: true,
  
  // Automatic announcements for data changes
  onDataLoaded: function(data, meta) {
    // Announces: "Table updated. Showing 10 of 100 entries."
  },
  
  // Selection change announcements
  onSelectionChange: function(selectedRows) {
    // Announces: "3 rows selected" or "No rows selected"
  }
});
```

## Keyboard Navigation

### Navigation Shortcuts
- **Arrow Keys** - Navigate between rows
- **Tab/Shift+Tab** - Navigate between interactive elements
- **Enter/Space** - Activate buttons and checkboxes
- **Home/End** - Jump to first/last row
- **Page Up/Down** - Navigate pages

### Focus Management

```javascript
const table = new ModernTable('#myTable', {
  accessibility: true,
  keyboard: true,
  
  // Custom focus indicators
  drawCallback: function() {
    // Add focus indicators to interactive elements
    const buttons = this.wrapper.querySelectorAll('button');
    buttons.forEach(button => {
      button.setAttribute('tabindex', '0');
    });
  }
});
```

## Screen Reader Support

### Live Regions
ModernTable.js creates live regions for dynamic announcements:

```html
<!-- Automatically created -->
<div id="table-live-region" class="sr-only" aria-live="polite" aria-atomic="true">
  Table updated. Showing 10 of 100 entries.
</div>
```

### Descriptive Labels

```javascript
const table = new ModernTable('#myTable', {
  accessibility: true,
  columns: [
    {
      data: 'name',
      title: 'Full Name',
      headerAttributes: {
        'aria-label': 'Full name column, sortable'
      }
    },
    {
      data: 'actions',
      title: 'Actions',
      render: function(data, type, row) {
        return `
          <button class="btn btn-sm btn-primary" 
                  aria-label="Edit user ${row.name}">
            <i class="fas fa-edit" aria-hidden="true"></i>
            <span class="sr-only">Edit</span>
          </button>
        `;
      }
    }
  ]
});
```

## High Contrast Support

### CSS Media Queries
```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  .modern-table {
    border: 2px solid;
    --mt-border-color: #000000;
    --mt-focus-color: #000000;
  }
  
  .modern-table th,
  .modern-table td {
    border: 1px solid;
  }
  
  .modern-table .keyboard-focused {
    outline: 3px solid #000000;
    outline-offset: 2px;
  }
}
```

### Theme Detection
```javascript
const table = new ModernTable('#myTable', {
  accessibility: true,
  
  // Detect high contrast preference
  initComplete: function() {
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.wrapper.classList.add('high-contrast');
    }
  }
});
```

## Reduced Motion Support

### Animation Control
```css
/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .modern-table-wrapper *,
  .modern-table-wrapper *::before,
  .modern-table-wrapper *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Screen Reader Only Content

### Hidden Labels
```css
/* Screen reader only class */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}
```

### Usage in Columns
```javascript
columns: [
  {
    data: 'status',
    title: 'Status',
    render: function(data, type, row) {
      return `
        <span class="badge bg-${data === 'active' ? 'success' : 'danger'}">
          ${data}
        </span>
        <span class="sr-only">
          User status is ${data}
        </span>
      `;
    }
  }
]
```

## Form Controls Accessibility

### Search Input
```javascript
// Automatically applied when accessibility: true
const searchInput = table.wrapper.querySelector('.modern-table-search input');
searchInput.setAttribute('aria-label', 'Search table data');
searchInput.setAttribute('aria-describedby', 'search-description');

// Description element is automatically created
<span id="search-description" class="sr-only">
  Search across all columns. Results update as you type.
</span>
```

### Pagination Controls
```javascript
// Automatically applied labels
<nav role="navigation" aria-label="Table pagination">
  <ul class="pagination">
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Go to previous page">Previous</a>
    </li>
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Go to page 1">1</a>
    </li>
  </ul>
</nav>
```

## Custom Accessibility Enhancements

### Announce Custom Actions
```javascript
function announceToScreenReader(message) {
  const liveRegion = document.getElementById('table-live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}

// Usage in custom actions
function deleteUser(userId) {
  // Perform delete
  deleteUserAPI(userId).then(() => {
    announceToScreenReader('User deleted successfully');
    table.reload();
  });
}
```

### Skip Links
```html
<!-- Add skip link for keyboard users -->
<a href="#main-table" class="sr-only sr-only-focusable">
  Skip to main table
</a>

<div id="main-table">
  <table id="myTable">...</table>
</div>
```

### Landmark Roles
```javascript
const table = new ModernTable('#myTable', {
  accessibility: true,
  
  initComplete: function() {
    // Add landmark roles
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'User data table');
    
    // Add main landmark if not present
    if (!document.querySelector('[role="main"]')) {
      this.wrapper.setAttribute('role', 'main');
    }
  }
});
```

## Testing Accessibility

### Screen Reader Testing
```javascript
// Test with popular screen readers:
// - NVDA (Windows)
// - JAWS (Windows)
// - VoiceOver (macOS)
// - TalkBack (Android)
// - VoiceOver (iOS)

// Test checklist:
// ✅ Table structure is announced correctly
// ✅ Column headers are read with data
// ✅ Sort status is announced
// ✅ Selection changes are announced
// ✅ Buttons have descriptive labels
// ✅ Form controls are properly labeled
// ✅ Live regions announce updates
```

### Keyboard Testing
```javascript
// Keyboard navigation checklist:
// ✅ All interactive elements are focusable
// ✅ Focus indicators are visible
// ✅ Tab order is logical
// ✅ Keyboard shortcuts work
// ✅ No keyboard traps
// ✅ Skip links function properly
```

## Complete Accessible Example

```javascript
const table = new ModernTable('#userTable', {
  // Enable accessibility features
  accessibility: true,
  keyboard: true,
  
  // Data and columns
  api: '/api/users',
  columns: [
    {
      data: 'DT_RowIndex',
      title: 'Row Number',
      orderable: false,
      searchable: false,
      headerAttributes: {
        'aria-label': 'Row number, not sortable'
      }
    },
    {
      data: 'name',
      title: 'Full Name',
      headerAttributes: {
        'aria-label': 'Full name column, sortable'
      }
    },
    {
      data: 'email',
      title: 'Email Address',
      headerAttributes: {
        'aria-label': 'Email address column, sortable'
      }
    },
    {
      data: 'status',
      title: 'Account Status',
      render: function(data, type, row) {
        const badgeClass = data === 'active' ? 'success' : 'danger';
        return `
          <span class="badge bg-${badgeClass}" role="status">
            ${data}
          </span>
          <span class="sr-only">
            Account status is ${data}
          </span>
        `;
      }
    },
    {
      data: 'actions',
      title: 'Available Actions',
      orderable: false,
      searchable: false,
      headerAttributes: {
        'aria-label': 'Available actions for each user'
      },
      render: function(data, type, row) {
        return `
          <div role="group" aria-label="Actions for ${row.name}">
            <button class="btn btn-sm btn-primary me-1" 
                    onclick="editUser(${row.id})"
                    aria-label="Edit user ${row.name}">
              <i class="fas fa-edit" aria-hidden="true"></i>
              <span class="sr-only">Edit</span>
            </button>
            <button class="btn btn-sm btn-danger" 
                    onclick="deleteUser(${row.id})"
                    aria-label="Delete user ${row.name}">
              <i class="fas fa-trash" aria-hidden="true"></i>
              <span class="sr-only">Delete</span>
            </button>
          </div>
        `;
      }
    }
  ],
  
  // Accessible buttons
  buttons: [
    {
      text: '<i class="fas fa-plus" aria-hidden="true"></i> <span>Add User</span>',
      className: 'btn btn-success btn-sm',
      attr: {
        'aria-label': 'Add new user to the table'
      },
      action: () => openAddUserModal()
    }
  ],
  
  // Event handlers with announcements
  onDataLoaded: function(data, meta) {
    const total = meta?.total || data?.length || 0;
    const showing = data?.length || 0;
    announceToScreenReader(`Table updated. Showing ${showing} of ${total} users.`);
  },
  
  onSelectionChange: function(selectedRows) {
    const count = selectedRows.length;
    const message = count === 0 
      ? 'No users selected' 
      : `${count} user${count === 1 ? '' : 's'} selected`;
    announceToScreenReader(message);
  },
  
  // Initialization
  initComplete: function() {
    // Add table description
    const description = document.createElement('div');
    description.id = 'table-description';
    description.className = 'sr-only';
    description.textContent = 'User management table. Use arrow keys to navigate, Enter to select, and Tab to move between controls.';
    this.wrapper.insertBefore(description, this.element);
    
    // Set table attributes
    this.element.setAttribute('aria-describedby', 'table-description');
    this.wrapper.setAttribute('role', 'region');
    this.wrapper.setAttribute('aria-label', 'User management');
  }
});

// Helper function for announcements
function announceToScreenReader(message) {
  const liveRegion = document.getElementById('table-live-region');
  if (liveRegion) {
    liveRegion.textContent = message;
  }
}
```

## Best Practices

1. **Always enable accessibility** - Set `accessibility: true`
2. **Provide descriptive labels** - Use aria-label for all interactive elements
3. **Test with screen readers** - Use actual assistive technology
4. **Keyboard navigation** - Ensure all features work without mouse
5. **High contrast support** - Test in high contrast mode
6. **Reduced motion** - Respect user preferences
7. **Live regions** - Announce dynamic changes
8. **Focus management** - Provide clear focus indicators
9. **Semantic HTML** - Use proper roles and landmarks
10. **Regular testing** - Include accessibility in your testing process

## WCAG Compliance

ModernTable.js with accessibility enabled meets:
- ✅ **WCAG 2.1 Level AA** - Web Content Accessibility Guidelines
- ✅ **Section 508** - US Federal accessibility requirements
- ✅ **ADA Compliance** - Americans with Disabilities Act
- ✅ **EN 301 549** - European accessibility standard