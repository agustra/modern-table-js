/**
 * ResponsivePlugin.js - Based on DataTables Responsive 2.3.0
 * Exact implementation from dataTables.responsive.js
 */

import { createElement } from "../utils/dom.js";

export class ResponsivePlugin {
  constructor(table) {
    this.table = table;
    this.c = {
      breakpoints: [
        { name: "desktop", width: Infinity },
        { name: "tablet-l", width: 1024 },
        { name: "tablet-p", width: 768 },
        { name: "mobile-l", width: 480 },
        { name: "mobile-p", width: 320 },
      ],
    };

    this.s = {
      columns: [],
      current: [],
      currentBreakpoint: "desktop",
    };

    this.dom = {
      resize: null,
    };

    this._init();
  }

  _init() {
    // Add responsive class to table
    this.table.element.classList.add("modern-table-responsive");

    // Add selection class if table has selection enabled
    if (this.table.options.select) {
      this.table.element.classList.add("has-selection");
    }

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
        // Dynamic priority based on column characteristics
        priority = 5000; // Base priority

        // Higher priority (lower number = show first) for important columns
        if (index === 0) {
          priority = 10000; // First column (usually ID/No) - never hide
        }

        // if (column.className && column.className.includes('text-center')) {
        //     priority -= 1000; // Center columns often important (status, badges)
        // }

        if (column.render) {
          priority -= 500; // Rendered columns often important
        }

        // Lower priority (higher number = hide first) for less important columns
        if (
          column.orderable === false &&
          column.title &&
          column.title.toLowerCase().includes("action")
        ) {
          priority = 1000; // Action columns can be hidden first
        }

        // Adjust by position - right to left priority (later columns hidden first)
        // Skip first column (No/ID) and Action columns from this calculation
        if (
          index > 0 &&
          !(column.title && column.title.toLowerCase().includes("action"))
        ) {
          const totalColumns = this.table.options.columns.length;
          const rightToLeftIndex = totalColumns - 1 - index;
          priority += rightToLeftIndex * 100; // Higher index = higher priority = show first
        }
      }

      this.s.columns.push({
        auto: priority === undefined,
        control: false,
        index: index,
        minWidth: this._columnMinWidth(column),
        priority: priority,
        resizeWidth: 0,
      });
    });
  }

  /**
   * Calculate minimum width for column
   */
  _columnMinWidth(column) {
    // Use column.width if specified
    if (column.width) {
      return parseInt(column.width);
    }

    // Use column.style width if specified
    if (column.style && column.style.includes("width:")) {
      const match = column.style.match(/width:\s*(\d+)px/);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Get column index to identify first column
    const columnIndex = this.table.options.columns.indexOf(column);

    // Special handling for first column (ID/No) - auto width based on content
    if (columnIndex === 0) {
      return this._calculateAutoWidth(column, columnIndex);
    }

    // More conservative calculation for other columns
    const titleLength = (column.title || column.data || "").length;
    let baseWidth = Math.max(titleLength * 10, 90); // 10px per character, min 90px

    // Add padding for content that might be wider than title
    baseWidth += 40; // Extra space for content and padding

    // Adjust based on column characteristics
    if (column.className && column.className.includes("text-center")) {
      baseWidth = Math.min(baseWidth, 120); // Center columns
    }

    if (column.orderable === false) {
      baseWidth = Math.min(baseWidth, 140); // Non-sortable columns
    }

    // More conservative caps
    const isMobile = window.innerWidth <= 768;
    const maxWidth = isMobile ? 140 : 180;

    const finalWidth = Math.min(baseWidth, maxWidth);
    return finalWidth;
  }

  /**
   * Calculate auto width based on actual content
   */
  _calculateAutoWidth(column, columnIndex) {
    // Get title width
    const titleLength = (column.title || column.data || "").length;
    let maxWidth = Math.max(titleLength * 8, 40); // 8px per character, min 40px

    // Try to get content width from actual data if available
    try {
      if (this.table.data && this.table.data.length > 0) {
        // Sample first 10 rows to estimate content width
        const sampleSize = Math.min(this.table.data.length, 10);

        for (let i = 0; i < sampleSize; i++) {
          const cellValue = this.table.getCellValue(
            this.table.data[i],
            column.data
          );
          let contentLength = String(cellValue || "").length;

          // Handle HTML content (remove tags for length calculation)
          if (typeof cellValue === "string" && cellValue.includes("<")) {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = cellValue;
            contentLength = (tempDiv.textContent || tempDiv.innerText || "")
              .length;
          }

          const contentWidth = contentLength * 8 + 30; // 8px per character + padding
          maxWidth = Math.max(maxWidth, contentWidth);
        }
      }
    } catch (error) {
      // Fallback to title width if data access fails
      console.warn(
        "Could not access table data for width calculation, using title width"
      );
    }

    // Cap the width for ID/No columns (reasonable limits)
    return Math.min(maxWidth, 100); // Max 100px for first column
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
    const isMobile = window.innerWidth <= 768;

    // Detect framework
    const hasBootstrap =
      document.querySelector('link[href*="bootstrap"]') || !!window.bootstrap;

    // Adjust space reservation based on framework
    let reservedWidth = hasBootstrap ? 60 : 80; // Bootstrap has better spacing

    // Add space for selection column if exists
    if (this.table.options.select) {
      reservedWidth += hasBootstrap ? 40 : 50; // Bootstrap checkbox smaller
    }

    // Add space for expand button and scrollbar on mobile
    if (isMobile) {
      reservedWidth += hasBootstrap ? 30 : 40; // Bootstrap mobile spacing
    }

    // More realistic minimum width based on actual container
    const baseAvailableWidth = containerWidth - reservedWidth;

    // Framework-specific minimum width - more flexible
    const minWidth = isMobile
      ? hasBootstrap
        ? 200
        : 220
      : hasBootstrap
      ? 250
      : 280;

    // Use actual available width if reasonable, otherwise use minimum
    const availableWidth =
      baseAvailableWidth > minWidth
        ? baseAvailableWidth
        : Math.max(baseAvailableWidth, minWidth * 0.8); // Allow 80% of minWidth

    // Sort columns: higher priority last (hide first)
    const columns = [...this.s.columns].sort((a, b) => b.priority - a.priority);

    // Calculate which columns fit
    let usedWidth = 0;
    const visible = [];
    const hidden = [];

    // Add columns in order until width exceeded
    columns.forEach((col) => {
      const totalWidth = usedWidth + col.minWidth;
      const wouldExceed = totalWidth > availableWidth;
      const neverHide = col.priority >= 10000;

      const columnTitle =
        this.table.options.columns[col.index]?.title ||
        this.table.options.columns[col.index]?.data;

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

    // Apply actual column widths to DOM
    this._applyColumnWidths();
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
    hidden.forEach((colIndex) => {
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
   * Apply CSS classes for column styling
   */
  _applyColumnWidths() {
    // Add CSS classes based on column types instead of inline styles
    this.s.columns.forEach((col) => {
      const column = this.table.options.columns[col.index];
      let domIndex = col.index;
      if (this.table.options.select) {
        domIndex = col.index + 1;
      }

      // Determine column class based on content type
      let columnClass = "col-medium"; // default

      if (col.index === 0) {
        columnClass = "col-narrow"; // ID/No column
      } else if (column.data && column.data.toLowerCase().includes("email")) {
        columnClass = "col-email";
      } else if (
        column.title &&
        column.title.toLowerCase().includes("action")
      ) {
        columnClass = "col-action";
      } else if (col.minWidth < 100) {
        columnClass = "col-narrow";
      } else if (col.minWidth > 150) {
        columnClass = "col-wide";
      }

      // Apply class to header cells
      const headerRows = this.table.thead.querySelectorAll("tr");
      headerRows.forEach((row) => {
        const cells = row.querySelectorAll("th");
        if (cells[domIndex]) {
          cells[domIndex].className =
            (cells[domIndex].className || "") + " " + columnClass;
        }
      });

      // Apply class to body cells
      const bodyRows = this.table.tbody.querySelectorAll("tr");
      bodyRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells[domIndex]) {
          cells[domIndex].className =
            (cells[domIndex].className || "") + " " + columnClass;
        }
      });
    });
  }

  /**
   * Show all columns
   */
  _showAllColumns() {
    // Show all header cells (including column search row)
    const headerCells = this.table.element.querySelectorAll(
      "thead th:not(.dtr-control)"
    );
    headerCells.forEach((cell) => {
      cell.style.display = "";
    });

    // Show all body cells
    const bodyCells = this.table.element.querySelectorAll(
      "tbody td:not(.dtr-control)"
    );
    bodyCells.forEach((cell) => {
      cell.style.display = "";
    });

    // Show all footer cells
    const footerCells = this.table.element.querySelectorAll(
      "tfoot th:not(.dtr-control), tfoot td:not(.dtr-control)"
    );
    footerCells.forEach((cell) => {
      cell.style.display = "";
    });
  }

  /**
   * Hide specific column
   */
  _hideColumn(columnIndex) {
    // Calculate DOM index (selection column first, then data)
    let domIndex = columnIndex;
    if (this.table.options.select) domIndex++; // Selection column is first

    // Hide all header rows (including column search row)
    const headerRows = this.table.thead.querySelectorAll("tr");
    headerRows.forEach((row) => {
      const cells = row.querySelectorAll("th");
      if (cells[domIndex]) {
        cells[domIndex].style.display = "none";
      }
    });

    // Hide body cells
    const bodyRows = this.table.tbody.querySelectorAll("tr:not(.dtr-details)");
    bodyRows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (cells[domIndex]) {
        cells[domIndex].style.display = "none";
      }
    });

    // Hide footer cells if exists
    const footerRows = this.table.element.querySelectorAll("tfoot tr");
    footerRows.forEach((row) => {
      const cells = row.querySelectorAll("th, td");
      if (cells[domIndex]) {
        cells[domIndex].style.display = "none";
      }
    });
  }

  /**
   * Check if expand buttons exist
   */
  _hasControl() {
    return this.table.tbody.querySelector(".expand-btn") !== null;
  }

  /**
   * Insert control into selection column
   */
  _insertControl() {
    if (!this.table.options.select) return;

    // Add expand buttons to existing selection cells
    const bodyRows = this.table.tbody.querySelectorAll("tr:not(.dtr-details)");
    bodyRows.forEach((row, index) => {
      this._addExpandToSelectionCell(row, index);
    });
  }

  /**
   * Add expand button to existing selection cell
   */
  _addExpandToSelectionCell(row, rowIndex) {
    const selectionCell = row.querySelector(".select-checkbox");
    if (!selectionCell) return;

    // Add expand button next to checkbox
    const expandBtn = createElement("button", {
      className: "expand-btn ms-1",
      innerHTML: "+",
    });

    expandBtn.addEventListener("click", (e) => {
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
    const expandBtn = row.querySelector(".expand-btn");
    if (details.child.isShown()) {
      // Hide details
      details.child.hide();
      row.classList.remove("dtr-expanded");
      if (expandBtn) expandBtn.innerHTML = "+";
    } else {
      // Show details
      const content = this._detailsRenderer(rowIndex);
      details.child.show(content);
      row.classList.add("dtr-expanded");
      if (expandBtn) expandBtn.innerHTML = "−";
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
          const isShown = next && next.classList.contains("dtr-details");
          return isShown;
        },
        show: (content) => {
          const detailRow = this._createDetailRow(content);
          // Remove existing detail first
          const existing = row.nextElementSibling;
          if (existing && existing.classList.contains("dtr-details")) {
            existing.remove();
          }

          row.parentNode.insertBefore(detailRow, row.nextSibling);
        },
        hide: () => {
          const next = row.nextElementSibling;
          if (next && next.classList.contains("dtr-details")) {
            next.remove();
          }
        },
      },
    };
  }

  /**
   * Create detail row
   */
  _createDetailRow(content) {
    const totalCols = this.table.thead.querySelectorAll("th").length;

    const detailRow = createElement("tr", {
      className: "dtr-details",
    });

    const detailCell = createElement("td", {
      colspan: totalCols,
      className: "dtr-details-content",
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

    const dl = createElement("dl", {
      className: "dtr-details-list",
    });

    if (hidden.length === 0) {
      dl.innerHTML = '<p class="text-muted">No hidden columns to display</p>';
      return dl;
    }

    hidden.forEach((colIndex) => {
      const column = this.table.options.columns[colIndex];
      if (!column || column.data === "DT_RowIndex") return;

      let value = this.table.getCellValue(rowData, column.data);

      // Apply render function
      if (column.render && typeof column.render === "function") {
        value = column.render(value, "display", rowData, { row: rowIndex });
      }

      const dt = createElement("dt", {
        textContent: column.title || column.data,
      });

      const dd = createElement("dd");

      if (typeof value === "string" && value.includes("<")) {
        dd.innerHTML = value;
      } else {
        dd.textContent = value || "-";
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
    const expandBtns = this.table.tbody.querySelectorAll(".expand-btn");
    expandBtns.forEach((btn) => btn.remove());

    // Remove detail rows
    const detailRows = this.table.tbody.querySelectorAll(".dtr-details");
    detailRows.forEach((row) => row.remove());

    // Remove expanded class
    const expandedRows = this.table.tbody.querySelectorAll(".dtr-expanded");
    expandedRows.forEach((row) => row.classList.remove("dtr-expanded"));
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

    window.addEventListener("resize", resizeHandler);
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
      window.removeEventListener("resize", this.dom.resize);
    }
    this._removeControl();

    // Remove responsive class
    this.table.element.classList.remove("modern-table-responsive");
    this.table.element.classList.remove("has-selection");
  }
}
