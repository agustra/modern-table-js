# Events & Callbacks

Complete guide for event handling and callbacks in ModernTable.js.

## DataTables Compatible Callbacks

ModernTable.js supports all major DataTables callbacks with the same syntax:

```javascript
const table = new ModernTable('#myTable', {
  // Called after table initialization
  initComplete: function(data, meta) {
    console.log('Table initialized with:', data.length, 'rows');
    console.log('Meta info:', meta);
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
    
    // Example: Initialize Bootstrap tooltips
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
    
    // Add custom event listeners
    row.addEventListener('dblclick', () => {
      editUser(data.id);
    });
  },

  // Called for each row during rendering
  rowCallback: function(row, data, index) {
    // Apply conditional styling, modify row content
    if (data.status === 'inactive') {
      row.classList.add('table-warning');
    }
    
    if (data.priority === 'high') {
      row.style.fontWeight = 'bold';
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
        <span>Showing ${start} to ${end} of ${total} entries</span>
        <span class="badge bg-info">${percentage}% displayed</span>
      </div>
    `;
  },

  // Custom state loading (override built-in)
  stateLoadCallback: function(settings) {
    const state = JSON.parse(localStorage.getItem('customTableState'));
    if (state) {
      // Example: Always reset page to 1
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
  }
});
```

## ModernTable Specific Callbacks

```javascript
const table = new ModernTable('#myTable', {
  // Row click handler
  onRowClick: function(rowData, index, event) {
    console.log('Row clicked:', rowData);
    console.log('Row index:', index);
    console.log('Click event:', event);
    
    // Example: Navigate to detail page
    if (event.ctrlKey) {
      window.open(`/users/${rowData.id}`, '_blank');
    } else {
      window.location.href = `/users/${rowData.id}`;
    }
  },

  // Selection change handler
  onSelectionChange: function(selectedRows) {
    console.log('Selection changed:', selectedRows.length, 'rows');
    
    // Update bulk action buttons
    const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
    if (bulkDeleteBtn) {
      bulkDeleteBtn.disabled = selectedRows.length === 0;
      bulkDeleteBtn.querySelector('.count').textContent = selectedRows.length;
    }
  },

  // Error handler
  onError: function(error) {
    console.error('Table error:', error);
    
    // Show user-friendly error message
    showNotification('Failed to load data: ' + error.message, 'error');
  },

  // Data loaded handler
  onDataLoaded: function(data, meta) {
    console.log('Data loaded:', data.length, 'rows');
    console.log('Meta:', meta);
    
    // Update dashboard stats
    updateDashboardStats(meta);
  }
});
```

## Event System

ModernTable uses an event system for loose coupling:

```javascript
// Listen to events
table.on('dataLoaded', function(data, meta) {
  console.log('Data loaded event:', data.length, 'rows');
});

table.on('selectionChange', function(selectedRows) {
  console.log('Selection change event:', selectedRows.length);
});

table.on('error', function(error) {
  console.error('Error event:', error);
});

table.on('stateChange', function(state) {
  console.log('State changed:', state);
});

// Custom events
table.on('customEvent', function(customData) {
  console.log('Custom event received:', customData);
});

// Emit custom events
table.emit('customEvent', { message: 'Hello World' });
```

## Callback Execution Order

Understanding the callback execution order helps with proper event handling:

```javascript
// 1. INITIALIZATION PHASE
// - Constructor
// - initComplete callback

// 2. DATA LOADING PHASE  
// - API request
// - onDataLoaded callback
// - preDrawCallback

// 3. RENDERING PHASE
// - createdRow callback (for each row)
// - rowCallback callback (for each row)
// - headerCallback
// - footerCallback
// - drawCallback

// 4. USER INTERACTION PHASE
// - onRowClick
// - onSelectionChange
// - Custom event handlers

// 5. STATE MANAGEMENT PHASE
// - stateSaveCallback
// - stateLoadCallback
```

## Advanced Event Handling

### Conditional Callbacks

```javascript
const table = new ModernTable('#myTable', {
  rowCallback: function(row, data, index) {
    // Conditional styling based on user permissions
    if (userPermissions.includes('view_sensitive_data')) {
      // Show sensitive data
      const sensitiveCell = row.querySelector('.sensitive-data');
      if (sensitiveCell) {
        sensitiveCell.style.display = 'block';
      }
    }
    
    // Conditional row actions
    if (data.status === 'locked' && !userPermissions.includes('unlock_users')) {
      row.classList.add('disabled-row');
      row.style.pointerEvents = 'none';
    }
  },

  onRowClick: function(rowData, index, event) {
    // Conditional click handling
    if (rowData.status === 'locked') {
      event.preventDefault();
      showNotification('This user is locked', 'warning');
      return false;
    }
    
    // Role-based navigation
    if (userRole === 'admin') {
      showUserAdminPanel(rowData.id);
    } else {
      showUserProfile(rowData.id);
    }
  }
});
```

### Async Callbacks

```javascript
const table = new ModernTable('#myTable', {
  drawCallback: async function(settings) {
    // Async operations after table draw
    try {
      // Load additional data
      const additionalData = await fetch('/api/user-stats');
      const stats = await additionalData.json();
      
      // Update UI with additional data
      updateUserStats(stats);
      
      // Initialize async components
      await initializeAsyncComponents();
      
    } catch (error) {
      console.error('Async callback error:', error);
    }
  },

  onDataLoaded: async function(data, meta) {
    // Process data asynchronously
    const processedData = await processDataInBackground(data);
    
    // Update cache
    await updateDataCache(processedData);
    
    // Trigger analytics
    trackTableView(meta);
  }
});
```

### Event Delegation

```javascript
const table = new ModernTable('#myTable', {
  createdRow: function(row, data, dataIndex) {
    // Use event delegation instead of individual listeners
    row.setAttribute('data-row-id', data.id);
    row.setAttribute('data-row-index', dataIndex);
  }
});

// Single event listener for all rows
table.tbody.addEventListener('click', function(event) {
  const row = event.target.closest('tr');
  if (!row) return;
  
  const rowId = row.getAttribute('data-row-id');
  const rowIndex = row.getAttribute('data-row-index');
  
  if (event.target.classList.contains('edit-btn')) {
    editUser(rowId);
  } else if (event.target.classList.contains('delete-btn')) {
    deleteUser(rowId);
  } else {
    // Row click
    viewUser(rowId);
  }
});
```

## Performance Optimization

### Debounced Callbacks

```javascript
// Debounce expensive operations
const debouncedUpdateStats = debounce(updateDashboardStats, 300);

const table = new ModernTable('#myTable', {
  drawCallback: function(settings) {
    // Expensive operation - debounced
    debouncedUpdateStats(settings.data);
    
    // Cheap operations - immediate
    updateRowCount(settings.data.length);
  }
});
```

### Conditional Execution

```javascript
const table = new ModernTable('#myTable', {
  rowCallback: function(row, data, index) {
    // Only execute expensive operations when needed
    if (data.needsSpecialProcessing) {
      performExpensiveOperation(row, data);
    }
    
    // Cache DOM queries
    if (!this._cachedElements) {
      this._cachedElements = {
        statusCells: row.querySelectorAll('.status-cell'),
        actionButtons: row.querySelectorAll('.action-btn')
      };
    }
  }
});
```

## Error Handling in Callbacks

```javascript
const table = new ModernTable('#myTable', {
  drawCallback: function(settings) {
    try {
      // Risky operations
      initializeTooltips();
      updateCharts(settings.data);
      processComplexData(settings.data);
      
    } catch (error) {
      console.error('DrawCallback error:', error);
      
      // Graceful degradation
      showFallbackUI();
      
      // Report error
      reportError('drawCallback', error);
    }
  },

  onError: function(error) {
    // Centralized error handling
    console.error('Table error:', error);
    
    // User notification
    showNotification('Something went wrong. Please refresh the page.', 'error');
    
    // Error reporting
    if (window.errorReporting) {
      window.errorReporting.captureException(error);
    }
    
    // Fallback behavior
    if (error.type === 'network') {
      enableOfflineMode();
    }
  }
});
```

## Complete Example

```javascript
const table = new ModernTable('#userTable', {
  api: '/api/users',
  columns: [...],
  
  // Initialization
  initComplete: function(data, meta) {
    console.log('✅ Table initialized');
    showNotification('Table loaded successfully', 'success');
    
    // Initialize additional features
    initializeUserActions();
    setupKeyboardShortcuts();
  },

  // Data processing
  preDrawCallback: function(settings) {
    // Validate data before rendering
    if (!settings.data || settings.data.length === 0) {
      showEmptyState();
      return false; // Cancel rendering
    }
    
    // Show loading for large datasets
    if (settings.data.length > 100) {
      showLoadingSpinner();
    }
    
    return true;
  },

  // Row creation
  createdRow: function(row, data, dataIndex) {
    // Add metadata
    row.setAttribute('data-user-id', data.id);
    row.setAttribute('data-user-role', data.role);
    
    // Add CSS classes
    if (data.is_online) {
      row.classList.add('user-online');
    }
    
    if (data.role === 'admin') {
      row.classList.add('admin-user');
    }
  },

  // Row styling
  rowCallback: function(row, data, index) {
    // Conditional styling
    if (data.status === 'suspended') {
      row.classList.add('table-danger');
      row.title = 'This user is suspended';
    }
    
    if (data.last_login) {
      const daysSinceLogin = (new Date() - new Date(data.last_login)) / (1000 * 60 * 60 * 24);
      if (daysSinceLogin > 30) {
        row.classList.add('inactive-user');
      }
    }
  },

  // Post-render
  drawCallback: function(settings) {
    console.log('🎨 Table rendered');
    
    // Initialize UI components
    initializeTooltips();
    initializePopovers();
    
    // Update counters
    updateUserCounters(settings.data);
    
    // Hide loading
    hideLoadingSpinner();
  },

  // Header updates
  headerCallback: function(thead, data, start, end, display) {
    // Update column headers with stats
    const statusHeader = thead.querySelector('[data-column="status"]');
    if (statusHeader) {
      const activeCount = data.filter(u => u.status === 'active').length;
      statusHeader.title = `${activeCount}/${data.length} active users`;
    }
  },

  // Custom info
  infoCallback: function(settings, start, end, max, total, pre) {
    const activeUsers = settings.data.filter(u => u.status === 'active').length;
    const percentage = Math.round((activeUsers / total) * 100);
    
    return `
      <div class="d-flex justify-content-between align-items-center">
        <span>Showing ${start} to ${end} of ${total} users</span>
        <div>
          <span class="badge bg-success me-1">${activeUsers} active</span>
          <span class="badge bg-secondary">${percentage}% active rate</span>
        </div>
      </div>
    `;
  },

  // User interactions
  onRowClick: function(rowData, index, event) {
    // Prevent default for certain elements
    if (event.target.closest('.btn, .form-check-input')) {
      return;
    }
    
    console.log('👆 User clicked:', rowData.name);
    
    // Navigate based on permissions
    if (canViewUserDetails(rowData.id)) {
      showUserModal(rowData);
    } else {
      showNotification('Access denied', 'warning');
    }
  },

  onSelectionChange: function(selectedRows) {
    console.log('✅ Selection changed:', selectedRows.length);
    
    // Update bulk action buttons
    updateBulkActionButtons(selectedRows);
    
    // Update selection counter
    updateSelectionCounter(selectedRows.length);
    
    // Enable/disable actions based on selection
    toggleBulkActions(selectedRows.length > 0);
  },

  // Error handling
  onError: function(error) {
    console.error('❌ Table error:', error);
    
    // Show user-friendly message
    showErrorNotification(error);
    
    // Report to monitoring service
    reportTableError(error);
  },

  // State management
  stateSaveCallback: function(settings, data) {
    // Add user context to state
    const enhancedState = {
      ...data,
      userId: getCurrentUserId(),
      timestamp: Date.now(),
      version: '1.0.10'
    };
    
    // Save to localStorage
    localStorage.setItem('userTableState', JSON.stringify(enhancedState));
    
    console.log('💾 State saved');
  }
});

// Additional event listeners
table.on('dataLoaded', function(data, meta) {
  console.log('📊 Data loaded:', data.length, 'users');
  updateDashboard(meta);
});

table.on('stateChange', function(state) {
  console.log('🔄 State changed:', state);
  trackUserBehavior('table_state_change', state);
});
```

## Best Practices

1. **Keep callbacks lightweight** - Avoid heavy computations
2. **Handle errors gracefully** - Use try-catch blocks
3. **Use event delegation** - Better performance for many rows
4. **Debounce expensive operations** - Prevent performance issues
5. **Validate data** - Check data integrity in callbacks
6. **Provide user feedback** - Show loading states and notifications
7. **Clean up resources** - Remove event listeners when needed
8. **Test edge cases** - Empty data, network errors, etc.