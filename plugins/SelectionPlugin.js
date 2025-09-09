/**
 * SelectionPlugin.js - Row selection plugin for ModernTable.js
 * Sesuai master plan: plugins/SelectionPlugin.js (2KB)
 */

import { find, findAll, addClass, removeClass } from '../utils/dom.js';

export class SelectionPlugin {
    constructor(table) {
        this.table = table;
        this.selectedRows = new Set();
        this.init();
    }

    init() {
    }

    /**
     * Toggle row selection
     */
    toggleRowSelection(row) {
        const checkbox = find('.row-checkbox', row);
        if (!checkbox) return;
        
        // Don't toggle - use current state from event
        const isChecked = checkbox.checked;
        
        if (isChecked) {
            addClass(row, 'table-active');
            this.selectedRows.add(row.dataset.index);
        } else {
            removeClass(row, 'table-active');
            this.selectedRows.delete(row.dataset.index);
        }
        
        this.updateSelectAllCheckbox();
        
        // Save state after selection change
        if (this.table.stateManager && this.table.stateManager.isEnabled()) {
            this.table.stateManager.save();
        }
        
        this.emitSelectionChange();
    }

    /**
     * Toggle all selection
     */
    toggleAllSelection(checked) {
        const checkboxes = findAll('.row-checkbox', this.table.tbody);
        const rows = findAll('tr', this.table.tbody);
        
        this.selectedRows.clear();
        
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = checked;
            if (checked) {
                addClass(rows[index], 'table-active');
                this.selectedRows.add(rows[index].dataset.index);
            } else {
                removeClass(rows[index], 'table-active');
            }
        });
        
        // Save state after selection change
        if (this.table.stateManager && this.table.stateManager.isEnabled()) {
            this.table.stateManager.save();
        }
        
        this.emitSelectionChange();
    }

    /**
     * Update select all checkbox state
     */
    updateSelectAllCheckbox() {
        const selectAllCheckbox = find('.select-all-checkbox', this.table.thead);
        if (!selectAllCheckbox) return;
        
        const checkboxes = findAll('.row-checkbox', this.table.tbody);
        const checkedCount = checkboxes.filter(cb => cb.checked).length;
        
        if (checkedCount === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (checkedCount === checkboxes.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        }
    }

    /**
     * Get selected rows data
     */
    getSelectedRows() {
        const selectedData = [];
        const checkboxes = findAll('.row-checkbox', this.table.tbody);
        
        checkboxes.forEach((checkbox, index) => {
            if (checkbox.checked && this.table.data[index]) {
                selectedData.push(this.table.data[index]);
            }
        });
        
        return selectedData;
    }

    /**
     * Get selected row IDs for state saving
     */
    getSelectedRowIds() {
        const selectedRows = this.getSelectedRows();
        return selectedRows.map(row => row.id || row.DT_RowIndex);
    }

    /**
     * Restore selection from saved state
     */
    restoreSelection(selectedIds) {
        if (!selectedIds || selectedIds.length === 0) return;
        
        // Wait for data to be rendered first
        setTimeout(() => {
            const checkboxes = findAll('.row-checkbox', this.table.tbody);
            const rows = findAll('tr', this.table.tbody);
            
            this.selectedRows.clear(); // Clear existing selection
            
            checkboxes.forEach((checkbox, index) => {
                const rowData = this.table.data[index];
                const rowId = rowData?.id || rowData?.DT_RowIndex;
                
                if (selectedIds.includes(rowId)) {
                    checkbox.checked = true;
                    addClass(rows[index], 'table-active');
                    this.selectedRows.add(rows[index].dataset.index);
                }
            });
            
            this.updateSelectAllCheckbox();
            
            // Force update delete button and other UI elements
            this.emitSelectionChange();
        }, 200); // Increased delay to ensure data is fully rendered
    }

    /**
     * Clear all selections
     */
    clearSelection() {
        this.toggleAllSelection(false);
    }

    /**
     * Emit selection change event
     */
    emitSelectionChange() {
        const selectedRows = this.getSelectedRows();
        this.table.emit('selectionChange', selectedRows);
        if (this.table.options.onSelectionChange) {
            this.table.options.onSelectionChange(selectedRows);
        }
    }
}