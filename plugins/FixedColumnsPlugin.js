/**
 * FixedColumnsPlugin - Freeze left/right columns for horizontal scrolling
 */
export class FixedColumnsPlugin {
    constructor(table) {
        this.table = table;
        this.options = this.parseOptions(table.options.fixedColumns);
        this.isEnabled = this.options.left > 0 || this.options.right > 0;
        
        if (this.isEnabled) {
            this.init();
        }
    }

    /**
     * Parse fixedColumns options
     */
    parseOptions(config) {
        if (typeof config === 'boolean') {
            return config ? { left: 1, right: 0 } : { left: 0, right: 0 };
        }
        
        if (typeof config === 'number') {
            return { left: config, right: 0 };
        }
        
        if (typeof config === 'object') {
            return {
                left: config.left || config.leftColumns || 0,
                right: config.right || config.rightColumns || 0
            };
        }
        
        return { left: 0, right: 0 };
    }

    /**
     * Initialize fixed columns
     */
    init() {
        // Add CSS for fixed columns
        this.addCSS();
        
        // Apply fixed columns after table is rendered
        this.table.on('dataLoaded', () => {
            setTimeout(() => this.applyFixedColumns(), 50);
        });
        
        // Reapply when column search is created
        const originalCreateColumnSearchRow = this.table.createColumnSearchRow;
        if (originalCreateColumnSearchRow) {
            this.table.createColumnSearchRow = (...args) => {
                const result = originalCreateColumnSearchRow.apply(this.table, args);
                setTimeout(() => this.applyFixedColumns(), 50);
                return result;
            };
        }
        
        // Smart resize handler
        window.addEventListener('resize', () => {
            setTimeout(() => {
                const isMobile = window.innerWidth <= 768;
                const hasResponsive = this.table.options.responsive;
                
                if (isMobile && hasResponsive) {
                    // Mobile + responsive: disable fixed columns
                    this.disableTemporarily();
                } else {
                    // Desktop or no responsive: enable fixed columns
                    this.applyFixedColumns();
                }
            }, 100);
        });
    }

    /**
     * Add CSS for fixed columns
     */
    addCSS() {
        const css = `
            .modern-table-fixed {
                position: relative;
                overflow-x: auto;
            }
            
            .modern-table-fixed table {
                border-collapse: separate;
                border-spacing: 0;
            }
            
            .modern-table-fixed .fixed-left {
                position: sticky;
                left: 0;
                z-index: 10;
                background: inherit;
                border-right: 2px solid #dee2e6;
            }
            
            .modern-table-fixed .fixed-right {
                position: sticky;
                right: 0;
                z-index: 10;
                background: inherit;
                border-left: 2px solid #dee2e6;
            }
            
            .modern-table-fixed .fixed-left-1 { left: 0; }
            .modern-table-fixed .fixed-left-2 { left: var(--left-1-width, 0); }
            .modern-table-fixed .fixed-left-3 { left: var(--left-2-width, 0); }
            
            .modern-table-fixed .fixed-right-1 { right: 0; }
            .modern-table-fixed .fixed-right-2 { right: var(--right-1-width, 0); }
            .modern-table-fixed .fixed-right-3 { right: var(--right-2-width, 0); }
            
            /* Header styling */
            .modern-table-fixed thead th.fixed-left,
            .modern-table-fixed thead th.fixed-right {
                background: #f8f9fa;
                font-weight: 600;
            }
            
            /* Column search row styling */
            .modern-table-fixed .column-search-row th.fixed-left,
            .modern-table-fixed .column-search-row th.fixed-right {
                background: #ffffff;
            }
            
            /* Column search input styling in fixed columns */
            .modern-table-fixed .column-search-row th.fixed-left input,
            .modern-table-fixed .column-search-row th.fixed-right input {
                background: #ffffff;
                border: 1px solid #ced4da;
            }
            
            /* Dark theme support */
            [data-bs-theme="dark"] .modern-table-fixed thead th.fixed-left,
            [data-bs-theme="dark"] .modern-table-fixed thead th.fixed-right {
                background: #212529;
                border-color: #495057;
            }
            
            [data-bs-theme="dark"] .modern-table-fixed .column-search-row th.fixed-left,
            [data-bs-theme="dark"] .modern-table-fixed .column-search-row th.fixed-right {
                background: #212529;
            }
            
            [data-bs-theme="dark"] .modern-table-fixed .column-search-row th.fixed-left input,
            [data-bs-theme="dark"] .modern-table-fixed .column-search-row th.fixed-right input {
                background: #212529;
                border-color: #495057;
                color: #ffffff;
            }
            
            [data-bs-theme="dark"] .modern-table-fixed .fixed-left,
            [data-bs-theme="dark"] .modern-table-fixed .fixed-right {
                border-color: #495057;
            }
            
            /* Mobile responsive handling */
            @media (max-width: 768px) {
                .modern-table-fixed.responsive-active .fixed-left,
                .modern-table-fixed.responsive-active .fixed-right {
                    position: static !important;
                    border: none !important;
                }
            }
            
            /* Smooth transitions */
            .modern-table-fixed .fixed-left,
            .modern-table-fixed .fixed-right {
                transition: all 0.2s ease;
            }
        `;
        
        // Add CSS to document
        if (!document.getElementById('fixed-columns-css')) {
            const style = document.createElement('style');
            style.id = 'fixed-columns-css';
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    /**
     * Apply fixed columns to table
     */
    applyFixedColumns() {
        if (!this.isEnabled) return;
        
        // Smart responsive detection
        const isMobile = window.innerWidth <= 768;
        const hasResponsive = this.table.options.responsive;
        
        // Disable fixed columns on mobile if responsive is enabled
        if (isMobile && hasResponsive) {
            this.disableTemporarily();
            return;
        }
        
        const wrapper = this.table.wrapper;
        const table = this.table.element;
        
        // Add fixed columns class to wrapper
        wrapper.classList.add('modern-table-fixed');
        
        // Get all rows (header including column search, body, footer)
        const headerRows = table.querySelectorAll('thead tr');
        const bodyRows = table.querySelectorAll('tbody tr');
        const footerRows = table.querySelectorAll('tfoot tr');
        
        // Calculate column widths for positioning
        this.calculateColumnWidths();
        
        // Apply fixed classes to all rows (including column search row)
        [...headerRows, ...bodyRows, ...footerRows].forEach(row => {
            this.applyFixedToRow(row);
        });
    }
    
    /**
     * Temporarily disable fixed columns (for mobile responsive)
     */
    disableTemporarily() {
        const wrapper = this.table.wrapper;
        wrapper.classList.remove('modern-table-fixed');
        
        // Remove all fixed classes but keep the plugin enabled
        const allCells = this.table.element.querySelectorAll('th, td');
        allCells.forEach(cell => {
            cell.classList.remove('fixed-left', 'fixed-right');
            for (let i = 1; i <= 5; i++) {
                cell.classList.remove(`fixed-left-${i}`, `fixed-right-${i}`);
            }
        });
    }

    /**
     * Calculate column widths for proper positioning
     */
    calculateColumnWidths() {
        const table = this.table.element;
        const firstRow = table.querySelector('tbody tr, thead tr');
        if (!firstRow) return;
        
        const cells = firstRow.querySelectorAll('th, td');
        const widths = [];
        
        cells.forEach(cell => {
            widths.push(cell.offsetWidth);
        });
        
        // Set CSS custom properties for positioning
        const root = document.documentElement;
        let leftAccumulated = 0;
        let rightAccumulated = 0;
        
        // Left columns
        for (let i = 0; i < this.options.left; i++) {
            if (i > 0) {
                root.style.setProperty(`--left-${i}-width`, `${leftAccumulated}px`);
            }
            leftAccumulated += widths[i] || 0;
        }
        
        // Right columns
        for (let i = 0; i < this.options.right; i++) {
            const colIndex = cells.length - 1 - i;
            if (i > 0) {
                root.style.setProperty(`--right-${i}-width`, `${rightAccumulated}px`);
            }
            rightAccumulated += widths[colIndex] || 0;
        }
    }

    /**
     * Apply fixed classes to a single row
     */
    applyFixedToRow(row) {
        const cells = row.querySelectorAll('th, td');
        
        // Apply left fixed columns
        for (let i = 0; i < this.options.left && i < cells.length; i++) {
            const cell = cells[i];
            cell.classList.add('fixed-left', `fixed-left-${i + 1}`);
        }
        
        // Apply right fixed columns
        for (let i = 0; i < this.options.right && i < cells.length; i++) {
            const cell = cells[cells.length - 1 - i];
            cell.classList.add('fixed-right', `fixed-right-${i + 1}`);
        }
    }

    /**
     * Remove fixed columns
     */
    destroy() {
        const wrapper = this.table.wrapper;
        const table = this.table.element;
        
        // Remove wrapper class
        wrapper.classList.remove('modern-table-fixed');
        
        // Remove all fixed classes
        const allCells = table.querySelectorAll('th, td');
        allCells.forEach(cell => {
            cell.classList.remove('fixed-left', 'fixed-right');
            // Remove numbered classes
            for (let i = 1; i <= 5; i++) {
                cell.classList.remove(`fixed-left-${i}`, `fixed-right-${i}`);
            }
        });
        
        // Remove CSS custom properties
        const root = document.documentElement;
        for (let i = 1; i <= 5; i++) {
            root.style.removeProperty(`--left-${i}-width`);
            root.style.removeProperty(`--right-${i}-width`);
        }
    }

    /**
     * Update fixed columns configuration
     */
    update(newConfig) {
        this.destroy();
        this.options = this.parseOptions(newConfig);
        this.isEnabled = this.options.left > 0 || this.options.right > 0;
        
        if (this.isEnabled) {
            setTimeout(() => this.applyFixedColumns(), 50);
        }
    }
}