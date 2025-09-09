/**
 * FilterPanel.js - Advanced filters component for ModernTable.js
 * Sesuai master plan: components/FilterPanel.js (3KB)
 */

import { createElement, find, findAll } from '../utils/dom.js';

export class FilterPanel {
    constructor(table) {
        this.table = table;
        this.filters = {};
        this.init();
    }

    init() {
        if (this.table.options.filters && this.table.options.filters.length > 0) {
            this.createFilterPanel();
        }
    }

    /**
     * Create filter panel
     */
    createFilterPanel() {
        this.filtersContainer = createElement('div', {
            className: 'modern-table-filters mb-3 p-3 bg-body-secondary rounded border'
        });
        
        const filtersRow = createElement('div', {
            className: 'd-flex flex-wrap gap-2 align-items-end'
        });
        
        this.table.options.filters.forEach(filter => {
            // Create flex item with auto width based on content
            const col = createElement('div', {
                className: 'flex-shrink-0'
            });
            
            this.createFilter(filter, col);
            filtersRow.appendChild(col);
        });
        
        this.filtersContainer.appendChild(filtersRow);
        
        // Insert after toolbar if exists, otherwise before table
        if (this.table.toolbar) {
            this.table.toolbar.parentNode.insertBefore(this.filtersContainer, this.table.toolbar.nextSibling);
        } else {
            this.table.wrapper.insertBefore(this.filtersContainer, this.table.element);
        }
        

    }

    /**
     * Create individual filter
     */
    createFilter(filter, container) {
        switch (filter.type) {
            case 'select':
                this.createSelectFilter(filter, container);
                break;
            case 'text':
                this.createTextFilter(filter, container);
                break;
            case 'date':
                this.createDateFilter(filter, container);
                break;
            case 'daterange':
                this.createDateRangeFilter(filter, container);
                break;
            case 'numberrange':
                this.createNumberRangeFilter(filter, container);
                break;
            case 'clear':
                this.createClearButton(filter, container);
                break;
            default:
                break;
        }
    }

    /**
     * Create select filter
     */
    createSelectFilter(filter, container) {
        // Add label
        if (filter.label) {
            const label = createElement('label', {
                className: 'form-label small mb-1',
                textContent: filter.label
            });
            container.appendChild(label);
        }
        
        const select = createElement('select', {
            className: 'form-select form-select-sm',
            'data-filter': filter.column,
            style: 'min-width: 120px; width: auto;'
        });
        
        filter.options.forEach(option => {
            const optionEl = createElement('option', {
                value: option.value,
                textContent: option.text
            });
            select.appendChild(optionEl);
        });
        
        select.addEventListener('change', (e) => {
            this.applyFilter(filter.column, e.target.value);
        });
        
        container.appendChild(select);
    }

    /**
     * Create text filter
     */
    createTextFilter(filter, container) {
        const input = createElement('input', {
            type: 'text',
            className: 'form-control form-control-sm',
            placeholder: filter.placeholder || `Filter ${filter.label}`,
            'data-filter': filter.column
        });
        
        // Debounce text input
        let timeout;
        input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.applyFilter(filter.column, e.target.value);
            }, 300);
        });
        
        container.appendChild(input);
    }

    /**
     * Create single date filter
     */
    createDateFilter(filter, container) {
        // Add label
        if (filter.label) {
            const label = createElement('label', {
                className: 'form-label small mb-1',
                textContent: filter.label
            });
            container.appendChild(label);
        }
        
        const input = createElement('input', {
            type: 'date',
            className: 'form-control form-control-sm',
            placeholder: filter.placeholder || `Filter ${filter.label}`,
            'data-filter': filter.column,
            style: 'width: 150px;'
        });
        
        input.addEventListener('change', (e) => {
            this.applyFilter(filter.column, e.target.value);
        });
        
        container.appendChild(input);
    }

    /**
     * Create date range filter
     */
    createDateRangeFilter(filter, container) {
        // Add label
        if (filter.label) {
            const label = createElement('label', {
                className: 'form-label small mb-1',
                textContent: filter.label
            });
            container.appendChild(label);
        }
        
        const wrapper = createElement('div', {
            className: 'd-flex gap-1'
        });
        
        const fromInput = createElement('input', {
            type: 'date',
            className: 'form-control form-control-sm',
            placeholder: 'From',
            'data-filter': `${filter.column}_from`,
            style: 'width: 140px;'
        });
        
        const toInput = createElement('input', {
            type: 'date',
            className: 'form-control form-control-sm',
            placeholder: 'To',
            'data-filter': `${filter.column}_to`,
            style: 'width: 140px;'
        });
        
        fromInput.addEventListener('change', () => {
            this.applyDateRangeFilter(filter.column, fromInput.value, toInput.value);
        });
        
        toInput.addEventListener('change', () => {
            this.applyDateRangeFilter(filter.column, fromInput.value, toInput.value);
        });
        
        wrapper.appendChild(fromInput);
        wrapper.appendChild(toInput);
        container.appendChild(wrapper);
    }

    /**
     * Create number range filter
     */
    createNumberRangeFilter(filter, container) {
        const wrapper = createElement('div', {
            className: 'd-flex gap-1'
        });
        
        const minInput = createElement('input', {
            type: 'number',
            className: 'form-control form-control-sm',
            placeholder: `Min ${filter.label}`,
            min: filter.min || 0,
            max: filter.max || 999999,
            'data-filter': `${filter.column}_min`
        });
        
        const maxInput = createElement('input', {
            type: 'number',
            className: 'form-control form-control-sm',
            placeholder: `Max ${filter.label}`,
            min: filter.min || 0,
            max: filter.max || 999999,
            'data-filter': `${filter.column}_max`
        });
        
        minInput.addEventListener('change', () => {
            this.applyNumberRangeFilter(filter.column, minInput.value, maxInput.value);
        });
        
        maxInput.addEventListener('change', () => {
            this.applyNumberRangeFilter(filter.column, minInput.value, maxInput.value);
        });
        
        wrapper.appendChild(minInput);
        wrapper.appendChild(maxInput);
        container.appendChild(wrapper);
    }

    /**
     * Apply single filter
     */
    applyFilter(column, value) {
        if (value && value.trim()) {
            this.filters[column] = value.trim();
        } else {
            delete this.filters[column];
        }
        
        this.table.currentPage = 1;
        
        // Save state after filter
        if (this.table.stateManager && this.table.stateManager.isEnabled()) {
            this.table.stateManager.save();
        }
        
        this.table.loadData();
    }

    /**
     * Apply date range filter
     */
    applyDateRangeFilter(column, fromDate, toDate) {
        if (fromDate) {
            this.filters[`${column}_from`] = fromDate;
        } else {
            delete this.filters[`${column}_from`];
        }
        
        if (toDate) {
            this.filters[`${column}_to`] = toDate;
        } else {
            delete this.filters[`${column}_to`];
        }
        
        this.table.currentPage = 1;
        
        // Save state after filter
        if (this.table.stateManager && this.table.stateManager.isEnabled()) {
            this.table.stateManager.save();
        }
        
        this.table.loadData();
    }

    /**
     * Apply number range filter
     */
    applyNumberRangeFilter(column, minValue, maxValue) {
        if (minValue && !isNaN(minValue)) {
            this.filters[`${column}_min`] = minValue;
        } else {
            delete this.filters[`${column}_min`];
        }
        
        if (maxValue && !isNaN(maxValue)) {
            this.filters[`${column}_max`] = maxValue;
        } else {
            delete this.filters[`${column}_max`];
        }
        
        this.table.currentPage = 1;
        
        // Save state after filter
        if (this.table.stateManager && this.table.stateManager.isEnabled()) {
            this.table.stateManager.save();
        }
        
        this.table.loadData();
    }

    /**
     * Get current filters
     */
    getFilters() {
        return { ...this.filters };
    }

    /**
     * Set filters from state (without triggering reload)
     */
    setFilters(filters) {
        this.filters = { ...filters };
        
        // Update filter inputs to match state
        Object.keys(filters).forEach(filterKey => {
            const input = find(`[data-filter="${filterKey}"]`, this.filtersContainer);
            if (input && filters[filterKey]) {
                input.value = filters[filterKey];
            }
        });
        

    }

    /**
     * Create clear button
     */
    createClearButton(filter, container) {
        const button = createElement('button', {
            type: 'button',
            className: filter.className || 'btn btn-outline-danger btn-sm',
            innerHTML: `<i class="${filter.icon || 'fas fa-eraser'}"></i> ${filter.label || 'Clear All'}`
        });
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (filter.action && typeof filter.action === 'function') {
                filter.action();
            } else {
                this.clearFilters();
            }
        });
        
        container.appendChild(button);
    }

    /**
     * Clear all filters
     */
    clearFilters(skipReload = false) {
        this.filters = {};
        
        // Reset all filter inputs
        const filterInputs = findAll('[data-filter]', this.filtersContainer);
        filterInputs.forEach(input => {
            if (input.tagName === 'SELECT') {
                input.selectedIndex = 0;
            } else {
                input.value = '';
            }
        });
        
        this.table.currentPage = 1;
        
        if (!skipReload) {
            this.table.loadData();
        }
    }

    /**
     * Destroy filter panel
     */
    destroy() {
        if (this.filtersContainer && this.filtersContainer.parentNode) {
            this.filtersContainer.parentNode.removeChild(this.filtersContainer);
        }
    }
}