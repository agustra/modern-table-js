# ⚡ ModernTable.js - Quick Start Guide

Get up and running with ModernTable.js in 5 minutes!

## 🚀 Installation

### Option 1: Local Files
```html
<!-- CSS -->
<link href="/css/modern-table.css" rel="stylesheet">

<!-- JavaScript -->
<script type="module">
    import { ModernTable } from '/js/core/ModernTable.js';
    // Your code here
</script>
```

### Option 2: CDN
```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.5/modern-table.css" rel="stylesheet">

<!-- JavaScript -->
<script type="module" src="https://cdn.jsdelivr.net/npm/modern-table-js@1.0.5/core/ModernTable.js"></script>
```

## 📋 Basic Example

### 1. HTML
```html
<table id="myTable" class="table table-striped"></table>
```

### 2. JavaScript
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

### 3. Laravel API
```php
// routes/api.php
Route::get('/users', function (Request $request) {
    $draw = (int) $request->input('draw', 1);
    $start = (int) $request->input('start', 0);
    $length = (int) $request->input('length', 10);
    $searchTerm = $request->input('search.value', '');
    
    $query = User::query();
    
    if (!empty($searchTerm)) {
        $query->where('name', 'like', '%' . $searchTerm . '%');
    }
    
    $total = User::count();
    $filtered = $query->count();
    $users = $query->skip($start)->take($length)->get();
    
    return response()->json([
        'draw' => $draw,
        'recordsTotal' => $total,
        'recordsFiltered' => $filtered,
        'data' => $users
    ]);
});
```

## 🎯 Common Configurations

### With All Features
```javascript
const table = new ModernTable('#myTable', {
    api: '/api/users',
    columns: [
        { data: 'id', title: 'ID' },
        { data: 'name', title: 'Name' },
        { data: 'email', title: 'Email' },
        { 
            data: 'status', 
            title: 'Status',
            render: (data) => `<span class="badge bg-${data === 'active' ? 'success' : 'danger'}">${data}</span>`
        }
    ],
    
    // Features
    pageLength: 10,
    searching: true,
    ordering: true,
    select: true,
    responsive: true,
    
    // UI
    theme: 'auto',
    buttons: ['copy', 'csv', 'excel'],
    
    // State
    stateSave: true
});
```

### With Filters
```javascript
const table = new ModernTable('#myTable', {
    api: '/api/users',
    columns: [...],
    
    filters: [
        {
            column: 'status',
            type: 'select',
            options: [
                { value: '', text: 'All Status' },
                { value: 'active', text: 'Active' },
                { value: 'inactive', text: 'Inactive' }
            ]
        }
    ]
});
```

## 🔧 Laravel Controller Template

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
        // DataTables parameters
        $draw = (int) $request->input('draw', 1);
        $start = (int) $request->input('start', 0);
        $length = (int) $request->input('length', 10);
        $searchTerm = $request->input('search.value', '');
        
        $query = User::query();
        
        // Search
        if (!empty($searchTerm)) {
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('email', 'like', '%' . $searchTerm . '%');
            });
        }
        
        // Filters
        if ($request->filled('filters')) {
            $filters = $request->filters;
            
            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
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
        
        // Get data
        $total = User::count();
        $filtered = $query->count();
        $users = $query->skip($start)->take($length)->get();
        
        return response()->json([
            'draw' => $draw,
            'recordsTotal' => $total,
            'recordsFiltered' => $filtered,
            'data' => $users
        ]);
    }
}
```

## 🎉 You're Ready!

That's it! Your ModernTable is now ready with:
- ✅ Server-side processing
- ✅ Search functionality  
- ✅ Sorting
- ✅ Pagination
- ✅ Responsive design

## 📚 Next Steps

- 📖 Read the [Full Features Guide](./FULL-FEATURES-GUIDE.md)
- 🔧 Check out [Advanced Examples](./examples/)
- 🎨 Customize [Themes](./themes/)
- 🔌 Explore [Plugins](./plugins/)

**Happy coding! 🚀**