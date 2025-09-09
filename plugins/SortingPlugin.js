/**
 * SortingPlugin.js - Column sorting plugin for ModernTable.js
 * Sesuai master plan: plugins/SortingPlugin.js (2KB)
 */

import { find, findAll } from '../utils/dom.js';

export class SortingPlugin {
    constructor(table) {
        this.table = table;
        this.currentSort = null;
        this.init();
    }

    init() {
        // Apply default ordering from options
        if (this.table.options.order && this.table.options.order.length > 0) {
            const [columnIndex, direction] = this.table.options.order[0];
            this.currentSort = { column: columnIndex, dir: direction };
        }
        
        console.log('SortingPlugin initialized');
    }

    /**
     * Toggle column sorting
     */
    toggleSort(columnIndex) {
        const column = this.table.options.columns[columnIndex];
        if (!column || column.orderable === false) return;
        
        // Determine sort direction
        let direction = 'asc';
        if (this.currentSort && this.currentSort.column === columnIndex) {
            direction = this.currentSort.dir === 'asc' ? 'desc' : 'asc';
        }
        
        this.currentSort = { column: columnIndex, dir: direction };
        
        // Update sort icons
        this.updateSortIcons(columnIndex, direction);
        
        // Reset to first page and reload
        this.table.currentPage = 1;
        
        // Save state after sort
        if (this.table.stateManager && this.table.stateManager.isEnabled()) {
            this.table.stateManager.save();
        }
        
        this.table.loadData();
    }

    /**
     * Update sort icons
     */
    updateSortIcons(activeColumn, direction) {
        const headers = findAll('th[data-column]', this.table.thead);
        
        headers.forEach((th, index) => {
            const icon = find('.sort-icon', th);
            if (!icon) return;
            
            if (index === activeColumn) {
                icon.className = `fas fa-sort-${direction === 'asc' ? 'up' : 'down'} sort-icon`;
            } else {
                icon.className = 'fas fa-sort sort-icon';
            }
        });
    }

    /**
     * Get current sort
     */
    getCurrentSort() {
        return this.currentSort;
    }

    /**
     * Set sort programmatically (for state restoration)
     */
    setSort(columnIndex, direction) {
        if (typeof columnIndex !== 'number' || !direction) {
            console.warn('Invalid sort parameters:', columnIndex, direction);
            return;
        }
        
        const column = this.table.options.columns[columnIndex];
        if (!column || column.orderable === false) {
            console.warn('Column not sortable:', columnIndex);
            return;
        }
        
        this.currentSort = { column: columnIndex, dir: direction };
        
        // Update sort icons if table is ready
        if (this.table.thead) {
            this.updateSortIcons(columnIndex, direction);
        }
    }

    /**
     * Clear sorting
     */
    clearSort() {
        this.currentSort = null;
        
        // Reset all sort icons
        const headers = findAll('th[data-column]', this.table.thead);
        headers.forEach(th => {
            const icon = find('.sort-icon', th);
            if (icon) {
                icon.className = 'fas fa-sort sort-icon';
            }
        });
    }
}