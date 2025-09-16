# Responsive Design

Complete guide for responsive features in ModernTable.js.

## Enable Responsive Mode

```javascript
const table = new ModernTable('#myTable', {
  responsive: true,
  columns: [
    { data: 'id', title: 'ID', responsivePriority: 10000 }, // Never hide
    { data: 'name', title: 'Name', responsivePriority: 1 }, // Show first
    { data: 'email', title: 'Email', responsivePriority: 2 },
    { data: 'phone', title: 'Phone', responsivePriority: 5 },
    { data: 'address', title: 'Address', responsivePriority: 8 }, // Hide first
    { data: 'actions', title: 'Actions', responsivePriority: 1000 }
  ]
});
```

## Responsive Priorities

Lower numbers = higher priority (show first):

- **1-100**: Critical columns (always visible)
- **101-1000**: Important columns 
- **1001-5000**: Standard columns
- **5001-9999**: Less important columns (hide first)
- **10000+**: Never hide (system columns)

## Auto Priority Assignment

If no `responsivePriority` is specified, ModernTable automatically assigns priorities:

```javascript
// Auto-assigned priorities:
// - First non-orderable column (ID/No): 10000 (never hide)
// - Center-aligned columns: Higher priority (-1000)
// - Rendered columns: Higher priority (-500)  
// - Action columns: Lower priority (1000)
// - Position-based: Later columns get lower priority (+100 per position)
```

## Breakpoints

Built-in responsive breakpoints:

```javascript
breakpoints: [
  { name: 'desktop', width: Infinity },
  { name: 'tablet-l', width: 1024 },
  { name: 'tablet-p', width: 768 },
  { name: 'mobile-l', width: 480 },
  { name: 'mobile-p', width: 320 }
]
```

## Column Width Calculation

ModernTable automatically calculates minimum column widths:

```javascript
// Width calculation factors:
// - Column title length × 10px + 30px padding
// - Max 180px on desktop, 140px on mobile
// - Center columns: max 120px
// - Non-sortable columns: max 140px
```

## Expand/Collapse Details

When columns are hidden, an expand button appears in the selection column:

```javascript
const table = new ModernTable('#myTable', {
  responsive: true,
  select: true, // Required for expand button
  columns: [...]
});
```

### Detail Row Content

Hidden columns are displayed in a detail row with:

- **Column title**: As label
- **Rendered value**: Using column render function
- **Formatted display**: Clean key-value pairs

## Manual Column Control

```javascript
// Set specific column priorities
columns: [
  {
    data: 'name',
    title: 'Name',
    responsivePriority: 1 // Always show
  },
  {
    data: 'description', 
    title: 'Description',
    responsivePriority: 9999, // Hide first
    className: 'd-none d-lg-table-cell' // CSS fallback
  }
]
```

## CSS-based Responsive (Alternative)

For simple responsive needs, use CSS classes:

```javascript
columns: [
  {
    data: 'phone',
    title: 'Phone',
    className: 'd-none d-md-table-cell' // Hide on mobile
  },
  {
    data: 'address',
    title: 'Address', 
    className: 'd-none d-lg-table-cell' // Hide on tablet and mobile
  }
]
```

## Responsive Events

```javascript
// Listen for responsive changes
table.on('responsive-resize', function(breakpoint, hidden, visible) {
  console.log('Breakpoint:', breakpoint);
  console.log('Hidden columns:', hidden);
  console.log('Visible columns:', visible);
});

// Update after window resize
window.addEventListener('resize', () => {
  table.plugins.responsive.updateAfterDataLoad();
});
```

## Mobile-First Design

ModernTable uses mobile-first responsive design:

### Mobile (≤768px)
- Minimal columns shown
- Expand buttons for details
- Touch-friendly controls
- Simplified pagination

### Tablet (769px-1024px)
- More columns visible
- Balanced layout
- Touch and mouse support

### Desktop (>1024px)
- All important columns visible
- Full feature set
- Optimized for mouse interaction

## Responsive Toolbar

The toolbar automatically adapts to screen size:

```javascript
// Mobile toolbar layout:
// [Length] [Search]
// [Buttons...]

// Desktop toolbar layout:  
// [Length] [Buttons...] [Search]
```

## Performance Optimization

Responsive calculations are optimized for performance:

- **Debounced resize**: 150ms delay
- **Cached calculations**: Column widths cached
- **Minimal DOM updates**: Only changed columns updated
- **Fast breakpoint detection**: Efficient width checking

## Custom Responsive Behavior

```javascript
// Custom column visibility logic
const table = new ModernTable('#myTable', {
  responsive: true,
  columns: [
    {
      data: 'priority_field',
      title: 'Priority',
      responsivePriority: function() {
        // Dynamic priority based on user role
        return userRole === 'admin' ? 1 : 9999;
      }
    }
  ]
});
```

## Responsive with Column Search

Column search inputs automatically adapt:

```javascript
const table = new ModernTable('#myTable', {
  responsive: true,
  columnSearch: true, // Search inputs resize with columns
  columns: [...]
});
```

## Styling Responsive Elements

```css
/* Detail row styling */
.dtr-details {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.dtr-details-list {
  margin: 0;
  padding: 1rem;
}

.dtr-details-list dt {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.dtr-details-list dd {
  margin-bottom: 0.75rem;
  margin-left: 0;
  color: #6c757d;
}

/* Expand button styling */
.expand-btn {
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  width: 20px;
  height: 20px;
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-btn:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

/* Expanded row styling */
.dtr-expanded {
  background-color: #fff3cd;
}
```

## Complete Responsive Example

```javascript
const table = new ModernTable('#userTable', {
  api: '/api/users',
  responsive: true,
  select: true, // Enable for expand buttons
  columnSearch: true,
  
  columns: [
    {
      data: 'DT_RowIndex',
      title: 'No',
      responsivePriority: 10000, // Never hide
      orderable: false,
      searchable: false,
      className: 'text-center',
      width: '60px'
    },
    {
      data: 'name',
      title: 'Name',
      responsivePriority: 1, // Highest priority
      render: (data, type, row) => {
        if (type === 'display') {
          return `<strong>${data}</strong>`;
        }
        return data;
      }
    },
    {
      data: 'email',
      title: 'Email',
      responsivePriority: 2,
      render: (data) => `<a href="mailto:${data}">${data}</a>`
    },
    {
      data: 'phone',
      title: 'Phone',
      responsivePriority: 4,
      className: 'd-none d-md-table-cell' // CSS fallback
    },
    {
      data: 'department',
      title: 'Department',
      responsivePriority: 5
    },
    {
      data: 'status',
      title: 'Status',
      responsivePriority: 3,
      render: (data) => {
        const badgeClass = data === 'active' ? 'success' : 'secondary';
        return `<span class="badge bg-${badgeClass}">${data}</span>`;
      }
    },
    {
      data: 'created_at',
      title: 'Created',
      responsivePriority: 6,
      render: (data) => new Date(data).toLocaleDateString()
    },
    {
      data: 'last_login',
      title: 'Last Login',
      responsivePriority: 8, // Hide first
      render: (data) => data ? new Date(data).toLocaleDateString() : 'Never'
    },
    {
      data: 'actions',
      title: 'Actions',
      responsivePriority: 1000, // Show in details when needed
      orderable: false,
      searchable: false,
      className: 'text-center',
      render: function(data, type, row) {
        return `
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="viewUser(${row.id})">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning" onclick="editUser(${row.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${row.id})">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
      }
    }
  ],
  
  serverSide: true,
  pageLength: 10,
  buttons: ['copy', 'csv', 'excel'],
  stateSave: true
});

// Handle responsive events
table.on('responsive-resize', function(breakpoint, hidden, visible) {
  console.log(`Responsive breakpoint: ${breakpoint}`);
  console.log(`Hidden columns: ${hidden.length}`);
  console.log(`Visible columns: ${visible.length}`);
});
```

## Best Practices

1. **Set priorities thoughtfully** - Consider user needs on mobile
2. **Use selection column** - Required for expand/collapse functionality  
3. **Test on real devices** - Emulators don't always match real behavior
4. **Consider content length** - Long text may need truncation
5. **Optimize images** - Use appropriate sizes for mobile
6. **Touch-friendly buttons** - Ensure adequate touch targets
7. **Performance monitoring** - Watch for resize performance issues
8. **Graceful degradation** - Provide CSS fallbacks when needed