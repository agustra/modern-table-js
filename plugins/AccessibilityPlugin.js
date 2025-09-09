/**
 * AccessibilityPlugin.js - ARIA Labels & Screen Reader Support
 */

export class AccessibilityPlugin {
    constructor(table) {
        this.table = table;
        this.init();
    }

    init() {
        this.setupTableAccessibility();
        this.setupHeaderAccessibility();
        this.setupRowAccessibility();
        this.setupControlsAccessibility();
        this.setupLiveRegions();
    }

    setupTableAccessibility() {
        const table = this.table.element;
        
        // Main table attributes
        table.setAttribute('role', 'table');
        table.setAttribute('aria-label', 'Data table with sorting, filtering, and pagination');
        table.setAttribute('aria-describedby', 'table-description');
        
        // Add table description
        const description = document.createElement('div');
        description.id = 'table-description';
        description.className = 'sr-only';
        description.textContent = 'Use arrow keys to navigate, Enter to select, Ctrl+A to select all';
        table.parentNode.insertBefore(description, table);
    }

    setupHeaderAccessibility() {
        const headers = this.table.thead.querySelectorAll('th');
        
        headers.forEach((header, index) => {
            header.setAttribute('role', 'columnheader');
            header.setAttribute('scope', 'col');
            
            // Add column index for screen readers
            header.setAttribute('aria-colindex', index + 1);
            
            // Sortable columns
            if (header.classList.contains('sortable')) {
                header.setAttribute('tabindex', '0');
                header.setAttribute('role', 'button');
                header.setAttribute('aria-sort', 'none');
                
                const sortText = document.createElement('span');
                sortText.className = 'sr-only sort-status';
                sortText.textContent = 'sortable';
                header.appendChild(sortText);
                
                // Update sort status on click
                header.addEventListener('click', () => {
                    setTimeout(() => this.updateSortStatus(header), 100);
                });
            }
            
            // Selection column
            if (header.classList.contains('select-checkbox')) {
                const checkbox = header.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.setAttribute('aria-label', 'Select all rows');
                    checkbox.setAttribute('aria-describedby', 'select-all-description');
                    
                    const description = document.createElement('span');
                    description.id = 'select-all-description';
                    description.className = 'sr-only';
                    description.textContent = 'Toggle selection for all visible rows';
                    header.appendChild(description);
                }
            }
        });
    }

    setupRowAccessibility() {
        // This will be called after data loads
        this.table.on('dataLoaded', () => {
            this.updateRowAccessibility();
        });
    }

    updateRowAccessibility() {
        const rows = this.table.tbody.querySelectorAll('tr:not(.dtr-details)');
        
        rows.forEach((row, index) => {
            row.setAttribute('role', 'row');
            row.setAttribute('aria-rowindex', index + 2); // +2 because header is row 1
            
            // Make rows focusable for keyboard navigation
            row.setAttribute('tabindex', '-1');
            
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, cellIndex) => {
                cell.setAttribute('role', 'gridcell');
                cell.setAttribute('aria-colindex', cellIndex + 1);
                
                // Selection checkbox
                const checkbox = cell.querySelector('input[type="checkbox"]');
                if (checkbox) {
                    checkbox.setAttribute('aria-label', `Select row ${index + 1}`);
                }
                
                // Expand button
                const expandBtn = cell.querySelector('.expand-btn');
                if (expandBtn) {
                    expandBtn.setAttribute('aria-label', 'Show hidden columns');
                    expandBtn.setAttribute('aria-expanded', 'false');
                }
            });
            
            // Selected state
            if (row.classList.contains('selected')) {
                row.setAttribute('aria-selected', 'true');
            } else {
                row.setAttribute('aria-selected', 'false');
            }
        });
    }

    setupControlsAccessibility() {
        // Search input
        const searchInput = this.table.wrapper.querySelector('.modern-table-search input');
        if (searchInput) {
            searchInput.setAttribute('aria-label', 'Search table data');
            searchInput.setAttribute('aria-describedby', 'search-description');
            
            const description = document.createElement('span');
            description.id = 'search-description';
            description.className = 'sr-only';
            description.textContent = 'Search across all columns. Results update as you type.';
            searchInput.parentNode.appendChild(description);
        }
        
        // Pagination controls
        const pagination = this.table.wrapper.querySelector('.modern-table-pagination');
        if (pagination) {
            pagination.setAttribute('role', 'navigation');
            pagination.setAttribute('aria-label', 'Table pagination');
            
            const pageLinks = pagination.querySelectorAll('.page-link');
            pageLinks.forEach(link => {
                const text = link.textContent.trim();
                if (text === 'Previous') {
                    link.setAttribute('aria-label', 'Go to previous page');
                } else if (text === 'Next') {
                    link.setAttribute('aria-label', 'Go to next page');
                } else if (text === 'First') {
                    link.setAttribute('aria-label', 'Go to first page');
                } else if (text === 'Last') {
                    link.setAttribute('aria-label', 'Go to last page');
                } else if (!isNaN(text)) {
                    link.setAttribute('aria-label', `Go to page ${text}`);
                }
            });
        }
        
        // Export buttons
        const buttons = this.table.wrapper.querySelectorAll('.modern-table-buttons button');
        buttons.forEach(button => {
            if (!button.getAttribute('aria-label')) {
                const text = button.textContent.trim();
                button.setAttribute('aria-label', `Export data as ${text}`);
            }
        });
    }

    setupLiveRegions() {
        // Create live region for announcements
        const liveRegion = document.createElement('div');
        liveRegion.id = 'table-live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        this.table.wrapper.appendChild(liveRegion);
        
        this.liveRegion = liveRegion;
        
        // Announce data changes
        this.table.on('dataLoaded', (data, meta) => {
            const total = meta?.total || data?.length || 0;
            const showing = data?.length || 0;
            const message = `Table updated. Showing ${showing} of ${total} entries.`;
            this.announce(message);
        });
        
        // Announce selection changes
        this.table.on('selectionChange', (selectedRows) => {
            const count = selectedRows.length;
            const message = count === 0 
                ? 'No rows selected' 
                : `${count} row${count === 1 ? '' : 's'} selected`;
            this.announce(message);
        });
    }

    updateSortStatus(header) {
        const sortIcon = header.querySelector('.fas');
        const sortText = header.querySelector('.sort-status');
        
        if (sortIcon && sortText) {
            if (sortIcon.classList.contains('fa-sort-up')) {
                header.setAttribute('aria-sort', 'ascending');
                sortText.textContent = 'sorted ascending';
            } else if (sortIcon.classList.contains('fa-sort-down')) {
                header.setAttribute('aria-sort', 'descending');
                sortText.textContent = 'sorted descending';
            } else {
                header.setAttribute('aria-sort', 'none');
                sortText.textContent = 'sortable';
            }
        }
    }

    announce(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
        }
    }

    updateExpandButton(button, expanded) {
        button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        button.setAttribute('aria-label', expanded ? 'Hide hidden columns' : 'Show hidden columns');
    }

    destroy() {
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
    }
}