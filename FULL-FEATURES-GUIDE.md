# 🚀 ModernTable.js - Complete Features Guide

Panduan lengkap penggunaan semua fitur ModernTable.js dengan contoh implementasi nyata.

## 📋 Table of Contents

1. [Basic Setup](#basic-setup)
2. [Advanced Configuration](#advanced-configuration)
3. [Server-side Integration](#server-side-integration)
4. [Advanced Filters](#advanced-filters)
5. [State Management](#state-management)
6. [Export Features](#export-features)
7. [Theme System](#theme-system)
8. [Keyboard Navigation](#keyboard-navigation)
9. [Responsive Design](#responsive-design)
10. [Plugin System](#plugin-system)

---

## 🎯 Basic Setup

### Minimal Setup
```javascript
import { ModernTable } from '/js/core/ModernTable.js';

const table = new ModernTable('#myTable', {
    api: '/api/users',
    columns: [
        { data: 'id', title: 'ID' },
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' }
    ]
});
```

### Full Configuration Example
```javascript
const table = new ModernTable('#usersTable', {
    // 🌐 Data Source
    api: '/api/users',
    
    // 📊 Columns Configuration
    columns: [
        {
            data: 'DT_RowIndex',
            title: 'No',
            orderable: false,
            className: 'text-center',
            style: 'width: 60px;'
        },
        {
            data: 'name',
            title: 'Full Name',
            orderable: true,
            searchable: true
        },
        {
            data: 'email',
            title: 'Email Address',
            orderable: true,
            searchable: true
        },
        {
            data: 'status',
            title: 'Status',
            className: 'text-center',
            render: (data) => `<span class="badge bg-${data === 'active' ? 'success' : 'danger'}">${data}</span>`
        },
        {
            data: 'created_at',
            title: 'Created',
            render: (data) => new Date(data).toLocaleDateString()
        },
        {
            data: 'action',
            title: 'Actions',
            orderable: false,
            searchable: false,
            className: 'text-center'
        }
    ],
    
    // 🔧 Core Features
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50, 100],
    ordering: true,
    searching: true,
    paging: true,
    select: true,
    responsive: true,
    
    // 🎨 UI Features
    theme: 'auto', // 'light', 'dark', 'auto'
    keyboard: true,
    accessibility: true,
    
    // 💾 State Management
    stateSave: true,
    stateDuration: 3600, // 1 hour in seconds
    
    // 🔘 Buttons & Export
    buttons: [
        'copy',
        'csv',
        'excel',
        'pdf',
        'print',
        'colvis'
    ],
    
    // 🔍 Advanced Filters
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
        }
    ],
    
    // 📞 Callbacks
    onDataLoaded: (data, meta) => {
        console.log('Data loaded:', data.length, 'records');
    },
    onSelectionChange: (selectedRows) => {
        console.log('Selected:', selectedRows.length, 'rows');
    },
    onError: (error) => {
        console.error('Table error:', error);
    }
});
```

---

## 🌐 Server-side Integration

### Laravel Controller (Complete Example)
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        try {
            // DataTables parameters
            $draw = (int) $request->input('draw', 1);
            $start = (int) $request->input('start', 0);
            $length = (int) $request->input('length', 10);
            $searchTerm = $request->input('search.value', '');
            
            $query = User::query();
            
            // 🔍 Global Search
            if (!empty($searchTerm)) {
                $query->where(function ($q) use ($searchTerm) {
                    $q->where('name', 'like', '%' . $searchTerm . '%')
                      ->orWhere('email', 'like', '%' . $searchTerm . '%');
                });
            }
            
            // 🔧 Advanced Filters
            if ($request->filled('filters')) {
                $filters = $request->filters;
                
                if (!empty($filters['status'])) {
                    $query->where('status', $filters['status']);
                }
                
                if (!empty($filters['role'])) {
                    $query->where('role', $filters['role']);
                }
                
                if (!empty($filters['created_at_from'])) {
                    $query->whereDate('created_at', '>=', $filters['created_at_from']);
                }
                
                if (!empty($filters['created_at_to'])) {
                    $query->whereDate('created_at', '<=', $filters['created_at_to']);
                }
            }
            
            // 📊 Sorting
            if ($request->has('order') && is_array($request->order)) {
                $order = $request->order[0];
                $columnIndex = $order['column'] ?? 0;
                $direction = $order['dir'] ?? 'asc';
                
                $columns = ['id', 'name', 'email', 'status', 'role', 'created_at'];
                $sortColumn = $columns[$columnIndex] ?? 'id';
                
                $query->orderBy($sortColumn, $direction);
            }
            
            // 📈 Get totals and data
            $total = User::count();
            $filtered = $query->count();
            $users = $query->skip($start)->take($length)->get();
            
            // 🎨 Add action buttons
            $data = $users->map(function ($user) {
                $user->action = '
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-sm" onclick="editUser(' . $user->id . ')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(' . $user->id . ')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ';
                return $user;
            });
            
            // 📤 DataTables format response
            return response()->json([
                'draw' => $draw,
                'recordsTotal' => $total,
                'recordsFiltered' => $filtered,
                'data' => $data
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
```

### Route Setup
```php
// routes/api.php
Route::get('/users', [UserController::class, 'index']);
```

---

## 🔍 Advanced Filters

### Complete Filter Configuration
```javascript
const table = new ModernTable('#table', {
    api: '/api/users',
    columns: [...],
    
    // 🔍 Advanced Filters
    filters: [
        // Select Filter
        {
            column: 'status',
            type: 'select',
            label: 'Status',
            placeholder: 'All Status',
            options: [
                { value: '', text: 'All Status' },
                { value: 'active', text: 'Active' },
                { value: 'inactive', text: 'Inactive' },
                { value: 'pending', text: 'Pending' }
            ]
        },
        
        // Text Filter
        {
            column: 'department',
            type: 'text',
            label: 'Department',
            placeholder: 'Filter by department'
        },
        
        // Date Filter
        {
            column: 'created_at',
            type: 'date',
            label: 'Exact Date',
            placeholder: 'Select date'
        },
        
        // Date Range Filter
        {
            column: 'created_at',
            type: 'daterange',
            label: 'Date Range',
            placeholder: 'Select date range'
        },
        
        // Number Range Filter
        {
            column: 'salary',
            type: 'numberrange',
            label: 'Salary Range',
            min: 0,
            max: 100000
        },
        
        // Clear All Button
        {
            type: 'clear',
            label: 'Clear All',
            className: 'btn btn-outline-danger btn-sm',
            icon: 'fas fa-eraser'
        }
    ]
});
```

---

## 💾 State Management

### Configuration
```javascript
const table = new ModernTable('#table', {
    // 💾 State Management
    stateSave: true,
    stateDuration: 3600, // 1 hour (in seconds)
    
    // What gets saved:
    // - Current page
    // - Page length
    // - Search term
    // - Column sorting
    // - Advanced filters
    // - Column visibility
    // - Row selection
});
```

### Manual State Control
```javascript
// Save current state
table.saveState();

// Load saved state
table.loadSavedState();

// Clear saved state
table.clearState();

// Check if state saving is enabled
if (table.stateManager.isEnabled()) {
    console.log('State management is active');
}
```

---

## 📤 Export Features

### Button Configuration
```javascript
const table = new ModernTable('#table', {
    buttons: [
        // Built-in buttons
        'copy',
        'csv',
        'excel',
        'pdf',
        'print',
        'colvis',
        
        // Custom CSV button
        {
            extend: 'csv',
            text: '<i class="fas fa-file-csv"></i> Export CSV',
            className: 'btn btn-success btn-sm',
            filename: 'users-export-' + new Date().toISOString().split('T')[0],
            action: function(e, dt, node, config) {
                // Custom CSV export logic
                const data = table.data.map(row => ({
                    'Name': row.name,
                    'Email': row.email,
                    'Status': row.status
                }));
                
                // Convert to CSV and download
                const csv = convertToCSV(data);
                downloadCSV(csv, config.filename + '.csv');
            }
        },
        
        // Custom action button
        {
            text: '<i class="fas fa-plus"></i> Add User',
            className: 'btn btn-primary btn-sm',
            action: function(e, dt, node, config) {
                // Custom action
                showAddUserModal();
            }
        }
    ]
});
```

### Custom Print Function
```javascript
// Custom print with full control
table.customPrint({
    title: 'User Management Report',
    subtitle: 'Generated on ' + new Date().toLocaleDateString(),
    columns: ['name', 'email', 'status'], // Select specific columns
    excludeColumns: ['action'], // Exclude columns
    pageSize: 'A4',
    orientation: 'landscape',
    customCSS: `
        body { font-family: Arial, sans-serif; }
        .print-title { color: #2c3e50; font-size: 24px; }
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #3498db; color: white; }
    `,
    beforePrint: function(printWindow) {
        console.log('Preparing print...');
    },
    afterPrint: function() {
        console.log('Print completed!');
    }
});
```

---

## 🎨 Theme System

### Theme Configuration
```javascript
const table = new ModernTable('#table', {
    theme: 'auto', // 'light', 'dark', 'auto'
});

// Manual theme control
table.plugins.theme.setTheme('dark');
table.plugins.theme.setTheme('light');
table.plugins.theme.setTheme('auto');
```

### Custom Theme Integration
```javascript
// Sync with your app's theme system
function syncTheme(theme) {
    // Update body theme
    document.body.setAttribute('data-bs-theme', theme);
    
    // Update ModernTable theme
    if (window.modernTableInstance?.plugins?.theme) {
        window.modernTableInstance.plugins.theme.setTheme(theme);
    }
    
    // Save preference
    localStorage.setItem('app-theme', theme);
}
```

---

## ⌨️ Keyboard Navigation

### Enabled Features
```javascript
const table = new ModernTable('#table', {
    keyboard: true, // Enable keyboard navigation
});
```

### Available Shortcuts
- **Arrow Keys** - Navigate rows
- **Home/End** - First/last row
- **Page Up/Down** - Navigate pages
- **Enter/Space** - Select row
- **Ctrl+A** - Select all
- **Escape** - Clear selection
- **Ctrl+C** - Copy selected
- **Ctrl+F** - Focus search
- **Ctrl+R** - Reload table
- **Ctrl+H** - Show shortcuts

### Show Shortcuts Popup
```javascript
// Show keyboard shortcuts
table.showKeyboardShortcuts();
```

---

## 📱 Responsive Design

### Configuration
```javascript
const table = new ModernTable('#table', {
    responsive: true, // Enable responsive features
});
```

### Responsive Behavior
- **Desktop** - Full table view with all columns
- **Tablet** - Smart column hiding based on priority
- **Mobile** - Card-based layout for better readability

### Custom Responsive Rules
```javascript
// Custom column visibility rules
const table = new ModernTable('#table', {
    responsive: true,
    columns: [
        { data: 'name', title: 'Name', priority: 1 }, // Always visible
        { data: 'email', title: 'Email', priority: 2 }, // Hide on small screens
        { data: 'phone', title: 'Phone', priority: 3 }, // Hide first
        { data: 'address', title: 'Address', priority: 4 } // Hide first
    ]
});
```

---

## 🔌 Plugin System

### Available Plugins
```javascript
const table = new ModernTable('#table', {
    // Core plugins (auto-loaded based on options)
    select: true,        // SelectionPlugin
    responsive: true,    // ResponsivePlugin  
    theme: 'auto',      // ThemePlugin
    keyboard: true,     // KeyboardPlugin
    accessibility: true, // AccessibilityPlugin
    buttons: ['copy'],  // ExportPlugin
});

// Access plugins
table.plugins.selection.selectAll();
table.plugins.sorting.setSort(0, 'desc');
table.plugins.theme.setTheme('dark');
```

### Plugin Events
```javascript
// Listen to plugin events
table.on('selectionChange', (selectedRows) => {
    console.log('Selection changed:', selectedRows);
});

table.on('themeChange', (theme) => {
    console.log('Theme changed to:', theme);
});
```

---

## 🎯 Complete Working Example

### HTML
```html
<!DOCTYPE html>
<html>
<head>
    <title>ModernTable.js Full Features</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="/css/modern-table.css" rel="stylesheet">
</head>
<body>
    <div class="container py-4">
        <h1>Users Management</h1>
        <table id="usersTable" class="table table-striped"></table>
    </div>
    
    <script type="module" src="/js/app.js"></script>
</body>
</html>
```

### JavaScript (app.js)
```javascript
import { ModernTable } from '/js/core/ModernTable.js';

// Initialize with all features
const table = new ModernTable('#usersTable', {
    api: '/api/users',
    
    columns: [
        { data: 'DT_RowIndex', title: 'No', orderable: false, className: 'text-center' },
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' },
        { 
            data: 'status', 
            title: 'Status',
            render: (data) => `<span class="badge bg-${data === 'active' ? 'success' : 'danger'}">${data}</span>`
        },
        { data: 'created_at', title: 'Created', render: (data) => new Date(data).toLocaleDateString() }
    ],
    
    // All features enabled
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50],
    searching: true,
    ordering: true,
    paging: true,
    select: true,
    responsive: true,
    theme: 'auto',
    keyboard: true,
    accessibility: true,
    stateSave: true,
    
    buttons: ['copy', 'csv', 'excel', 'print', 'colvis'],
    
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
        }
    ],
    
    onDataLoaded: (data, meta) => {
        console.log(`Loaded ${data.length} records`);
    }
});

// Make globally available
window.usersTable = table;
```

---

## 🚀 Performance Tips

### 1. Optimize Large Datasets
```javascript
const table = new ModernTable('#table', {
    // Use server-side processing for large datasets
    pageLength: 25, // Reasonable page size
    stateSave: true, // Cache user preferences
});
```

### 2. Lazy Load Features
```javascript
// Only enable features you need
const table = new ModernTable('#table', {
    responsive: false, // Disable if not needed
    keyboard: false,   // Disable if not needed
    accessibility: false, // Disable if not needed
});
```

### 3. Efficient Rendering
```javascript
// Use render functions efficiently
{
    data: 'status',
    render: (data) => {
        // Cache DOM elements or use simple string templates
        return `<span class="status-${data}">${data}</span>`;
    }
}
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Data not loading**
```javascript
// Check API endpoint and response format
console.log('API URL:', table.apiClient.config);

// Check for errors
table.on('error', (error) => {
    console.error('Table error:', error);
});
```

**2. Search not working**
```php
// Ensure Laravel controller handles search.value
$searchTerm = $request->input('search.value', '');
```

**3. State not saving**
```javascript
// Check if stateSave is enabled
console.log('State save enabled:', table.options.stateSave);

// Check localStorage
console.log('Saved state:', localStorage.getItem('modernTable_myTable'));
```

---

## 📞 Support & Resources

- 📖 **Documentation**: [Full API Reference](./API.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/modern-table/modern-table-js/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/modern-table/modern-table-js/discussions)
- 📧 **Email**: support@modern-table.js.org

---

**🎉 Congratulations! You now have access to all ModernTable.js features. Happy coding!**