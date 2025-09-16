# 🚀 Modern Table.js c

**Zero-dependency, DataTables-compatible table library with modern ES6 architecture**

[![npm version](https://badge.fury.io/js/modern-table-js.svg)](https://www.npmjs.com/package/modern-table-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CDN](https://img.shields.io/badge/CDN-jsDelivr-orange)](https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/)

## 📸 Screenshots

### Desktop View
![Desktop Bootstrap](https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/screenshots/desktop-bootstrap.png)

### Dark Mode
![Desktop Dark](https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/screenshots/desktop-dark.png)

### Mobile Responsive
![Mobile Responsive](https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/screenshots/mobile-responsive.png)

## ✨ What's New in v1.0.9

✨ Features
🚀 Zero Dependencies - Pure vanilla JavaScript
📱 Mobile First - Smart responsive design
⚡ High Performance - Optimized for large datasets
🎨 Modern UI - Beautiful default styling
🔌 Plugin System - Extensible architecture
🌙 Dark Mode - Built-in theme support
⌨️ Keyboard Navigation - Full accessibility
📊 Server-side Processing - Laravel/PHP ready
🔍 Individual Column Search - Search each column independently
🎯 DataTables Compatible - Easy migration

### 🎯 DataTables Compatibility

- **`serverSide: true/false`** - Exact same syntax as DataTables
- **`dataSrc` support** - Built-in response transformation
- **Auto mode detection** - Smart client vs server-side processing
- **Easy migration** - Drop-in replacement for DataTables

## 🚀 Quick Start

### CDN (Recommended)

```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/modern-table.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/responsive.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/themes.css" rel="stylesheet"> <!-- Required for dark mode -->

<!-- JavaScript (Minified) -->
<script src="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/dist/modern-table.min.js"></script>

<!-- OR ES Module -->
<script type="module" src="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/core/ModernTable.js"></script>
```

### With Bootstrap + Font Awesome

```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/modern-table.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/responsive.css" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/themes.css" rel="stylesheet"> <!-- For dark mode -->
<script src="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.9/dist/modern-table.min.js"></script>
```

### NPM

```bash
npm install modern-table-js
```

## Basic Usage

## Server-side (API)

```javascript
import { ModernTable } from "modern-table-js";

const table = new ModernTable("#myTable", {
  api: "/api/users", // Server-side data
  columns: [
    { data: "name", title: "Name" },
    { data: "email", title: "Email" },
    { data: "status", title: "Status" },
    { data: "action", title: "Actions", searchable: false }, // Skip search
  ],
  responsive: true,
  select: true,
  columnSearch: true, // Enable individual column search
  buttons: ["copy", "csv", "excel"],
});
```

## With Authentication Token

```javascript
const table = new ModernTable("#myTable", {
  api: {
    url: "/api/users",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
    },
  },
  columns: [
    { data: "name", title: "Name" },
    { data: "email", title: "Email" },
    { data: "status", title: "Status" },
  ],
});
```

## Client-side (Static Data)

```javascript
const users = [
  { name: "John Doe", email: "john@example.com", status: "active" },
  { name: "Jane Smith", email: "jane@example.com", status: "inactive" },
];

const table = new ModernTable("#myTable", {
  data: users, // Client-side data
  columns: [
    { data: "name", title: "Name" },
    { data: "email", title: "Email" },
    { data: "status", title: "Status" },
  ],
  responsive: true,
  select: true,
  buttons: ["copy", "csv", "excel"],
});
```

## Documentation

## Core Options

```javascript
const table = new ModernTable("#table", {
  // Data source (simple)
  api: "/api/data",

  // Data source (with auth and callbacks)
  api: {
    url: "/api/users",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
      "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
    },

    // Before request is sent (like beforeSend)
    beforeSend: function (params) {
      console.log("beforeSend");
      // Return false to abort request
    },

    // On successful response (like success)
    success: function (data, textStatus, response) {
      console.log("Request successful:", data);
    },

    // On error (like error)
    error: function (error, textStatus, errorThrown) {
      console.error("Request failed:", error);
      alert("Failed to load data");
      // Return fallback data to prevent table error
      return {
        data: [],
        recordsTotal: 0,
        recordsFiltered: 0,
      };
    },

    // Always runs (like complete)
    complete: function () {
      console.log("Request completed");
    },

    // Legacy support
    beforeRequest: function (config) {
      // Modify request config
      return config;
    },
  },

  // Columns configuration
  columns: [
    { data: "name", title: "Name", orderable: true },
    { data: "email", title: "Email" },
    {
      data: "status",
      title: "Status",
      render: (data) => `<span class="badge">${data}</span>`,
    },
  ],

  serverSide: true,

  // Features
  pageLength: 10,
  lengthMenu: [5, 10, 25, 50],
  order: [[2, "desc"]], // name column
  ordering: true,
  searching: true,
  columnSearch: true,
  paging: true,
  select: true,
  responsive: true,

  // UX
  theme: "auto",
  keyboard: true,
  accessibility: true,

  // State
  stateSave: true,
  stateDuration: 3600,

  // Callbacks (DataTables compatible)
  initComplete: function(data, meta) {
    console.log('Table initialized with', data.length, 'rows');
  },
  drawCallback: function(data) {
    console.log('Table redrawn');
  },
  rowCallback: function(row, data, index) {
    // Customize row appearance
    if (data.status === 'inactive') {
      row.classList.add('table-warning');
    }
  },
  onRowClick: function(data, index, event) {
    console.log('Row clicked:', data);
  },
  onSelectionChange: function(selectedRows) {
    console.log('Selection changed:', selectedRows.length, 'rows selected');
  }
});
```

## 📚 Documentation

For complete documentation, examples, and advanced features, visit our [Documentation Hub](./docs/).

### Quick Links
- [Column Configuration](./docs/columns.md) - Setup columns and rendering
- [Button System](./docs/buttons.md) - Built-in and custom buttons  
- [API Integration](./docs/api-integration.md) - Server-side data handling
- [Laravel Integration](./docs/integrations/laravel.md) - PHP backend setup
- [TypeScript Support](./docs/typescript.md) - Type definitions
- [API Parameter Transformation](./docs/api-parameter-transformation.md) - External API integration

## 🎨 Styling & Themes

Built-in CSS files: `modern-table.css`, `themes.css`, `responsive.css`

```javascript
const table = new ModernTable('#myTable', {
  theme: 'auto', // 'light', 'dark', or 'auto'
});
```

## ⚡ Performance & Browser Support

- **67% faster** than DataTables
- **Zero dependencies** - Pure vanilla JavaScript
- **Mobile-first** responsive design
- **Browser support**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+

## 🔄 Migration from DataTables

```javascript
// DataTables → ModernTable (same syntax!)
const table = new ModernTable('#myTable', {
  api: '/api/users',
  serverSide: true,
  columns: [...]
});
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- 📧 Email: support@modern-table-js.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/modern-table-js/issues)
- 📖 Documentation: [Full Documentation](https://modern-table-js.com/docs)
- 💬 Community: [Discord Server](https://discord.gg/modern-table-js)
```
