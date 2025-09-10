/**
 * ResponsivePlugin.js - Based on DataTables Responsive 2.3.0
 * Exact implementation from dataTables.responsive.js
 */

import { createElement } from '../utils/dom.js';

export class ResponsivePlugin {
    constructor(table) {
        this.table = table;
        this.c = {
            breakpoints: [
                { name: 'desktop', width: Infinity },
                { name: 'tablet-l', width: 1024 },
                { name: 'tablet-p', width: 768 },
                { name: 'mobile-l', width: 480 },
                { name: 'mobile-p', width: 320 }
            ]
        };
        
        this.s = {
            columns: [],
            current: [],
            currentBreakpoint: 'desktop'
        };
        
        this.dom = {
            resize: null
        };
        
        this._init();
    }

    _init() {
        // Setup columns with responsivePriority
        this._columnsVisiblity();
        
        // Attach resize listener
        this._resizeListener();
        
        // Initial calculation - faster
        setTimeout(() => {
            this._resize();
        }, 50);
    }

    /**
     * Setup columns visibility priorities (from DataTables source)
     */
    _columnsVisiblity() {
        this.s.columns = [];
        
        this.table.options.columns.forEach((column, index) => {
            // Auto-assign responsivePriority if not set
            let priority = column.responsivePriority;
            
            if (priority === undefined) {
                // Simple reverse order: rightmost = highest priority number = hide first
                priority = 10 - index;
            }
            
            this.s.columns.push({
                auto: priority === undefined,
                control: false,
                index: index,
                minWidth: this._columnMinWidth(column),
                priority: priority,
                resizeWidth: 0
            });
        });
        

    }

    /**
     * Calculate minimum width for column
     */
    _columnMinWidth(column) {
        // Use column.width if specified
        if (column.width) return parseInt(column.width);
        
        // Use fixed width of 120px for all columns for stability
        return 120;
    }

    /**
     * Resize handler (core DataTables logic)
     */
    _resize() {
        const width = window.innerWidth;
        const breakpoint = this._find_breakpoint(width);
        
        // Always recalculate on resize (force update)
        this.s.currentBreakpoint = breakpoint;
        this._columnsVisiblity_calc();
    }

    /**
     * Find current breakpoint
     */
    _find_breakpoint(width) {
        const breakpoints = this.c.breakpoints;
        
        for (let i = 0; i < breakpoints.length; i++) {
            if (width <= breakpoints[i].width) {
                return breakpoints[i].name;
            }
        }
        
        return breakpoints[0].name;
    }

    /**
     * Calculate column visibility (DataTables core algorithm)
     */
    _columnsVisiblity_calc() {
        // Get available width based on container, not table
        const containerWidth = this.table.wrapper.offsetWidth;
        // Reserve space for padding, borders, and potential control column
        const reservedWidth = 80; // More conservative reservation
        const availableWidth = Math.max(containerWidth - reservedWidth, 300); // Minimum 300px
        
        // Sort columns: higher priority last (hide first)
        const columns = [...this.s.columns].sort((a, b) => b.priority - a.priority);
        
        // Calculate which columns fit
        let usedWidth = 0;
        const visible = [];
        const hidden = [];
        
        // Add columns in order until width exceeded
        columns.forEach(col => {
            const totalWidth = usedWidth + col.minWidth;
            const wouldExceed = totalWidth > availableWidth;
            const neverHide = col.priority >= 10000;
            
            if (!wouldExceed || neverHide) {
                visible.push(col.index);
                usedWidth = totalWidth;
            } else {
                hidden.push(col.index);
            }
        });
        
        // Sort arrays
        visible.sort((a, b) => a - b);
        hidden.sort((a, b) => a - b);
        

        
        // Apply visibility
        this._setColumnVis(visible, hidden);
    }

    /**
     * Set column visibility
     */
    _setColumnVis(visible, hidden) {
        // Always remove control first to prevent duplicates
        this._removeControl();
        
        // Show all columns first
        this._showAllColumns();
        
        // Hide specific columns
        hidden.forEach(colIndex => {
            this._hideColumn(colIndex);
        });
        
        // Add control column if needed
        if (hidden.length > 0) {
            this._insertControl();
        }
        
        // Store current state
        this.s.current = { visible, hidden };
    }

    /**
     * Show all columns
     */
    _showAllColumns() {
        const allCells = this.table.element.querySelectorAll('th:not(.dtr-control), td:not(.dtr-control)');
        allCells.forEach(cell => {
            cell.style.display = '';
        });
    }

    /**
     * Hide specific column
     */
    _hideColumn(columnIndex) {
        // Calculate DOM index (selection column first, then data)
        let domIndex = columnIndex;
        if (this.table.options.select) domIndex++; // Selection column is first
        
        // Hide header
        const headerCells = this.table.thead.querySelectorAll('th');
        if (headerCells[domIndex]) {
            headerCells[domIndex].style.display = 'none';
        }
        
        // Hide body cells
        const bodyRows = this.table.tbody.querySelectorAll('tr:not(.dtr-details)');
        bodyRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells[domIndex]) {
                cells[domIndex].style.display = 'none';
            }
        });
    }



    /**
     * Check if expand buttons exist
     */
    _hasControl() {
        return this.table.tbody.querySelector('.expand-btn') !== null;
    }

    /**
     * Insert control into selection column
     */
    _insertControl() {
        if (!this.table.options.select) return;
        
        // Add expand buttons to existing selection cells
        const bodyRows = this.table.tbody.querySelectorAll('tr:not(.dtr-details)');
        bodyRows.forEach((row, index) => {
            this._addExpandToSelectionCell(row, index);
        });
    }

    /**
     * Add expand button to existing selection cell
     */
    _addExpandToSelectionCell(row, rowIndex) {
        const selectionCell = row.querySelector('.select-checkbox');
        if (!selectionCell) return;
        
        // Add expand button next to checkbox
        const expandBtn = createElement('button', {
            className: 'expand-btn ms-1',
            innerHTML: '+'
        });
        
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this._detailsDisplay(row, rowIndex);
        });
        
        selectionCell.appendChild(expandBtn);
    }

    /**
     * Toggle details display (DataTables method)
     */
    _detailsDisplay(row, rowIndex) {
        const details = this._detailsObj(row);
        const expandBtn = row.querySelector('.expand-btn');
        
        if (details.child.isShown()) {
            // Hide details
            details.child.hide();
            row.classList.remove('dtr-expanded');
            if (expandBtn) expandBtn.innerHTML = '+';
        } else {
            // Show details
            const content = this._detailsRenderer(rowIndex);
            details.child.show(content);
            row.classList.add('dtr-expanded');
            if (expandBtn) expandBtn.innerHTML = '−';
        }
    }

    /**
     * Details object (DataTables pattern)
     */
    _detailsObj(row) {
        return {
            child: {
                isShown: () => {
                    const next = row.nextElementSibling;
                    return next && next.classList.contains('dtr-details');
                },
                show: (content) => {
                    const detailRow = this._createDetailRow(content);
                    row.parentNode.insertBefore(detailRow, row.nextSibling);
                },
                hide: () => {
                    const next = row.nextElementSibling;
                    if (next && next.classList.contains('dtr-details')) {
                        next.remove();
                    }
                }
            }
        };
    }

    /**
     * Create detail row
     */
    _createDetailRow(content) {
        const totalCols = this.table.thead.querySelectorAll('th').length;
        
        const detailRow = createElement('tr', {
            className: 'dtr-details'
        });
        
        const detailCell = createElement('td', {
            colspan: totalCols,
            className: 'dtr-details-content'
        });
        
        detailCell.appendChild(content);
        detailRow.appendChild(detailCell);
        
        return detailRow;
    }

    /**
     * Details renderer (DataTables method)
     */
    _detailsRenderer(rowIndex) {
        const rowData = this.table.data[rowIndex];
        const hidden = this.s.current.hidden || [];
        

        
        const dl = createElement('dl', {
            className: 'dtr-details-list'
        });
        
        if (hidden.length === 0) {
            dl.innerHTML = '<p class="text-muted">No hidden columns to display</p>';
            return dl;
        }
        
        hidden.forEach(colIndex => {
            const column = this.table.options.columns[colIndex];
            if (!column || column.data === 'DT_RowIndex') return;
            
            let value = this.table.getCellValue(rowData, column.data);
            
            // Apply render function
            if (column.render && typeof column.render === 'function') {
                value = column.render(value, 'display', rowData, { row: rowIndex });
            }
            
            const dt = createElement('dt', {
                textContent: column.title || column.data
            });
            
            const dd = createElement('dd');
            if (typeof value === 'string' && value.includes('<')) {
                dd.innerHTML = value;
            } else {
                dd.textContent = value || '-';
            }
            
            dl.appendChild(dt);
            dl.appendChild(dd);
        });
        
        return dl;
    }

    /**
     * Remove expand buttons from selection cells
     */
    _removeControl() {
        // Remove expand buttons
        const expandBtns = this.table.tbody.querySelectorAll('.expand-btn');
        expandBtns.forEach(btn => btn.remove());
        
        // Remove detail rows
        const detailRows = this.table.tbody.querySelectorAll('.dtr-details');
        detailRows.forEach(row => row.remove());
        
        // Remove expanded class
        const expandedRows = this.table.tbody.querySelectorAll('.dtr-expanded');
        expandedRows.forEach(row => row.classList.remove('dtr-expanded'));
    }

    /**
     * Resize listener
     */
    _resizeListener() {
        let timeout;
        
        const resizeHandler = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this._resize();
            }, 150); // Reduce frequency
        };
        
        window.addEventListener('resize', resizeHandler);
        this.dom.resize = resizeHandler;
    }

    /**
     * Update after data load
     */
    updateAfterDataLoad() {
        // Faster DOM update
        setTimeout(() => {
            this._resize(); // Skip recalculation
        }, 50);
    }

    /**
     * Destroy
     */
    destroy() {
        if (this.dom.resize) {
            window.removeEventListener('resize', this.dom.resize);
        }
        this._removeControl();
    }
}