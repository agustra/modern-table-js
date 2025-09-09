/**
 * StateManager.js - State persistence for ModernTable.js
 * Sesuai master plan: core/StateManager.js (1KB)
 */

export class StateManager {
    constructor(table) {
        this.table = table;
        // Generate unique key based on element ID or create one
        const tableId = this.table.element.id || `table_${Date.now()}`;
        this.storageKey = `modernTable_${tableId}`;
        this.duration = (this.table.options.stateDuration || 7200) * 1000; // Convert to milliseconds
    }

    /**
     * Save current table state
     */
    save() {
        if (!this.table.options.stateSave) return;

        const state = {
            page: this.table.currentPage,
            pageLength: this.table.options.pageLength,
            search: this.table.searchInput?.value?.trim() || '',
            order: this.table.plugins.sorting?.getCurrentSort() || null,
            filters: this.table.components.filterPanel?.getFilters() || {},
            columns: this.getColumnStates(),
            selection: this.table.plugins.selection?.getSelectedRowIds() || [],
            timestamp: Date.now()
        };

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
        } catch (error) {
            console.warn('Failed to save table state:', error);
        }
    }

    /**
     * Load saved table state
     */
    load() {
        if (!this.table.options.stateSave) return null;

        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return null;

            const state = JSON.parse(saved);
            
            // Check if state is expired
            if (Date.now() - state.timestamp > this.duration) {
                this.clear();
                return null;
            }

            return state;
        } catch (error) {
            console.warn('Failed to load table state:', error);
            return null;
        }
    }

    /**
     * Apply saved state to table (async with delays)
     */
    apply(state) {
        if (!state) return;

        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
            this.applyStateWhenReady(state);
        }, 100);
    }

    /**
     * Apply saved state synchronously (for initial load)
     */
    applySync(state) {
        if (!state) return;

        try {
            // Apply page length immediately
            if (state.pageLength) {
                this.table.options.pageLength = state.pageLength;
            }

            // Apply search immediately
            if (state.search) {
                // Store search term for when input is ready
                this.pendingSearch = state.search;
            }

            // Apply sorting immediately
            if (state.order) {
                // Store sort for when plugin is ready
                this.pendingSort = state.order;
            }

            // Apply filters immediately
            if (state.filters) {
                // Store filters for when FilterPanel is ready
                this.pendingFilters = state.filters;
            }

            // Apply column visibility immediately
            if (state.columns) {
                this.pendingColumns = state.columns;
            }

            // Apply selection immediately
            if (state.selection) {
                this.pendingSelection = state.selection;
            }

            // Apply page immediately
            if (state.page) {
                this.table.currentPage = state.page;
            }

            // Apply pending states after components are ready
            setTimeout(() => {
                this.applyPendingStates();
            }, 50);
        } catch (error) {
            console.warn('Error applying state sync:', error);
        }
    }

    /**
     * Apply pending states after components are initialized
     */
    applyPendingStates() {
        try {
            // Apply pending search
            if (this.pendingSearch && this.table.searchInput) {
                this.table.searchInput.value = this.pendingSearch;
                // Trigger input event to show clear button
                this.table.searchInput.dispatchEvent(new Event('input'));
                // Don't clear pendingSearch immediately, keep it for buildRequestParams
                setTimeout(() => {
                    this.pendingSearch = null;
                }, 100);
            }

            // Apply pending sort
            if (this.pendingSort && this.table.plugins?.sorting) {
                if (typeof this.table.plugins.sorting.setSort === 'function') {
                    this.table.plugins.sorting.setSort(this.pendingSort.column, this.pendingSort.dir);
                } else {
                    this.table.plugins.sorting.currentSort = this.pendingSort;
                }
                this.pendingSort = null;
            }

            // Apply length select after it's created
            if (this.table.options.pageLength && this.table.lengthSelect) {
                this.table.lengthSelect.value = this.table.options.pageLength;
            }

            // Apply pending filters using direct method
            if (this.pendingFilters && this.table.components?.filterPanel) {
                if (typeof this.table.components.filterPanel.setFilters === 'function') {
                    this.table.components.filterPanel.setFilters(this.pendingFilters);
                } else {
                    this.applyFilters(this.pendingFilters);
                }
                this.pendingFilters = null;
            }

            // Apply pending column visibility
            if (this.pendingColumns) {
                this.applyColumnStates(this.pendingColumns);
                this.pendingColumns = null;
            }

            // Apply pending selection after a longer delay to ensure data is rendered
            if (this.pendingSelection && this.table.plugins?.selection) {
                setTimeout(() => {
                    this.table.plugins.selection.restoreSelection(this.pendingSelection);
                    this.pendingSelection = null;
                }, 300);
            }
        } catch (error) {
            console.warn('Error applying pending states:', error);
        }
    }

    /**
     * Apply state when DOM elements are ready
     */
    applyStateWhenReady(state) {
        try {
            // Apply page length FIRST
            if (state.pageLength && this.table.lengthSelect) {
                this.table.lengthSelect.value = state.pageLength;
                this.table.options.pageLength = state.pageLength;
            }

            // Apply search
            if (state.search && this.table.searchInput) {
                this.table.searchInput.value = state.search;
            }

            // Apply sorting with error handling
            if (state.order && this.table.plugins?.sorting) {
                if (typeof this.table.plugins.sorting.setSort === 'function') {
                    this.table.plugins.sorting.setSort(state.order.column, state.order.dir);
                } else {
                    // Fallback: set currentSort directly
                    this.table.plugins.sorting.currentSort = state.order;
                }
            }

            // Apply filters with delay for FilterPanel
            if (state.filters && this.table.components?.filterPanel) {
                setTimeout(() => {
                    this.applyFilters(state.filters);
                }, 200);
            }

            // Apply column states
            if (state.columns) {
                this.applyColumnStates(state.columns);
            }

            // Apply page (after other states)
            if (state.page) {
                this.table.currentPage = state.page;
            }
        } catch (error) {
            console.warn('Error applying state:', error);
        }
    }

    /**
     * Get current column states
     */
    getColumnStates() {
        // Use columnVisibility state if available, otherwise check DOM
        if (this.table.columnVisibility) {
            return Object.keys(this.table.columnVisibility).map(index => ({
                index: parseInt(index),
                visible: this.table.columnVisibility[index] !== false
            }));
        }
        
        // Fallback to DOM inspection
        const states = [];
        const headers = this.table.thead?.querySelectorAll('th[data-column]') || [];
        
        headers.forEach((th, index) => {
            states.push({
                index: index,
                visible: getComputedStyle(th).display !== 'none'
            });
        });

        return states;
    }

    /**
     * Apply column states
     */
    applyColumnStates(states) {
        try {
            // Initialize columnVisibility if not exists
            if (!this.table.columnVisibility) {
                this.table.columnVisibility = {};
                // Initialize all columns as visible first
                this.table.options.columns.forEach((column, index) => {
                    this.table.columnVisibility[index] = true;
                });
            }
            
            states.forEach(state => {
                const columnIndex = state.index;
                if (typeof columnIndex === 'number' && typeof state.visible === 'boolean') {
                    this.table.columnVisibility[columnIndex] = state.visible;
                    this.table.applyColumnVisibility(columnIndex, state.visible);
                }
            });
        } catch (error) {
            console.warn('Error applying column states:', error);
        }
    }

    /**
     * Apply filters from state
     */
    applyFilters(filters) {
        try {
            // Try immediate application first
            const filterInputs = this.table.wrapper?.querySelectorAll('[data-filter]') || [];
            
            if (filterInputs.length > 0) {
                // Filters are ready, apply immediately
                filterInputs.forEach(input => {
                    const filterKey = input.dataset.filter;
                    if (filters[filterKey]) {
                        input.value = filters[filterKey];
                        // Trigger change event to update filter state
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
            } else {
                // Filters not ready, use retry mechanism with shorter delays
                const maxRetries = 3;
                let retries = 0;
                
                const tryApplyFilters = () => {
                    const filterInputs = this.table.wrapper?.querySelectorAll('[data-filter]') || [];
                    
                    if (filterInputs.length === 0 && retries < maxRetries) {
                        retries++;
                        setTimeout(tryApplyFilters, 50); // Reduced from 100ms to 50ms
                        return;
                    }
                    
                    if (filterInputs.length > 0) {
                        filterInputs.forEach(input => {
                            const filterKey = input.dataset.filter;
                            if (filters[filterKey]) {
                                input.value = filters[filterKey];
                                // Trigger change event to update filter state
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        });
                    }
                };
                
                tryApplyFilters();
            }
        } catch (error) {
            console.warn('Error applying filters:', error);
        }
    }

    /**
     * Clear saved state
     */
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
        } catch (error) {
            console.warn('Failed to clear table state:', error);
        }
    }

    /**
     * Check if state saving is enabled
     */
    isEnabled() {
        return this.table.options.stateSave === true;
    }
}