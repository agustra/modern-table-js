/**
 * KeyboardPlugin.js - Keyboard Navigation & Shortcuts
 */

export class KeyboardPlugin {
    constructor(table) {
        this.table = table;
        this.focusedRow = -1;
        this.init();
    }

    init() {
        this.setupKeyboardListeners();
        this.setupFocusManagement();
    }

    setupKeyboardListeners() {
        // Listen for keyboard events on table wrapper
        this.table.wrapper.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });

        // Make table wrapper focusable
        this.table.wrapper.setAttribute('tabindex', '0');
        this.table.wrapper.style.outline = 'none';
    }

    handleKeyDown(event) {
        const { key, ctrlKey, metaKey, shiftKey } = event;
        const isModifier = ctrlKey || metaKey;

        switch (key) {
            case 'ArrowUp':
                event.preventDefault();
                this.navigateRow(-1, shiftKey);
                break;
                
            case 'ArrowDown':
                event.preventDefault();
                this.navigateRow(1, shiftKey);
                break;
                
            case 'Home':
                event.preventDefault();
                this.navigateToFirst(shiftKey);
                break;
                
            case 'End':
                event.preventDefault();
                this.navigateToLast(shiftKey);
                break;
                
            case 'PageUp':
                event.preventDefault();
                this.navigatePage(-1);
                break;
                
            case 'PageDown':
                event.preventDefault();
                this.navigatePage(1);
                break;
                
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.toggleRowSelection();
                break;
                
            case 'Escape':
                event.preventDefault();
                this.clearSelection();
                break;
                
            // Shortcuts with Ctrl/Cmd
            case 'a':
                if (isModifier) {
                    event.preventDefault();
                    this.selectAll();
                }
                break;
                
            case 'c':
                if (isModifier) {
                    event.preventDefault();
                    this.copySelected();
                }
                break;
                
            case 'f':
                if (isModifier) {
                    event.preventDefault();
                    this.focusSearch();
                }
                break;
                
            case 'r':
                if (isModifier) {
                    event.preventDefault();
                    this.table.reload();
                }
                break;
                
            case 'h':
                if (isModifier) {
                    event.preventDefault();
                    if (typeof showKeyboardShortcuts === 'function') {
                        showKeyboardShortcuts();
                    }
                }
                break;
                
            case 'd':
                if (isModifier) {
                    event.preventDefault();
                    this.deleteBulk();
                }
                break;
        }
    }

    navigateRow(direction, extend = false) {
        const rows = this.getVisibleRows();
        if (rows.length === 0) return;

        const newIndex = Math.max(0, Math.min(rows.length - 1, this.focusedRow + direction));
        
        if (newIndex !== this.focusedRow) {
            this.setFocusedRow(newIndex, extend);
        }
    }

    navigateToFirst(extend = false) {
        const rows = this.getVisibleRows();
        if (rows.length > 0) {
            this.setFocusedRow(0, extend);
        }
    }

    navigateToLast(extend = false) {
        const rows = this.getVisibleRows();
        if (rows.length > 0) {
            this.setFocusedRow(rows.length - 1, extend);
        }
    }

    navigatePage(direction) {
        const pageSize = this.table.options.pageLength || 10;
        const newRow = this.focusedRow + (direction * pageSize);
        const rows = this.getVisibleRows();
        
        if (newRow < 0) {
            // Go to previous page
            if (this.table.currentPage > 1) {
                this.table.page(this.table.currentPage - 1);
                setTimeout(() => this.setFocusedRow(this.getVisibleRows().length - 1), 100);
            }
        } else if (newRow >= rows.length) {
            // Go to next page
            if (this.table.hasNextPage) {
                this.table.page(this.table.currentPage + 1);
                setTimeout(() => this.setFocusedRow(0), 100);
            }
        } else {
            this.setFocusedRow(newRow);
        }
    }

    setFocusedRow(index, extend = false) {
        const rows = this.getVisibleRows();
        if (index < 0 || index >= rows.length) return;

        // Remove previous focus
        this.clearRowFocus();

        // Set new focus
        this.focusedRow = index;
        const row = rows[index];
        row.classList.add('keyboard-focused');
        
        // Scroll into view if needed
        row.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

        // Handle selection
        if (extend && this.table.options.select) {
            this.extendSelection(index);
        }
    }

    clearRowFocus() {
        const focusedRows = this.table.tbody.querySelectorAll('.keyboard-focused');
        focusedRows.forEach(row => row.classList.remove('keyboard-focused'));
    }

    toggleRowSelection() {
        if (this.focusedRow >= 0 && this.table.plugins.selection) {
            const rows = this.getVisibleRows();
            const row = rows[this.focusedRow];
            const checkbox = row.querySelector('.row-checkbox');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                // Trigger change event to update selection
                checkbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    selectAll() {
        if (this.table.plugins.selection) {
            this.table.plugins.selection.toggleAllSelection(true);
        }
    }

    clearSelection() {
        if (this.table.plugins.selection) {
            this.table.plugins.selection.clearSelection();
        }
        this.clearRowFocus();
        this.focusedRow = -1;
    }

    copySelected() {
        if (this.table.plugins.export) {
            this.table.plugins.export.copyToClipboard();
        }
    }

    focusSearch() {
        const searchInput = this.table.wrapper.querySelector('.modern-table-search input');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }

    extendSelection(toIndex) {
        // Implementation for shift+click selection
        if (this.table.plugins.selection) {
            this.table.plugins.selection.extendSelection(this.focusedRow, toIndex);
        }
    }

    getVisibleRows() {
        return Array.from(this.table.tbody.querySelectorAll('tr:not(.dtr-details)'));
    }
    
    deleteBulk() {
        const selected = this.table.getSelectedRows();
        if (selected.length > 0) {
            const deleteBtn = document.getElementById('delete-selected-btn');
            if (deleteBtn && !deleteBtn.disabled) {
                deleteBtn.click(); // Trigger existing delete button action
            }
        }
    }

    setupFocusManagement() {
        // Handle focus events
        this.table.wrapper.addEventListener('focus', () => {
            if (this.focusedRow === -1 && this.getVisibleRows().length > 0) {
                this.setFocusedRow(0);
            }
        });

        this.table.wrapper.addEventListener('blur', () => {
            this.clearRowFocus();
        });
    }

    destroy() {
        this.clearRowFocus();
        this.table.wrapper.removeAttribute('tabindex');
    }
}