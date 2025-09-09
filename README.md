# ModernTable.js

[![npm version](https://badge.fury.io/js/modern-table-js.svg)](https://badge.fury.io/js/modern-table-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/modern-table-js)](https://bundlephobia.com/package/modern-table-js)

Modern, lightweight, vanilla JavaScript table library with **zero dependencies**. DataTables-compatible API with mobile-first responsive design.

## ✨ Features

- 🚀 **Zero Dependencies** - Pure vanilla JavaScript
- 📱 **Mobile First** - Smart responsive design
- ⚡ **High Performance** - Optimized for large datasets
- 🎨 **Modern UI** - Beautiful default styling
- 🔌 **Plugin System** - Extensible architecture
- 🌙 **Dark Mode** - Built-in theme support
- ⌨️ **Keyboard Navigation** - Full accessibility
- 📊 **Server-side Processing** - Laravel/PHP ready
- 🎯 **DataTables Compatible** - Easy migration

## 🚀 Quick Start

### CDN
```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@latest/modern-table.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@latest/responsive.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@latest/themes.css" rel="stylesheet">

<!-- JavaScript (ES Module) -->
<script type="module" src="https://cdn.jsdelivr.net/npm/modern-table-js@latest/core/ModernTable.js"></script>

<!-- JavaScript (UMD) -->
<script src="https://cdn.jsdelivr.net/npm/modern-table-js@latest/dist/modern-table.min.js"></script>
```

### NPM
```bash
npm install modern-table-js
```

### Basic Usage
```javascript
import { ModernTable } from 'modern-table-js';

const table = new ModernTable('#myTable', {
    api: '/api/users',
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
    // Data source
    api: '/api/data',
    
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
        'copy',
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

## 🌐 Server-side Integration

### Laravel Example
```php
// Controller
public function users(Request $request)
{
    $query = User::query();
    
    // Search
    if ($request->has('search')) {
        $query->where('name', 'like', '%' . $request->search . '%');
    }
    
    // Sorting
    if ($request->has('order')) {
        $order = $request->order[0];
        $query->orderBy($order['column'], $order['dir']);
    }
    
    // Pagination
    $users = $query->paginate($request->size ?? 10);
    
    return response()->json([
        'data' => $users->items(),
        'meta' => [
            'total' => $users->total(),
            'filtered' => $users->total(),
            'current_page' => $users->currentPage(),
            'last_page' => $users->lastPage()
        ]
    ]);
}
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
git clone https://github.com/modern-table/modern-table-js.git

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

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## 📞 Support

- 📖 [Documentation](https://modern-table.js.org)
- 🐛 [Issues](https://github.com/modern-table/modern-table-js/issues)
- 💬 [Discussions](https://github.com/modern-table/modern-table-js/discussions)

---

Made with ❤️ by the ModernTable.js team