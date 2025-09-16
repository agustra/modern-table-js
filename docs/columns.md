# Column Configuration

Complete guide for configuring columns in ModernTable.js.

## Basic Column Configuration

```javascript
const table = new ModernTable('#myTable', {
  columns: [
    {
      data: 'id',           // Data property name
      title: 'ID',          // Column header text
      orderable: true,      // Enable sorting (default: true)
      searchable: false,    // Include in search (default: true)
      className: 'text-center', // CSS class for cells
      width: '60px'         // Column width
    },
    {
      data: 'name',
      title: 'Full Name',
      render: function(data, type, row, meta) {
        // Custom cell rendering
        if (type === 'display') {
          return `<strong>${data}</strong>`;
        }
        return data;
      }
    }
  ]
});
```

## Column Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `data` | string | required | Data property name |
| `title` | string | `data` value | Column header text |
| `orderable` | boolean | `true` | Enable sorting |
| `searchable` | boolean | `true` | Include in global search |
| `className` | string | `''` | CSS class for cells |
| `headerClassName` | string | `''` | CSS class for header |
| `style` | string | `''` | Inline CSS for cells |
| `headerStyle` | string | `''` | Inline CSS for header |
| `width` | string | `auto` | Column width |
| `render` | function | `null` | Custom rendering function |

## Render Functions

### Simple Render Function

```javascript
{
  data: 'email',
  title: 'Email',
  render: (data) => `<a href="mailto:${data}">${data}</a>`
}
```

### Advanced Render Function

```javascript
{
  data: 'status',
  title: 'Status',
  render: function(data, type, row, meta) {
    // Different rendering based on type
    if (type === 'display') {
      const badgeClass = data === 'active' ? 'success' : 'secondary';
      return `<span class="badge bg-${badgeClass}">${data}</span>`;
    }
    
    // For sorting and searching, return raw data
    return data;
  }
}
```

### Render Types

- `display` - For HTML display in table
- `type` - For type detection
- `sort` - For sorting operations
- `search` - For search operations

## Built-in Renderers

```javascript
{
  data: 'price',
  title: 'Price',
  render: 'currency' // Built-in currency formatter
},
{
  data: 'created_at',
  title: 'Created',
  render: 'date' // Built-in date formatter
},
{
  data: 'is_active',
  title: 'Active',
  render: 'boolean' // Built-in boolean formatter
}
```

## Action Columns

```javascript
{
  data: 'actions',
  title: 'Actions',
  orderable: false,
  searchable: false,
  className: 'text-center',
  render: function(data, type, row) {
    return `
      <button class="btn btn-sm btn-primary me-1" onclick="editUser(${row.id})">
        <i class="fas fa-edit"></i> Edit
      </button>
      <button class="btn btn-sm btn-danger" onclick="deleteUser(${row.id})">
        <i class="fas fa-trash"></i> Delete
      </button>
    `;
  }
}
```

## Row Index Column

```javascript
{
  data: 'DT_RowIndex',
  title: 'No',
  orderable: false,
  searchable: false,
  className: 'text-center',
  width: '60px'
}
```

## Conditional Rendering

```javascript
{
  data: 'role',
  title: 'Role',
  render: function(data, type, row) {
    // Conditional rendering based on user permissions
    if (userPermissions.includes('view_roles')) {
      return `<span class="badge bg-info">${data}</span>`;
    }
    return '<span class="text-muted">Hidden</span>';
  }
}
```

## Image Columns

```javascript
{
  data: 'avatar',
  title: 'Avatar',
  orderable: false,
  searchable: false,
  render: function(data, type, row) {
    const src = data || '/default-avatar.png';
    return `<img src="${src}" alt="Avatar" class="rounded-circle" width="40" height="40">`;
  }
}
```

## Progress Bar Column

```javascript
{
  data: 'progress',
  title: 'Progress',
  render: function(data, type, row) {
    if (type === 'display') {
      return `
        <div class="progress" style="height: 20px;">
          <div class="progress-bar" role="progressbar" 
               style="width: ${data}%" 
               aria-valuenow="${data}" 
               aria-valuemin="0" 
               aria-valuemax="100">
            ${data}%
          </div>
        </div>
      `;
    }
    return data;
  }
}
```

## Multi-value Columns

```javascript
{
  data: 'tags',
  title: 'Tags',
  render: function(data, type, row) {
    if (type === 'display' && Array.isArray(data)) {
      return data.map(tag => 
        `<span class="badge bg-secondary me-1">${tag}</span>`
      ).join('');
    }
    return Array.isArray(data) ? data.join(', ') : data;
  }
}
```

## Nested Data

```javascript
{
  data: 'user.profile.name',
  title: 'Profile Name',
  render: function(data, type, row) {
    // Access nested data safely
    return row.user?.profile?.name || 'N/A';
  }
}
```

## Column Visibility

```javascript
// Hide column initially
{
  data: 'internal_notes',
  title: 'Internal Notes',
  visible: false // Will be hidden by default
}

// Control visibility programmatically
table.setColumnVisibility(columnIndex, false); // Hide
table.setColumnVisibility(columnIndex, true);  // Show
```

## Responsive Columns

```javascript
{
  data: 'description',
  title: 'Description',
  className: 'd-none d-md-table-cell', // Hide on mobile
  render: function(data, type, row) {
    if (type === 'display') {
      // Truncate long text
      return data.length > 50 ? 
        data.substring(0, 50) + '...' : 
        data;
    }
    return data;
  }
}
```

## Column Groups

```javascript
// Using colspan in header
const table = new ModernTable('#myTable', {
  columns: [
    { data: 'name', title: 'Name' },
    { data: 'email', title: 'Contact Info', headerClassName: 'group-header' },
    { data: 'phone', title: '', headerClassName: 'group-header' },
    { data: 'address', title: 'Address' }
  ]
});
```

## Custom Header Content

```javascript
{
  data: 'priority',
  title: '<i class="fas fa-star"></i> Priority',
  render: function(data, type, row) {
    const stars = '★'.repeat(data) + '☆'.repeat(5 - data);
    return `<span title="${data}/5 stars">${stars}</span>`;
  }
}
```

## Column Search

```javascript
// Enable individual column search
const table = new ModernTable('#myTable', {
  columnSearch: true,
  columns: [
    {
      data: 'name',
      title: 'Name'
      // Searchable by default
    },
    {
      data: 'actions',
      title: 'Actions',
      searchable: false // Exclude from column search
    }
  ]
});
```

## Best Practices

1. **Keep render functions simple** - Avoid complex DOM manipulation
2. **Use type parameter** - Different rendering for display vs sort/search
3. **Handle null/undefined data** - Always provide fallbacks
4. **Optimize for performance** - Cache expensive operations
5. **Accessibility** - Include proper ARIA attributes
6. **Mobile-first** - Consider responsive design
7. **Security** - Sanitize user input in render functions

## Examples

### Complete User Table

```javascript
const userColumns = [
  {
    data: 'DT_RowIndex',
    title: 'No',
    orderable: false,
    searchable: false,
    className: 'text-center',
    width: '60px'
  },
  {
    data: 'avatar',
    title: 'Avatar',
    orderable: false,
    searchable: false,
    width: '80px',
    render: (data) => `<img src="${data || '/default-avatar.png'}" class="rounded-circle" width="40" height="40">`
  },
  {
    data: 'name',
    title: 'Full Name',
    render: (data, type, row) => {
      if (type === 'display') {
        return `<strong>${data}</strong><br><small class="text-muted">${row.email}</small>`;
      }
      return data;
    }
  },
  {
    data: 'role',
    title: 'Role',
    render: (data) => `<span class="badge bg-primary">${data}</span>`
  },
  {
    data: 'status',
    title: 'Status',
    render: function(data) {
      const config = {
        active: { class: 'success', icon: 'check-circle' },
        inactive: { class: 'secondary', icon: 'times-circle' },
        pending: { class: 'warning', icon: 'clock' }
      };
      const status = config[data] || config.inactive;
      return `<span class="badge bg-${status.class}"><i class="fas fa-${status.icon}"></i> ${data}</span>`;
    }
  },
  {
    data: 'created_at',
    title: 'Created',
    render: (data) => new Date(data).toLocaleDateString()
  },
  {
    data: 'actions',
    title: 'Actions',
    orderable: false,
    searchable: false,
    className: 'text-center',
    render: function(data, type, row) {
      return `
        <div class="btn-group" role="group">
          <button class="btn btn-sm btn-outline-primary" onclick="viewUser(${row.id})" title="View">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-outline-warning" onclick="editUser(${row.id})" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${row.id})" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    }
  }
];
```