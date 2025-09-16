# State Management

Complete guide for state persistence in ModernTable.js.

## Enable State Management

```javascript
const table = new ModernTable('#myTable', {
  stateSave: true,
  stateDuration: 3600, // 1 hour in seconds (default: 7200 = 2 hours)
  columns: [...],
  // ... other options
});
```

## What Gets Saved

ModernTable automatically saves and restores:

- **Current page** - Page number
- **Page length** - Rows per page setting
- **Search term** - Global search value
- **Column sorting** - Sort column and direction
- **Column visibility** - Hidden/shown columns
- **Filters** - All filter panel values
- **Selection** - Selected row IDs (if applicable)

## State Storage

States are stored in `localStorage` with automatic expiration:

```javascript
// Storage key format: modernTable_{tableId}
// Example: modernTable_userTable_1703123456789

// State structure:
{
  page: 2,
  pageLength: 25,
  search: "john",
  order: { column: 1, dir: "asc" },
  filters: { status: "active", date: "2024-01-01" },
  columns: [
    { index: 0, visible: true },
    { index: 1, visible: false }
  ],
  selection: [1, 5, 10],
  timestamp: 1703123456789
}
```

## Custom State Callbacks

### Custom State Loading

```javascript
const table = new ModernTable('#myTable', {
  stateSave: true,
  
  // Custom state loading
  stateLoadCallback: function(settings) {
    // Load from custom storage (e.g., server, sessionStorage)
    const customState = JSON.parse(sessionStorage.getItem('myCustomState'));
    
    if (customState) {
      // Modify state before applying
      customState.page = 1; // Always start from page 1
      delete customState.search; // Don't restore search
      return customState;
    }
    
    return null; // Use default localStorage
  }
});
```

### Custom State Saving

```javascript
const table = new ModernTable('#myTable', {
  stateSave: true,
  
  // Custom state saving
  stateSaveCallback: function(settings, data) {
    // Add custom metadata
    const enhancedState = {
      ...data,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      userId: getCurrentUserId(),
      tableVersion: '1.0.7'
    };
    
    // Save to custom storage
    sessionStorage.setItem('myCustomState', JSON.stringify(enhancedState));
    
    // Also save to server
    fetch('/api/save-table-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enhancedState)
    });
  }
});
```

## Programmatic State Control

```javascript
// Save current state manually
table.saveState();

// Load saved state
table.loadSavedState();

// Clear saved state
table.clearState();

// Get current state object
const currentState = table.stateManager.getState();

// Check if state saving is enabled
if (table.stateManager.isEnabled()) {
  console.log('State management is active');
}
```

## State Events

```javascript
// Listen for state changes
table.on('stateSave', function(state) {
  console.log('State saved:', state);
});

table.on('stateLoad', function(state) {
  console.log('State loaded:', state);
});

// Custom state validation
table.on('stateLoadPre', function(state) {
  // Validate and modify state before applying
  if (state.page > 100) {
    state.page = 1; // Reset invalid page
  }
  
  // Remove expired filters
  if (state.filters && state.filters.date) {
    const filterDate = new Date(state.filters.date);
    const daysDiff = (new Date() - filterDate) / (1000 * 60 * 60 * 24);
    if (daysDiff > 30) {
      delete state.filters.date;
    }
  }
  
  return state;
});
```

## Server-side State Storage

### Save to Database

```javascript
const table = new ModernTable('#myTable', {
  stateSave: true,
  
  stateSaveCallback: async function(settings, data) {
    try {
      await fetch('/api/table-states', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: JSON.stringify({
          table_id: 'userTable',
          user_id: getCurrentUserId(),
          state_data: data
        })
      });
    } catch (error) {
      console.error('Failed to save state to server:', error);
      // Fallback to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
  },
  
  stateLoadCallback: async function(settings) {
    try {
      const response = await fetch(`/api/table-states/userTable/${getCurrentUserId()}`);
      if (response.ok) {
        const result = await response.json();
        return result.state_data;
      }
    } catch (error) {
      console.error('Failed to load state from server:', error);
    }
    
    // Fallback to localStorage
    const saved = localStorage.getItem(this.storageKey);
    return saved ? JSON.parse(saved) : null;
  }
});
```

### Laravel Backend Example

```php
// Migration
Schema::create('table_states', function (Blueprint $table) {
    $table->id();
    $table->string('table_id');
    $table->unsignedBigInteger('user_id');
    $table->json('state_data');
    $table->timestamps();
    
    $table->unique(['table_id', 'user_id']);
    $table->foreign('user_id')->references('id')->on('users');
});

// Controller
class TableStateController extends Controller
{
    public function save(Request $request)
    {
        $request->validate([
            'table_id' => 'required|string',
            'user_id' => 'required|integer',
            'state_data' => 'required|array'
        ]);
        
        TableState::updateOrCreate(
            [
                'table_id' => $request->table_id,
                'user_id' => $request->user_id
            ],
            [
                'state_data' => $request->state_data
            ]
        );
        
        return response()->json(['success' => true]);
    }
    
    public function load($tableId, $userId)
    {
        $state = TableState::where('table_id', $tableId)
                          ->where('user_id', $userId)
                          ->first();
        
        if ($state) {
            return response()->json(['state_data' => $state->state_data]);
        }
        
        return response()->json(['state_data' => null]);
    }
}
```

## State Migration

Handle state format changes between versions:

```javascript
const table = new ModernTable('#myTable', {
  stateSave: true,
  
  stateLoadCallback: function(settings) {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) return null;
    
    let state = JSON.parse(saved);
    
    // Migrate old state format
    if (!state.version) {
      // Version 1.0.7 migration example
      if (state.columnVisibility) {
        // Convert old columnVisibility format
        state.columns = Object.keys(state.columnVisibility).map(index => ({
          index: parseInt(index),
          visible: state.columnVisibility[index]
        }));
        delete state.columnVisibility;
      }
      
      state.version = '1.0.7';
      
      // Save migrated state
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    }
    
    return state;
  }
});
```

## Selective State Saving

Save only specific state components:

```javascript
const table = new ModernTable('#myTable', {
  stateSave: true,
  
  stateSaveCallback: function(settings, data) {
    // Create selective state (exclude sensitive data)
    const selectiveState = {
      page: data.page,
      pageLength: data.pageLength,
      columns: data.columns,
      // Exclude: search, filters, selection
      timestamp: data.timestamp
    };
    
    localStorage.setItem(this.storageKey, JSON.stringify(selectiveState));
  }
});
```

## State Debugging

```javascript
const table = new ModernTable('#myTable', {
  stateSave: true,
  
  stateSaveCallback: function(settings, data) {
    console.group('🔄 State Save');
    console.log('📊 State data:', data);
    console.log('💾 Storage key:', this.storageKey);
    console.log('⏰ Timestamp:', new Date(data.timestamp).toLocaleString());
    console.groupEnd();
    
    // Default save
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  },
  
  stateLoadCallback: function(settings) {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const state = JSON.parse(saved);
      console.group('📥 State Load');
      console.log('📊 Loaded state:', state);
      console.log('⏰ Saved at:', new Date(state.timestamp).toLocaleString());
      console.log('🕐 Age:', Math.round((Date.now() - state.timestamp) / 1000), 'seconds');
      console.groupEnd();
      return state;
    }
    return null;
  }
});
```

## State Validation

```javascript
function validateTableState(state) {
  if (!state || typeof state !== 'object') return false;
  
  // Validate page
  if (state.page && (state.page < 1 || state.page > 1000)) {
    state.page = 1;
  }
  
  // Validate pageLength
  const validLengths = [5, 10, 25, 50, 100];
  if (state.pageLength && !validLengths.includes(state.pageLength)) {
    state.pageLength = 10;
  }
  
  // Validate search
  if (state.search && typeof state.search !== 'string') {
    delete state.search;
  }
  
  // Validate columns
  if (state.columns && !Array.isArray(state.columns)) {
    delete state.columns;
  }
  
  // Validate timestamp
  if (!state.timestamp || Date.now() - state.timestamp > 7200000) { // 2 hours
    return false; // Expired
  }
  
  return true;
}

const table = new ModernTable('#myTable', {
  stateSave: true,
  
  stateLoadCallback: function(settings) {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      const state = JSON.parse(saved);
      if (validateTableState(state)) {
        return state;
      } else {
        // Clear invalid state
        localStorage.removeItem(this.storageKey);
      }
    }
    return null;
  }
});
```

## Multi-user State Management

```javascript
// User-specific state keys
function getUserStateKey(tableId, userId) {
  return `modernTable_${tableId}_user_${userId}`;
}

const table = new ModernTable('#myTable', {
  stateSave: true,
  
  stateSaveCallback: function(settings, data) {
    const userId = getCurrentUserId();
    const userKey = getUserStateKey('myTable', userId);
    
    // Save user-specific state
    localStorage.setItem(userKey, JSON.stringify(data));
    
    // Also save global state (for shared preferences)
    const globalState = {
      columns: data.columns, // Share column visibility
      pageLength: data.pageLength // Share page length preference
    };
    localStorage.setItem('modernTable_myTable_global', JSON.stringify(globalState));
  },
  
  stateLoadCallback: function(settings) {
    const userId = getCurrentUserId();
    const userKey = getUserStateKey('myTable', userId);
    
    // Load user-specific state first
    let state = null;
    const userState = localStorage.getItem(userKey);
    if (userState) {
      state = JSON.parse(userState);
    } else {
      // Fallback to global state for new users
      const globalState = localStorage.getItem('modernTable_myTable_global');
      if (globalState) {
        state = JSON.parse(globalState);
      }
    }
    
    return state;
  }
});
```

## Best Practices

1. **Set appropriate duration** - Balance between convenience and storage
2. **Validate loaded state** - Prevent errors from corrupted data
3. **Handle migration** - Support state format changes
4. **Use selective saving** - Don't save sensitive information
5. **Implement fallbacks** - Handle storage failures gracefully
6. **Monitor storage usage** - Clean up old states periodically
7. **Consider user privacy** - Allow users to disable state saving
8. **Test edge cases** - Invalid states, storage limits, etc.