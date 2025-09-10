# ModernTable.js

[![npm version](https://badge.fury.io/js/modern-table-js.svg)](https://www.npmjs.com/package/modern-table-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/modern-table-js)](https://bundlephobia.com/package/modern-table-js)
[![Downloads](https://img.shields.io/npm/dm/modern-table-js.svg)](https://www.npmjs.com/package/modern-table-js)
[![GitHub Stars](https://img.shields.io/github/stars/agustra/modern-table-js.svg)](https://github.com/agustra/modern-table-js)

Modern, lightweight, vanilla JavaScript table library with **zero dependencies**. DataTables-compatible API with mobile-first responsive design.

## 📸 Screenshots

### Desktop View (Bootstrap + Font Awesome)
![ModernTable Desktop](./screenshots/desktop-bootstrap.png)

### Mobile Responsive
![ModernTable Mobile](./screenshots/mobile-responsive.png)

*More screenshots available in [SCREENSHOTS.md](./SCREENSHOTS.md)*

## ✨ Features

- 🚀 **Zero Dependencies** - Pure vanilla JavaScript
- 📱 **Mobile First** - Smart responsive design
- ⚡ **High Performance** - Optimized for large datasets
- 🎨 **Modern UI** - Beautiful default styling
- 🔌 **Plugin System** - Extensible architecture
- 🌙 **Dark Mode** - Built-in theme support
- ⌨️ **Keyboard Navigation** - Full accessibility
- 📊 **Server-side Processing** - Laravel/PHP ready
- 🔍 **Individual Column Search** - Search each column independently
- 🎯 **DataTables Compatible** - Easy migration

## 🚀 Quick Start

### CDN
```html
<!-- Option 1: With Bootstrap + Font Awesome (Recommended) -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.6/modern-table.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.6/responsive.css" rel="stylesheet">

<!-- Option 2: Standalone (Zero Dependencies) -->
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.6/modern-table.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.6/responsive.css" rel="stylesheet">

<!-- JavaScript -->
<script type="module" src="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.6/core/ModernTable.js"></script>
```

### NPM
```bash
npm install modern-table-js
```

### Basic Usage

#### Server-side (API)
```javascript
import { ModernTable } from 'modern-table-js';

const table = new ModernTable('#myTable', {
    api: '/api/users',                    // Server-side data
    columns: [
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' },
        { data: 'status', title: 'Status' },
        { data: 'action', title: 'Actions', searchable: false } // Skip search
    ],
    responsive: true,
    select: true,
    columnSearch: true,                   // Enable individual column search
    buttons: ['copy', 'csv', 'excel']
});
```

#### With Authentication Token
```javascript
const table = new ModernTable('#myTable', {
    api: {
        url: '/api/users',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    },
    columns: [
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' },
        { data: 'status', title: 'Status' }
    ]
});
```

#### Client-side (Static Data)
```javascript
const users = [
    { name: 'John Doe', email: 'john@example.com', status: 'active' },
    { name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' }
];

const table = new ModernTable('#myTable', {
    data: users,                          // Client-side data
    columns: [
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' },
        { data: 'status', title: 'Status' }
    ],
    responsive: true,
    select: true,
    buttons: ['copy', 'csv', 'excel']
});
```

## 📖 Documentation

### Core Options
```javascript
const table = new ModernTable('#table', {
    // Data source (simple)
    api: '/api/data',
    
    // Data source (with auth and callbacks)
    api: {
        url: '/api/data',
        method: 'GET',
        timeout: 30000,
        headers: {
            'Authorization': 'Bearer YOUR_TOKEN',
            'Content-Type': 'application/json'
        },
        beforeSend: function(params) {
            // Show loading, modify params, etc.
        },
        success: function(data, status, response) {
            // Handle successful response
        },
        error: function(error, status, message) {
            // Handle errors
        },
        complete: function() {
            // Always runs (cleanup, hide loading, etc.)
        }
    },
    
    // Columns configuration
    columns: [
        { data: 'name', title: 'Name', orderable: true },
        { data: 'email', title: 'Email' },
        { 
            data: 'status', 
            title: 'Status',
            render: (data) => `<span class="badge">${data}</span>`
        }
    ],
    
    // Features
    paging: true,
    pageLength: 10,
    searching: true,
    columnSearch: false,                  // Individual column search
    ordering: true,
    select: true,
    responsive: true,
    
    // UI
    theme: 'auto', // 'light', 'dark', 'auto'
    buttons: ['copy', 'csv', 'excel', 'pdf'],
    
    // Advanced
    stateSave: true,
    keyboard: true,
    accessibility: true
});
```

### Individual Column Search
```javascript
const table = new ModernTable('#table', {
    columnSearch: true,                   // Enable individual column search
    columns: [
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' },
        { data: 'status', title: 'Status' },
        { data: 'action', title: 'Actions', searchable: false } // Skip search
    ]
});

// Clear all column searches
table.clearColumnSearches();

// Search specific column programmatically
table.searchColumn(1, 'john'); // Search column 1 (name) for 'john'
```

### Advanced Filters
```javascript
const table = new ModernTable('#table', {
    filters: [
        {
            column: 'status',
            type: 'select',
            options: [
                { value: 'active', text: 'Active' },
                { value: 'inactive', text: 'Inactive' }
            ]
        },
        {
            column: 'created_at',
            type: 'daterange',
            label: 'Date Range'
        }
    ]
});
```

### Custom Buttons
```javascript
const table = new ModernTable('#table', {
    buttons: [
        'copy', 'csv', 'pdf',               // Built-in export buttons
        {
            text: 'Custom Action',
            className: 'btn btn-primary',
            action: function(e, dt, node, config) {
                alert('Custom button clicked!');
            }
        }
    ]
});
```

## 🎨 Themes

ModernTable.js comes with built-in theme support:

```javascript
// Auto theme (follows system preference)
theme: 'auto'

// Light theme
theme: 'light'

// Dark theme  
theme: 'dark'
```

## ⌨️ Keyboard Shortcuts

- **Arrow Keys** - Navigate rows
- **Enter/Space** - Select row
- **Ctrl+A** - Select all
- **Ctrl+C** - Copy selected
- **Ctrl+D** - Delete selected
- **Ctrl+F** - Focus search
- **Ctrl+R** - Reload table
- **Ctrl+H** - Show shortcuts

## 🔌 Plugins

ModernTable.js features a modular plugin system:

- **SelectionPlugin** - Row selection
- **ResponsivePlugin** - Mobile responsiveness
- **ExportPlugin** - Data export (CSV, Excel, PDF)
- **ThemePlugin** - Dark/light mode
- **KeyboardPlugin** - Keyboard navigation
- **AccessibilityPlugin** - Screen reader support

## 💾 Data Sources

### Client-side Data
```javascript
// Static array
const data = [
    { id: 1, name: 'John', email: 'john@example.com' },
    { id: 2, name: 'Jane', email: 'jane@example.com' }
];

const table = new ModernTable('#table', {
    data: data,                           // Use data instead of api
    columns: [
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' }
    ]
});
```

### Dynamic Client-side Data
```javascript
// Fetch data once, then use client-side
fetch('/api/users')
    .then(response => response.json())
    .then(users => {
        const table = new ModernTable('#table', {
            data: users,                  // Client-side processing
            columns: [
                { data: 'name', title: 'Name' },
                { data: 'email', title: 'Email' }
            ],
            paging: true,                 // Client-side pagination
            searching: true,              // Client-side search
            ordering: true                // Client-side sorting
        });
    });
```

### Adding/Updating Data
```javascript
// Add new row
table.addRow({ name: 'New User', email: 'new@example.com' });

// Update existing row
table.updateRow(0, { name: 'Updated Name' });

// Remove row
table.removeRow(0);

// Replace all data
table.setData(newDataArray);
```

## 🌐 Server-side Integration

### Laravel Example with Column Search
```php
// Controller
public function users(Request $request)
{
    // DataTables parameters
    $draw = (int) $request->input('draw', 1);
    $start = (int) $request->input('start', 0);
    $length = (int) $request->input('length', 10);
    $searchTerm = $request->input('search.value', '');
    
    $query = User::query();
    
    // Global search
    if (!empty($searchTerm)) {
        $query->where(function ($q) use ($searchTerm) {
            $q->where('name', 'like', '%' . $searchTerm . '%')
              ->orWhere('email', 'like', '%' . $searchTerm . '%');
        });
    }
    
    // Individual column search
    $columns = $request->input('columns', []);
    if (!empty($columns) && is_array($columns)) {
        foreach ($columns as $index => $column) {
            $searchValue = null;
            
            if (isset($column['search']) && is_array($column['search'])) {
                $searchValue = $column['search']['value'] ?? null;
            }
            
            if (!empty($searchValue)) {
                $columnData = $column['data'] ?? null;
                
                switch ($columnData) {
                    case 'name':
                        $query->where('name', 'like', '%' . $searchValue . '%');
                        break;
                    case 'email':
                        $query->where('email', 'like', '%' . $searchValue . '%');
                        break;
                    case 'status':
                        $query->where('status', 'like', '%' . $searchValue . '%');
                        break;
                }
            }
        }
    }
    
    // Sorting
    if ($request->has('order') && is_array($request->order)) {
        $order = $request->order[0];
        $columnIndex = $order['column'] ?? 0;
        $direction = $order['dir'] ?? 'asc';
        
        $columns = ['id', 'name', 'email', 'status'];
        $sortColumn = $columns[$columnIndex] ?? 'id';
        $query->orderBy($sortColumn, $direction);
    }
    
    // Get totals and paginated data
    $total = User::count();
    $filtered = $query->count();
    $users = $query->skip($start)->take($length)->get();
    
    // DataTables format response
    return response()->json([
        'draw' => $draw,
        'recordsTotal' => $total,
        'recordsFiltered' => $filtered,
        'data' => $users
    ]);
}
```

### Laravel with Authentication
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
});

// Controller with auth
public function index(Request $request)
{
    // Ensure user is authenticated
    $user = $request->user();
    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }
    
    // Your existing DataTables logic...
    $query = User::query();
    
    // Optional: Filter by user's organization/role
    if (!$user->hasRole('admin')) {
        $query->where('organization_id', $user->organization_id);
    }
    
    // Rest of your DataTables implementation
}
```

### Frontend with Token
```javascript
// Get token from Laravel Sanctum or Passport
const token = document.querySelector('meta[name="api-token"]').content;

const table = new ModernTable('#myTable', {
    api: {
        url: '/api/users',
        headers: {
            'Authorization': `Bearer ${token}`,
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            'Accept': 'application/json'
        }
    },
    columns: [
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' },
        { data: 'status', title: 'Status' }
    ]
});
```

### Complete API Configuration (jQuery.ajax-like)
```javascript
const table = new ModernTable('#myTable', {
    api: {
        url: '/api/users',
        method: 'GET',
        timeout: 30000, // 30 seconds
        headers: {
            'Authorization': 'Bearer ' + token
        },
        
        // Before request is sent (like beforeSend)
        beforeSend: function(params) {
            console.log('Sending request with params:', params);
            document.getElementById('loading').style.display = 'block';
            // Return false to abort request
        },
        
        // On successful response (like success)
        success: function(data, textStatus, response) {
            console.log('Request successful:', data);
        },
        
        // On error (like error)
        error: function(error, textStatus, errorThrown) {
            console.error('Request failed:', error);
            alert('Failed to load data');
            // Return fallback data to prevent table error
            return { data: [], recordsTotal: 0, recordsFiltered: 0 };
        },
        
        // Always runs (like complete)
        complete: function() {
            document.getElementById('loading').style.display = 'none';
            console.log('Request completed');
        },
        
        // Legacy support
        beforeRequest: function(config) {
            // Modify request config
            return config;
        }
    },
    columns: [
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' },
        { data: 'status', title: 'Status' }
    ]
});
```

## 📱 Responsive Design

ModernTable.js automatically adapts to different screen sizes:

- **Desktop** - Full table view
- **Tablet** - Smart column hiding
- **Mobile** - Card-based layout

## 🎯 Migration from DataTables

ModernTable.js is designed to be DataTables-compatible:

```javascript
// DataTables syntax works!
$('#table').ModernTable({
    ajax: '/api/data',
    columns: [
        { data: 'name' },
        { data: 'email' }
    ],
    responsive: true
});
```

## 🔧 API Reference

### Methods
```javascript
// Reload data
table.reload();

// Search
table.search('query');

// Get selected rows
const selected = table.getSelectedRows();

// Clear selection
table.clearSelection();

// Change page
table.page(2);

// Column visibility
table.column(0).visible(false);
```

### Callbacks (DataTables Compatible)
```javascript
const table = new ModernTable('#table', {
    // Called after table initialization
    initComplete: function(data, meta) {
        console.log('Table initialized with:', data.length, 'rows');
    },
    
    // Called BEFORE every table draw/redraw
    preDrawCallback: function(settings) {
        console.log('About to render:', settings.data.length, 'rows');
        // Show loading, validate data, preprocessing
        // Return false to cancel rendering
        return true;
    },
    
    // Called after every table draw/redraw
    drawCallback: function(settings) {
        console.log('Table drawn with:', settings.data.length, 'rows');
        // Re-bind events, apply styling, initialize tooltips, etc.
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new bootstrap.Tooltip(el);
        });
    },
    
    // Called when row DOM element is created
    createdRow: function(row, data, dataIndex) {
        // Add data attributes, CSS classes, event listeners
        row.setAttribute('data-user-id', data.id);
        if (data.role === 'admin') {
            row.classList.add('admin-row');
        }
    },
    
    // Called for each row during rendering
    rowCallback: function(row, data, index) {
        // Apply conditional styling, modify row content
        if (data.status === 'inactive') {
            row.classList.add('table-warning');
        }
    },
    
    // Called to manipulate header after each draw
    headerCallback: function(thead, data, start, end, display) {
        // Update header with dynamic info
        const nameHeader = thead.querySelector('th[data-column="1"]');
        if (nameHeader) {
            const activeCount = data.filter(user => user.status === 'active').length;
            nameHeader.title = `${activeCount} active users in current page`;
        }
    },
    
    // Called to manipulate footer after each draw
    footerCallback: function(row, data, start, end, display) {
        if (row) {
            const total = data.length;
            const active = data.filter(item => item.status === 'active').length;
            row.innerHTML = `
                <tr>
                    <th colspan="3">Summary:</th>
                    <th>Active: ${active}</th>
                    <th>Total: ${total}</th>
                    <th colspan="2"></th>
                </tr>
            `;
        }
    },
    
    // Called to generate custom info text
    infoCallback: function(settings, start, end, max, total, pre) {
        const percentage = total > 0 ? Math.round((total / max) * 100) : 0;
        return `
            <div class="d-flex justify-content-between">
                <span>Menampilkan ${start} sampai ${end} dari ${total} data</span>
                <span class="badge bg-info">${percentage}% data ditampilkan</span>
            </div>
        `;
    },
    
    // Custom state loading (override built-in)
    stateLoadCallback: function(settings) {
        const state = JSON.parse(localStorage.getItem('customTableState'));
        if (state) {
            // Example: Always reset page to 1 (exclude paging from state)
            state.page = 1;
            return state;
        }
        return null;
    },
    
    // Custom state saving (override built-in)
    stateSaveCallback: function(settings, data) {
        // Add custom metadata
        const enhancedState = {
            ...data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        localStorage.setItem('customTableState', JSON.stringify(enhancedState));
    },
    
    // Row click handler
    onRowClick: function(rowData, index, event) {
        console.log('Row clicked:', rowData);
    },
    
    // Selection change handler
    onSelectionChange: function(selectedRows) {
        console.log('Selection changed:', selectedRows.length, 'rows');
    },
    
    // Error handler
    onError: function(error) {
        console.error('Table error:', error);
    }
});
```

### Events
```javascript
table.on('dataLoaded', function(data, meta) {
    console.log('Data loaded:', data);
});

table.on('selectionChange', function(selectedRows) {
    console.log('Selection changed:', selectedRows);
});
```

## 🏗️ Build from Source

```bash
# Clone repository
git clone https://github.com/agustra/modern-table-js.git

# Install dependencies
npm install

# Build library
npm run build

# Run tests
npm test
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📚 Documentation

- 🚀 **[Quick Start Guide](./QUICK-START.md)** - Get running in 5 minutes
- 📖 **[Full Features Guide](./FULL-FEATURES-GUIDE.md)** - Complete reference
- 📊 **[Export Buttons Guide](./EXPORT-BUTTONS-GUIDE.md)** - Export & column filtering
- 📋 **[Export Quick Reference](./EXPORT-QUICK-REFERENCE.md)** - Quick reference card
- 🎨 **[CSS & Icons Guide](./CSS-ICONS-GUIDE.md)** - Styling & framework integration
- 📸 **[Screenshots](./SCREENSHOTS.md)** - Visual gallery

## 📞 Support

- 📖 [Documentation](https://github.com/agustra/modern-table-js#readme)
- 🐛 [Issues](https://github.com/agustra/modern-table-js/issues)
- 💬 [Discussions](https://github.com/agustra/modern-table-js/discussions)
- 📧 [Email Support](mailto:agusta.usk@gmail.com)

---

Made with ❤️ by the ModernTable.js team