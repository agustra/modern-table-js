# 🚀 ModernTable.js - Complete Features Guide

Panduan lengkap penggunaan semua fitur ModernTable.js dengan contoh implementasi nyata.

## 📋 Table of Contents

1. [Basic Setup](#basic-setup)
2. [Advanced Configuration](#advanced-configuration)
3. [Server-side Integration](#server-side-integration)
4. [Advanced Filters](#advanced-filters)
5. [State Management](#state-management)
6. [Export Features](#export-features)
7. [Callbacks & Events](#callbacks--events)
8. [Theme System](#theme-system)
9. [Keyboard Navigation](#keyboard-navigation)
10. [Responsive Design](#responsive-design)
11. [Plugin System](#plugin-system)

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
    
    // 📞 Callbacks (DataTables Compatible)
    initComplete: (data, meta) => {
        console.log('Table initialized with:', data.length, 'records');
    },
    
    drawCallback: (settings) => {
        console.log('Table drawn with:', settings.data.length, 'rows');
        // Perfect for re-binding events after each render
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new bootstrap.Tooltip(el);
        });
        // Apply custom styling, initialize components, etc.
    },
    
    footerCallback: (row, data, start, end, display) => {
        // Manipulate footer with dynamic totals/summary
        if (row) {
            const totalUsers = data.length;
            const activeUsers = data.filter(user => user.status === 'active').length;
            const inactiveUsers = totalUsers - activeUsers;
            
            row.innerHTML = `
                <tr>
                    <th colspan="2">Summary:</th>
                    <th class="text-center text-success">Active: ${activeUsers}</th>
                    <th class="text-center text-danger">Inactive: ${inactiveUsers}</th>
                    <th class="text-center"><strong>Total: ${totalUsers}</strong></th>
                    <th colspan="2"></th>
                </tr>
            `;
        }
    },
    
    onSelectionChange: (selectedRows) => {
        console.log('Selected:', selectedRows.length, 'rows');
    },
    
    onRowClick: (rowData, index, event) => {
        console.log('Row clicked:', rowData);
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

## 📞 Callbacks & Events

### Complete DataTables Compatible Callbacks

ModernTable.js mendukung **semua callback DataTables** untuk kompatibilitas penuh dan migrasi mudah.

```javascript
const table = new ModernTable('#table', {
    api: '/api/users',
    columns: [...],
    
    // ✨ initComplete - Called after table initialization
    initComplete: function(data, meta) {
        console.log('Table initialized with:', data.length, 'records');
        // Perfect for: Initial setup, one-time initialization
    },
    
    // ⏳ preDrawCallback - Called BEFORE every table draw/redraw
    preDrawCallback: function(settings) {
        console.log('About to render:', settings.data.length, 'rows');
        // Perfect for: Show loading, validate data, preprocessing
        // Return false to cancel rendering
        return true;
    },
    
    // 🎨 drawCallback - Called after every table draw/redraw
    drawCallback: function(settings) {
        console.log('Table redrawn with:', settings.data.length, 'rows');
        
        // Perfect for: Re-binding events, reinitializing components
        document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
            new bootstrap.Tooltip(el);
        });
        
        // Apply conditional styling after DOM is ready
        setTimeout(() => {
            settings.data.forEach((data, index) => {
                const row = document.querySelector(`tbody tr[data-index="${index}"]`);
                if (row && data.status === 'inactive') {
                    row.style.backgroundColor = '#fff3cd';
                    row.style.borderLeft = '4px solid #ffc107';
                }
            });
        }, 10);
    },
    
    // 🏭 createdRow - Called when row DOM element is created
    createdRow: function(row, data, dataIndex) {
        console.log('Row created:', dataIndex, data);
        
        // Perfect for: Add data attributes, CSS classes, event listeners
        row.setAttribute('data-user-id', data.id);
        row.setAttribute('data-user-role', data.role);
        
        // Add CSS classes based on data
        if (data.role === 'admin') {
            row.classList.add('admin-row');
        }
        
        if (data.email_verified_at) {
            row.classList.add('verified-user');
        }
        
        // Add custom event listeners
        row.addEventListener('dblclick', () => {
            console.log('Double-clicked user:', data.name);
            showUserDetails(data.id);
        });
    },
    
    // 🔄 rowCallback - Called for each row during rendering
    rowCallback: function(row, data, index) {
        // Perfect for: Row-specific styling, modify row content
        if (data.status === 'inactive') {
            row.classList.add('table-warning');
        }
        
        // Add row-specific attributes
        row.setAttribute('data-status', data.status);
    },
    
    // 📋 headerCallback - Called to manipulate header after each draw
    headerCallback: function(thead, data, start, end, display) {
        // Perfect for: Dynamic header info, sorting indicators
        const nameHeader = thead.querySelector('th[data-column="1"]');
        if (nameHeader) {
            const activeCount = data.filter(user => user.status === 'active').length;
            nameHeader.title = `${activeCount} active users in current page`;
        }
    },
    
    // 👣 footerCallback - Called to manipulate footer after each draw
    footerCallback: function(row, data, start, end, display) {
        if (row) {
            // Calculate real-time totals and summaries
            const totalUsers = data.length;
            const activeUsers = data.filter(user => user.status === 'active').length;
            const inactiveUsers = totalUsers - activeUsers;
            
            // Calculate financial totals (if applicable)
            const totalSalary = data.reduce((sum, item) => sum + (parseFloat(item.salary) || 0), 0);
            const avgSalary = totalUsers > 0 ? (totalSalary / totalUsers).toFixed(2) : 0;
            
            row.innerHTML = `
                <tr class="table-info">
                    <th colspan="2">Page Summary (${start}-${end}):</th>
                    <th class="text-center">
                        <span class="badge bg-success">${activeUsers} Active</span>
                    </th>
                    <th class="text-center">
                        <span class="badge bg-danger">${inactiveUsers} Inactive</span>
                    </th>
                    <th class="text-center">
                        <strong>Total: ${totalUsers}</strong>
                    </th>
                    <th class="text-end">
                        ${totalSalary > 0 ? `Avg: $${avgSalary}` : ''}
                    </th>
                    <th></th>
                </tr>
            `;
        }
    },
    
    // 📊 infoCallback - Called to generate custom info text
    infoCallback: function(settings, start, end, max, total, pre) {
        // Perfect for: Custom info format, additional statistics
        const percentage = total > 0 ? Math.round((total / max) * 100) : 0;
        
        return `
            <div class="d-flex justify-content-between align-items-center">
                <span>
                    📄 Menampilkan <strong>${start}</strong> sampai <strong>${end}</strong> 
                    dari <strong>${total}</strong> data
                    ${total < max ? ` (difilter dari <strong>${max}</strong> total)` : ''}
                </span>
                <span class="badge bg-info">
                    📊 ${percentage}% data ditampilkan
                </span>
            </div>
        `;
    },
    
    // 💾 stateLoadCallback - Custom state loading
    stateLoadCallback: function(settings) {
        // Perfect for: Custom storage, server-side state, selective restore
        const customKey = `modernTable_${window.location.pathname}_custom`;
        const savedState = localStorage.getItem(customKey);
        
        if (savedState) {
            const state = JSON.parse(savedState);
            
            // Example: Always reset page to 1 (exclude paging from state)
            state.page = 1;
            console.log('🚫 Paging excluded from state restore');
            
            // Show when state was saved
            if (state.timestamp) {
                const diffMinutes = Math.round((new Date() - new Date(state.timestamp)) / (1000 * 60));
                console.log(`🕰️ State saved ${diffMinutes} minutes ago`);
            }
            
            return state;
        }
        
        return null;
    },
    
    // 💾 stateSaveCallback - Custom state saving
    stateSaveCallback: function(settings, data) {
        // Perfect for: Enhanced metadata, server sync, selective save
        
        // Add custom metadata to state
        const enhancedState = {
            ...data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: Date.now()
        };
        
        // Save to custom location
        const customKey = `modernTable_${window.location.pathname}_custom`;
        localStorage.setItem(customKey, JSON.stringify(enhancedState));
        
        // Optional: Save to server for cross-device sync
        fetch('/api/save-table-state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                table: 'users',
                state: enhancedState,
                user_id: getCurrentUserId()
            })
        });
    },
    
    // 👆 onRowClick - Row click handler
    onRowClick: function(rowData, index, event) {
        console.log('Row clicked:', rowData);
        showUserDetails(rowData.id);
    },
    
    // ✅ onSelectionChange - Selection change handler
    onSelectionChange: function(selectedRows) {
        console.log('Selection changed:', selectedRows.length, 'rows');
        
        // Update bulk action buttons
        const bulkActions = document.getElementById('bulk-actions');
        if (selectedRows.length > 0) {
            bulkActions.style.display = 'block';
            bulkActions.querySelector('.count').textContent = selectedRows.length;
        } else {
            bulkActions.style.display = 'none';
        }
    },
    
    // ❌ onError - Error handler
    onError: function(error) {
        console.error('Table error:', error);
        showNotification('Failed to load data. Please try again.', 'error');
    }
});
```

### When Callbacks Are Called

| Callback | Trigger | Use Case |
|----------|---------|----------|
| `initComplete` | After initial data load | One-time setup, external component initialization |
| `drawCallback` | After every table render | Re-bind events, update styling, reinit components |
| `footerCallback` | After draw (if footer exists) | Dynamic totals, summaries, calculations |
| `onRowClick` | User clicks table row | Show details, navigate, select |
| `onSelectionChange` | Row selection changes | Update bulk actions, show/hide buttons |
| `onError` | API or processing error | Show notifications, fallback handling |

### Advanced Callback Examples

#### 1. Dynamic Footer with Real-time Calculations
```javascript
footerCallback: function(row, data, start, end, display) {
    if (row && data.length > 0) {
        // Financial calculations
        const totals = data.reduce((acc, item) => {
            acc.revenue += parseFloat(item.revenue) || 0;
            acc.expenses += parseFloat(item.expenses) || 0;
            acc.profit += parseFloat(item.profit) || 0;
            return acc;
        }, { revenue: 0, expenses: 0, profit: 0 });
        
        const profitMargin = totals.revenue > 0 ? 
            ((totals.profit / totals.revenue) * 100).toFixed(1) : 0;
        
        row.innerHTML = `
            <tr class="table-dark">
                <th colspan="3">Page Totals:</th>
                <th class="text-end text-success">$${totals.revenue.toLocaleString()}</th>
                <th class="text-end text-danger">$${totals.expenses.toLocaleString()}</th>
                <th class="text-end text-info">$${totals.profit.toLocaleString()}</th>
                <th class="text-center">${profitMargin}%</th>
            </tr>
        `;
    }
}
```

#### 2. Advanced drawCallback for Dynamic Features
```javascript
drawCallback: function(settings) {
    // 1. Reinitialize tooltips
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
        new bootstrap.Tooltip(el);
    });
    
    // 2. Apply conditional row styling
    settings.data.forEach((row, index) => {
        const tr = document.querySelector(`tr[data-index="${index}"]`);
        if (tr) {
            // Highlight overdue items
            if (new Date(row.due_date) < new Date()) {
                tr.classList.add('table-danger');
            }
            
            // Add priority indicators
            if (row.priority === 'high') {
                tr.classList.add('border-start', 'border-danger', 'border-3');
            }
        }
    });
    
    // 3. Update external components
    updateDashboardStats(settings);
    
    // 4. Initialize custom components
    initializeCustomComponents();
}
```

#### 3. Smart Selection Management
```javascript
onSelectionChange: function(selectedRows) {
    const count = selectedRows.length;
    
    // Update UI elements
    document.querySelectorAll('.selection-count').forEach(el => {
        el.textContent = count;
    });
    
    // Show/hide bulk action buttons
    const bulkActions = document.getElementById('bulk-actions');
    bulkActions.style.display = count > 0 ? 'flex' : 'none';
    
    // Enable/disable specific actions based on selection
    const deleteBtn = document.getElementById('bulk-delete');
    const exportBtn = document.getElementById('bulk-export');
    
    deleteBtn.disabled = count === 0;
    exportBtn.disabled = count === 0;
    
    // Update action button text
    if (count > 0) {
        deleteBtn.innerHTML = `<i class="fas fa-trash"></i> Delete ${count} items`;
        exportBtn.innerHTML = `<i class="fas fa-download"></i> Export ${count} items`;
    }
    
    // Calculate selection totals
    if (count > 0) {
        const total = selectedRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0);
        document.getElementById('selection-total').textContent = `$${total.toLocaleString()}`;
    }
}
```

### Event System

Selain callbacks, ModernTable.js juga mendukung event system:

```javascript
// Listen to events
table.on('dataLoaded', function(data, meta) {
    console.log('Data loaded event:', data.length, 'records');
});

table.on('selectionChange', function(selectedRows) {
    console.log('Selection change event:', selectedRows);
});

// Emit custom events
table.emit('customEvent', { message: 'Hello World' });
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
    
    initComplete: (data, meta) => {
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