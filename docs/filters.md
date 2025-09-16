# Advanced Filters

Complete guide for advanced filtering system in ModernTable.js.

## Filter Panel Configuration

```javascript
const table = new ModernTable('#myTable', {
  filters: [
    {
      column: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: '', text: 'All Status' },
        { value: 'active', text: 'Active' },
        { value: 'inactive', text: 'Inactive' }
      ]
    },
    {
      column: 'name',
      type: 'text',
      label: 'Name',
      placeholder: 'Search by name...'
    },
    {
      column: 'created_at',
      type: 'date',
      label: 'Created Date',
      placeholder: 'Select date'
    },
    {
      type: 'clear',
      label: 'Clear All',
      className: 'btn btn-outline-secondary btn-sm'
    }
  ]
});
```

## Filter Types

### Select Filter

```javascript
{
  column: 'category',
  type: 'select',
  label: 'Category',
  options: [
    { value: '', text: 'All Categories' },
    { value: 'electronics', text: 'Electronics' },
    { value: 'clothing', text: 'Clothing' },
    { value: 'books', text: 'Books' }
  ]
}
```

### Text Filter

```javascript
{
  column: 'description',
  type: 'text',
  label: 'Description',
  placeholder: 'Search description...'
}
```

### Date Filter

```javascript
{
  column: 'created_at',
  type: 'date',
  label: 'Created Date',
  placeholder: 'Select date'
}
```

### Date Range Filter

```javascript
{
  column: 'created_at',
  type: 'daterange',
  label: 'Date Range'
}
```

### Number Range Filter

```javascript
{
  column: 'price',
  type: 'numberrange',
  label: 'Price Range',
  min: 0,
  max: 10000
}
```

### Clear Button

```javascript
{
  type: 'clear',
  label: 'Clear Filters',
  className: 'btn btn-outline-danger btn-sm',
  icon: 'fas fa-eraser'
}
```

## Smart Date Range Logic

ModernTable.js includes smart date range handling:

```javascript
filters: [
  {
    column: 'start_date',
    type: 'date',
    label: 'From Date',
    placeholder: 'Start date'
  },
  {
    column: 'end_date',
    type: 'date',
    label: 'To Date',
    placeholder: 'End date'
  }
]
```

- **start_date**: Stores value but doesn't trigger filter until end_date has value
- **end_date**: Triggers filter immediately (with or without start_date)

## Server-side Integration

Filters are automatically sent to server as additional parameters:

```javascript
// Request parameters include filters
{
  draw: 1,
  start: 0,
  length: 10,
  search: { value: "", regex: false },
  columns: [...],
  order: [...],
  filters: {
    status: "active",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    price_min: "100",
    price_max: "500"
  }
}
```

### Laravel Backend Example

```php
public function users(Request $request)
{
    $query = User::query();
    
    // Apply filters
    if ($request->has('filters')) {
        $filters = $request->input('filters');
        
        // Status filter
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        
        // Date range filter
        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }
        
        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }
        
        // Number range filter
        if (!empty($filters['price_min'])) {
            $query->where('price', '>=', $filters['price_min']);
        }
        
        if (!empty($filters['price_max'])) {
            $query->where('price', '<=', $filters['price_max']);
        }
        
        // Text filter
        if (!empty($filters['description'])) {
            $query->where('description', 'like', '%' . $filters['description'] . '%');
        }
    }
    
    // Continue with pagination, sorting, etc.
    // ...
}
```

## Programmatic Filter Control

```javascript
// Get current filters
const currentFilters = table.components.filterPanel.getFilters();

// Set filters programmatically
table.components.filterPanel.setFilters({
  status: 'active',
  start_date: '2024-01-01'
});

// Clear all filters
table.components.filterPanel.clearFilters();

// Apply specific filter
table.components.filterPanel.applyFilter('status', 'active');
```

## Custom Filter Actions

```javascript
{
  type: 'clear',
  label: 'Reset to Defaults',
  className: 'btn btn-warning btn-sm',
  action: function() {
    // Custom clear action
    table.components.filterPanel.setFilters({
      status: 'active', // Set default instead of clearing
      category: 'all'
    });
  }
}
```

## Dynamic Filter Options

```javascript
// Update select options dynamically
function updateCategoryOptions(categories) {
  const filterSelect = document.querySelector('[data-filter="category"]');
  if (filterSelect) {
    filterSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'All Categories';
    filterSelect.appendChild(defaultOption);
    
    // Add dynamic options
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      filterSelect.appendChild(option);
    });
  }
}

// Usage
fetch('/api/categories')
  .then(response => response.json())
  .then(categories => updateCategoryOptions(categories));
```

## Filter State Management

Filters are automatically saved and restored with state management:

```javascript
const table = new ModernTable('#myTable', {
  stateSave: true, // Enable state saving
  filters: [...],
  // ... other options
});

// Filters will be automatically restored on page reload
```

## Styling Filters

```css
/* Custom filter panel styling */
.modern-table-filters {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Filter input styling */
.modern-table-filters .form-control,
.modern-table-filters .form-select {
  border-radius: 6px;
  border: 1px solid #ced4da;
  transition: all 0.2s ease;
}

.modern-table-filters .form-control:focus,
.modern-table-filters .form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

/* Filter labels */
.modern-table-filters .form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
}

/* Clear button styling */
.modern-table-filters .btn {
  border-radius: 6px;
  font-weight: 500;
}
```

## Complete Example

```javascript
const table = new ModernTable('#productTable', {
  api: '/api/products',
  columns: [
    { data: 'name', title: 'Product Name' },
    { data: 'category', title: 'Category' },
    { data: 'price', title: 'Price' },
    { data: 'status', title: 'Status' },
    { data: 'created_at', title: 'Created' }
  ],
  
  filters: [
    // Category select
    {
      column: 'category',
      type: 'select',
      label: 'Category',
      options: [
        { value: '', text: 'All Categories' },
        { value: 'electronics', text: 'Electronics' },
        { value: 'clothing', text: 'Clothing' },
        { value: 'books', text: 'Books' }
      ]
    },
    
    // Status select
    {
      column: 'status',
      type: 'select',
      label: 'Status',
      options: [
        { value: '', text: 'All Status' },
        { value: 'active', text: 'Active' },
        { value: 'inactive', text: 'Inactive' },
        { value: 'discontinued', text: 'Discontinued' }
      ]
    },
    
    // Price range
    {
      column: 'price',
      type: 'numberrange',
      label: 'Price Range',
      min: 0,
      max: 10000
    },
    
    // Date range
    {
      column: 'start_date',
      type: 'date',
      label: 'From Date',
      placeholder: 'Start date'
    },
    {
      column: 'end_date',
      type: 'date',
      label: 'To Date',
      placeholder: 'End date'
    },
    
    // Text search
    {
      column: 'name',
      type: 'text',
      label: 'Product Name',
      placeholder: 'Search products...'
    },
    
    // Clear button
    {
      type: 'clear',
      label: 'Clear All',
      className: 'btn btn-outline-secondary btn-sm',
      icon: 'fas fa-eraser'
    }
  ],
  
  serverSide: true,
  stateSave: true,
  responsive: true
});
```

## Best Practices

1. **Logical grouping** - Group related filters together
2. **Clear labels** - Use descriptive labels for better UX
3. **Default options** - Always provide "All" or empty options for selects
4. **Smart date ranges** - Use the built-in smart date range logic
5. **State management** - Enable stateSave to persist filter states
6. **Server optimization** - Index filtered columns in database
7. **Responsive design** - Filters automatically wrap on smaller screens
8. **Performance** - Use debounced text inputs (built-in 300ms delay)