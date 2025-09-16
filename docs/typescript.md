# TypeScript Support

ModernTable.js includes comprehensive TypeScript definitions for type-safe development.

## Installation

```bash
npm install modern-table-js
# TypeScript definitions are included automatically
```

## Basic Usage

```typescript
import { ModernTable, ModernTableOptions, ModernTableColumn } from 'modern-table-js';

// Define column configuration with types
const columns: ModernTableColumn[] = [
  {
    data: 'id',
    title: 'ID',
    orderable: true,
    searchable: false
  },
  {
    data: 'name',
    title: 'Name',
    render: (data: string, type: string, row: any) => {
      return `<strong>${data}</strong>`;
    }
  },
  {
    data: 'email',
    title: 'Email',
    render: (data: string) => `<a href="mailto:${data}">${data}</a>`
  }
];

// Configure table options with type safety
const options: ModernTableOptions = {
  api: '/api/users',
  columns: columns,
  serverSide: true,
  pageLength: 10,
  responsive: true,
  select: true,
  buttons: ['copy', 'csv', 'excel'],
  onDataLoaded: (data: any[], meta: any) => {
    console.log('Data loaded:', data.length, 'rows');
  }
};

// Initialize table with full type checking
const table = new ModernTable('#myTable', options);
```

## Interface Definitions

### ModernTableColumn

```typescript
interface ModernTableColumn {
  data: string;
  title?: string;
  orderable?: boolean;
  searchable?: boolean;
  className?: string;
  style?: string;
  render?: (data: any, type: string, row: any, meta: any) => string;
  headerClassName?: string;
  headerStyle?: string;
}
```

### ModernTableButton

```typescript
interface ModernTableButton {
  text?: string;
  className?: string;
  action?: (e: Event, dt: ModernTable, node: HTMLElement, config: any) => void;
  init?: (dt: ModernTable, node: HTMLElement, config: any) => void;
  destroy?: (dt: ModernTable, node: HTMLElement, config: any) => void;
  enabled?: boolean;
  attr?: Record<string, string>;
}
```

### ModernTableOptions

```typescript
interface ModernTableOptions {
  // Data source
  api?: string;
  
  // Columns
  columns: ModernTableColumn[];
  
  // Pagination
  paging?: boolean;
  pageLength?: number;
  lengthMenu?: number[];
  
  // Search & Filter
  searching?: boolean;
  searchDelay?: number;
  
  // Sorting
  ordering?: boolean;
  order?: Array<[number, 'asc' | 'desc']>;
  
  // Selection
  select?: boolean;
  selectMultiple?: boolean;
  
  // Responsive
  responsive?: boolean;
  
  // Theme
  theme?: 'light' | 'dark' | 'auto';
  
  // Buttons
  buttons?: Array<string | ModernTableButton>;
  
  // Callbacks
  onDataLoaded?: (data: any[], meta: any) => void;
  onError?: (error: Error) => void;
  onRowClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
}
```

## Advanced TypeScript Usage

### Custom Data Types

```typescript
// Define your data model
interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Type-safe column configuration
const userColumns: ModernTableColumn[] = [
  {
    data: 'id',
    title: 'ID',
    render: (data: number) => data.toString()
  },
  {
    data: 'name',
    title: 'Full Name',
    render: (data: string, type: string, row: User) => {
      return `<strong>${data}</strong>`;
    }
  },
  {
    data: 'status',
    title: 'Status',
    render: (data: User['status']) => {
      const badgeClass = data === 'active' ? 'success' : 'secondary';
      return `<span class="badge bg-${badgeClass}">${data}</span>`;
    }
  }
];

// Type-safe table initialization
const userTable = new ModernTable('#userTable', {
  api: '/api/users',
  columns: userColumns,
  onDataLoaded: (data: User[], meta: any) => {
    console.log(`Loaded ${data.length} users`);
  },
  onRowClick: (row: User, index: number) => {
    console.log(`Clicked user: ${row.name}`);
  }
});
```

### Custom Button with Types

```typescript
const customButton: ModernTableButton = {
  text: '<i class="fas fa-plus"></i> Add User',
  className: 'btn btn-success btn-sm',
  action: (e: Event, dt: ModernTable, node: HTMLElement, config: any) => {
    // Type-safe button action
    const selectedRows = dt.getSelectedRows();
    console.log('Selected rows:', selectedRows.length);
  },
  init: (dt: ModernTable, node: HTMLElement, config: any) => {
    // Button initialization
    node.setAttribute('data-toggle', 'tooltip');
    node.setAttribute('title', 'Add new user');
  }
};

const table = new ModernTable('#myTable', {
  columns: userColumns,
  buttons: [customButton, 'copy', 'csv']
});
```

### Event Handling with Types

```typescript
// Type-safe event handling
table.on('dataLoaded', (data: User[], meta: any) => {
  console.log('Data loaded:', data.length);
});

table.on('selectionChange', (selectedRows: User[]) => {
  console.log('Selection changed:', selectedRows.length);
  
  // Enable/disable bulk actions based on selection
  const bulkDeleteBtn = document.getElementById('bulk-delete');
  if (bulkDeleteBtn) {
    bulkDeleteBtn.style.display = selectedRows.length > 0 ? 'block' : 'none';
  }
});

table.on('error', (error: Error) => {
  console.error('Table error:', error.message);
});
```

## Generic Types

```typescript
// Generic table for any data type
class TypedModernTable<T> {
  private table: ModernTable;
  
  constructor(selector: string, options: ModernTableOptions) {
    this.table = new ModernTable(selector, options);
  }
  
  getSelectedRows(): T[] {
    return this.table.getSelectedRows() as T[];
  }
  
  onDataLoaded(callback: (data: T[], meta: any) => void): void {
    this.table.on('dataLoaded', callback);
  }
  
  onRowClick(callback: (row: T, index: number) => void): void {
    this.table.on('rowClick', callback);
  }
}

// Usage with specific type
const typedUserTable = new TypedModernTable<User>('#userTable', {
  api: '/api/users',
  columns: userColumns
});

typedUserTable.onDataLoaded((users: User[], meta: any) => {
  console.log('Users loaded:', users.length);
});

typedUserTable.onRowClick((user: User, index: number) => {
  console.log('Clicked user:', user.name);
});
```

## Compilation

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "ESNext",
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

## Build Integration

### Webpack

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  }
};
```

### Vite

```javascript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      formats: ['es', 'cjs']
    }
  }
});
```

The TypeScript definitions provide full IntelliSense support and compile-time type checking for all ModernTable.js features.