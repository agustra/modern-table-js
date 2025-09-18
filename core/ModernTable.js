/**
 * ModernTable.js - Modern, lightweight, vanilla JavaScript table library
 * Zero dependencies, DataTables-compatible API, mobile-first responsive design
 */

import { EventEmitter } from "./EventEmitter.js";
import { ApiClient } from "./ApiClient.js";
import { StateManager } from "./StateManager.js";
import {
  createElement,
  find,
  findAll,
  addClass,
  removeClass,
  getFrameworkClasses,
  detectFramework,
} from "../utils/dom.js";
import { debounce } from "../utils/debounce.js";

import { FilterPanel } from "../components/FilterPanel.js";
import { ExportPlugin } from "../plugins/ExportPlugin.js";
import { SelectionPlugin } from "../plugins/SelectionPlugin.js";
import { SortingPlugin } from "../plugins/SortingPlugin.js";
import { ResponsivePlugin } from "../plugins/ResponsivePlugin.js";
import { ThemePlugin } from "../plugins/ThemePlugin.js";
import { KeyboardPlugin } from "../plugins/KeyboardPlugin.js";
import { AccessibilityPlugin } from "../plugins/AccessibilityPlugin.js";
import { FixedColumnsPlugin } from "../plugins/FixedColumnsPlugin.js";

export class ModernTable extends EventEmitter {
  constructor(selector, options = {}) {
    super();

    // Get table element
    this.element = typeof selector === "string" ? find(selector) : selector;
    if (!this.element) {
      throw new Error(`ModernTable: Element not found: ${selector}`);
    }

    // Store original classes
    this.originalClasses = this.element.className;

    // Merge options with defaults
    this.options = { ...ModernTable.defaults, ...options };

    // Auto-add shortcuts button if keyboard enabled
    if (this.options.keyboard && this.options.buttons) {
      const hasShortcuts = this.options.buttons.some(
        (btn) =>
          btn === "shortcuts" ||
          (typeof btn === "object" &&
            (btn.extend === "shortcuts" || btn.text?.includes("keyboard")))
      );
      if (!hasShortcuts) {
        this.options.buttons.push("shortcuts");
      }
    }

    // Initialize properties
    this.data = this.options.data || []; // Support client-side data
    this.originalData = [...this.data]; // Keep original for filtering
    this.filteredData = [];
    this.currentPage = 1;
    this.totalRecords = this.data.length;
    this.isLoading = false;

    // Determine processing mode (like DataTables)
    // Default to client-side unless explicitly serverSide: true
    this.isClientSide = this.options.data ? true : !this.options.serverSide;
    this.framework = detectFramework();
    this.classes = getFrameworkClasses(this.framework);
    this.columnSearches = {}; // Individual column searches

    // Initialize core components
    this.apiClient = new ApiClient(this.options.api);
    this.stateManager = new StateManager(this);

    // Initialize column visibility state
    this.columnVisibility = {};
    this.options.columns.forEach((column, index) => {
      this.columnVisibility[index] = true; // All visible by default
    });

    // Bind methods
    this.reload = this.reload.bind(this);
    this.search = debounce(this.search.bind(this), this.options.searchDelay);

    // Detect frameworks first
    this.detectFrameworks();

    // Initialize table
    this.init();
  }

  /**
   * Default configuration
   */
  static defaults = {
    // Data source
    api: null,
    data: null, // Client-side data array

    // Columns
    columns: [],

    // Pagination
    paging: true,
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50, 100],

    // Search & Filter
    searching: true,
    searchDelay: 200, // Reduced for better responsiveness
    columnSearch: false, // Individual column search

    // Server-side processing (DataTables compatible)
    serverSide: false, // Enable server-side processing

    // Sorting
    ordering: true,
    order: [],

    // Selection
    select: false,
    selectMultiple: true,

    // Responsive
    responsive: false,

    // Fixed Columns
    fixedColumns: false,

    // Theme
    theme: "auto", // 'light', 'dark', 'auto'

    // Keyboard navigation
    keyboard: true,

    // Accessibility
    accessibility: true,

    // UI Elements
    info: true,
    processing: true,

    // Buttons
    buttons: [],

    // State
    stateSave: false,
    stateDuration: 7200,

    // Language
    language: {
      search: "Search:",
      lengthMenu: "Show _MENU_ entries",
      info: "Showing _START_ to _END_ of _TOTAL_ entries",
      infoEmpty: "Showing 0 to 0 of 0 entries",
      infoFiltered: "(filtered from _MAX_ total entries)",
      paginate: {
        first: "First",
        last: "Last",
        next: "Next",
        previous: "Previous",
      },
      processing: "Processing...",
      noData: "No data available",
    },

    // Callbacks (DataTables compatible)
    initComplete: null,
    preDrawCallback: null,
    drawCallback: null,
    rowCallback: null,
    createdRow: null,
    footerCallback: null,
    headerCallback: null,
    infoCallback: null,
    stateLoadCallback: null,
    stateSaveCallback: null,
    onError: null,
    onRowClick: null,
    onSelectionChange: null,
  };

  /**
   * Initialize table - SIMPLE OPTIMIZATION
   */
  init() {
    try {
      // Synchronous initialization for speed
      addClass(this.element, "modern-table");
      this.createWrapper();
      this.createTableStructure();
      this.createToolbar();
      this.createPagination();
      this.createLoadingOverlay();

      // Initialize essential components only
      this.initializeComponents();

      // Attach events
      this.attachEvents();

      // Apply pending states
      if (
        this.stateManager.pendingSearch ||
        this.stateManager.pendingSort ||
        this.stateManager.pendingFilters ||
        this.stateManager.pendingColumns ||
        this.stateManager.pendingSelection
      ) {
        this.stateManager.applyPendingStates();
      }

      // Load saved state
      this.loadSavedState();

      // Load data based on mode (DataTables compatible)
      if (this.isClientSide) {
        // Client-side: fetch all data once, then process locally
        if (this.options.api && !this.options.data) {
          this.loadAllDataForClientSide();
        } else {
          this.processClientSideData();
        }
      } else {
        // Server-side: load data page by page
        this.loadData();
      }
    } catch (error) {
      console.error("ModernTable initialization failed:", error);
      this.emit("error", error);
    }
  }

  /**
   * Create wrapper structure
   */
  createWrapper() {
    this.wrapper = createElement("div", {
      className: "modern-table-wrapper",
    });

    // Insert wrapper before table
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.wrapper.appendChild(this.element);
  }

  /**
   * Create toolbar with search, length menu and buttons
   */
  createToolbar() {
    // Always create toolbar if any feature is enabled
    const hasFeatures =
      this.options.searching ||
      this.options.buttons.length > 0 ||
      (this.options.lengthMenu && this.options.lengthMenu.length > 1) ||
      (this.options.filters && this.options.filters.length > 0);

    if (!hasFeatures) return;

    this.toolbar = createElement("div", {
      className: "modern-table-toolbar mb-3",
    });

    // Left: Length menu
    const leftSection = createElement("div", {
      className: "toolbar-left",
    });

    if (this.options.lengthMenu && this.options.lengthMenu.length > 1) {
      this.createLengthMenu(leftSection);
    }

    // Center: Buttons
    const centerSection = createElement("div", {
      className: "toolbar-center",
    });

    if (this.options.buttons.length) {
      this.createButtons(centerSection);
    }

    // Right: Search
    const rightSection = createElement("div", {
      className: "toolbar-right",
    });

    if (this.options.searching) {
      this.createSearchBox(rightSection);
    }

    this.toolbar.appendChild(leftSection);
    this.toolbar.appendChild(centerSection);
    this.toolbar.appendChild(rightSection);
    this.wrapper.insertBefore(this.toolbar, this.element);

    // Advanced filters handled by FilterPanel component
  }

  /**
   * Create length menu (entries per page)
   */
  createLengthMenu(container) {
    const lengthContainer = createElement("div", {
      className: "modern-table-length d-flex align-items-center gap-2",
    });

    const label = createElement("span", {
      className: "text-muted small",
      textContent: "Show",
    });

    this.lengthSelect = createElement("select", {
      className: `${this.classes.select} form-select-sm`,
      style: "width: auto; min-width: 70px;",
    });

    // Add options
    this.options.lengthMenu.forEach((value) => {
      const option = createElement("option", {
        value: value,
        textContent: value === -1 ? "All" : value,
      });

      // Set selected option
      if (value === this.options.pageLength) {
        option.selected = true;
      }

      this.lengthSelect.appendChild(option);
    });

    // Add event listener immediately
    this.lengthSelect.addEventListener("change", (e) => {
      const newLength = parseInt(e.target.value);
      this.changePageLength(newLength);
    });

    const entriesLabel = createElement("span", {
      className: "text-muted small",
      textContent: "entries",
    });

    lengthContainer.appendChild(label);
    lengthContainer.appendChild(this.lengthSelect);
    lengthContainer.appendChild(entriesLabel);
    container.appendChild(lengthContainer);
  }

  /**
   * Create search box
   */
  createSearchBox(container) {
    const searchContainer = createElement("div", {
      className: "modern-table-search position-relative",
    });

    this.searchInput = createElement("input", {
      type: "text",
      className: `${this.classes.input} form-control-sm`,
      placeholder: "Search...",
    });

    const clearBtn = createElement("button", {
      type: "button",
      className: "btn btn-sm position-absolute",
      innerHTML: "&times;",
      style:
        "right: 5px; top: 50%; transform: translateY(-50%); border: none; background: none; display: none; z-index: 10;",
    });

    // Show/hide clear button based on input value
    this.searchInput.addEventListener("input", (e) => {
      clearBtn.style.display = e.target.value ? "block" : "none";
    });

    // Clear search on button click
    clearBtn.addEventListener("click", () => {
      this.searchInput.value = "";
      clearBtn.style.display = "none";
      this.search("");
    });

    searchContainer.appendChild(this.searchInput);
    searchContainer.appendChild(clearBtn);
    container.appendChild(searchContainer);
  }

  /**
   * Create buttons
   */
  createButtons(container) {
    this.options.buttons.forEach((buttonConfig) => {
      const button = this.createButton(buttonConfig);
      container.appendChild(button);
    });
  }

  /**
   * Create individual button
   */
  createButton(config) {
    if (typeof config === "string") {
      config = this.getBuiltinButton(config);
    }

    // Handle extend property - merge with built-in button
    if (config.extend && typeof config.extend === "string") {
      const builtinConfig = this.getBuiltinButton(config.extend);

      // Smart merge: if custom text doesn't have icon but built-in does, preserve built-in text
      if (config.text && builtinConfig.text) {
        const customHasIcon =
          config.text.includes("<i class=") || config.text.includes("fa-");
        const builtinHasIcon =
          builtinConfig.text.includes("<i class=") ||
          builtinConfig.text.includes("fa-");

        // If built-in has icon but custom doesn't, add icon to custom text
        if (builtinHasIcon && !customHasIcon) {
          const iconMatch = builtinConfig.text.match(
            /<i class="[^"]*"><\/i>\s*/
          );
          if (iconMatch) {
            config.text = iconMatch[0] + config.text;
          }
        }
      }

      // Merge built-in config with custom config (custom overrides built-in)
      config = { ...builtinConfig, ...config };
    }
    // Handle custom buttons with recognizable class names (add icons if missing)
    else if (config.text && config.className) {
      const textHasIcon =
        config.text.includes("<i class=") || config.text.includes("fa-");
      const hasFontAwesome =
        document.body.classList.contains("fontawesome-loaded");

      if (!textHasIcon && hasFontAwesome) {
        // Map class names to icons
        const iconMap = {
          "btn-print": '<i class="fas fa-print"></i>',
          "btn-copy": '<i class="fas fa-copy"></i>',
          "btn-csv": '<i class="fas fa-file-csv"></i>',
          "btn-excel": '<i class="fas fa-file-excel"></i>',
          "btn-pdf": '<i class="fas fa-file-pdf"></i>',
          "btn-download": '<i class="fas fa-download"></i>',
          "btn-upload": '<i class="fas fa-upload"></i>',
          "btn-delete": '<i class="fas fa-trash"></i>',
          "btn-edit": '<i class="fas fa-edit"></i>',
          "btn-add": '<i class="fas fa-plus"></i>',
        };

        // Find matching icon based on class name
        for (const [className, icon] of Object.entries(iconMap)) {
          if (config.className.includes(className)) {
            config.text = icon + " " + config.text;
            break;
          }
        }
      }
    }

    const buttonAttrs = {
      type: "button",
      className: config.className || `${this.classes.buttonSecondary} btn-sm`,
      innerHTML: config.text || config.extend || "Button",
    };

    // Add custom attributes if provided
    if (config.attr) {
      Object.assign(buttonAttrs, config.attr);
    }

    const button = createElement("button", buttonAttrs);

    // Prioritize extend over action (for export buttons with column filtering)
    if (
      config.extend &&
      ["csv", "excel", "pdf", "print", "copy"].includes(config.extend)
    ) {
      // Handle built-in export actions with exportColumns support
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleExportAction(config.extend, config);
      });
    } else if (config.action) {
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        config.action(e, this, button, config);
      });
    }

    // Execute init callback if provided
    if (config.init && typeof config.init === "function") {
      config.init(this, button, config);
    }

    return button;
  }

  /**
   * Get built-in button configuration
   */
  getBuiltinButton(type) {
    // Check if Font Awesome is available - improved detection
    const hasFontAwesome =
      document.body.classList.contains("fontawesome-loaded") ||
      document.querySelector('link[href*="font-awesome"]') ||
      document.querySelector('link[href*="fontawesome"]') ||
      document.querySelector(".fas, .far, .fab") ||
      window.FontAwesome;

    const buttons = {
      copy: {
        text: hasFontAwesome ? '<i class="fas fa-copy"></i> Copy' : "Copy",
        className: "btn btn-secondary btn-sm btn-copy",
        action: () => this.plugins.export?.copyToClipboard(),
      },
      csv: {
        text: hasFontAwesome ? '<i class="fas fa-file-csv"></i> CSV' : "CSV",
        className: "btn btn-success btn-sm btn-csv",
        action: () => this.plugins.export?.exportCSV(),
      },
      excel: {
        text: hasFontAwesome
          ? '<i class="fas fa-file-excel"></i> Excel'
          : "Excel",
        className: "btn btn-warning btn-sm btn-excel",
        action: () => this.plugins.export?.exportExcel(),
      },
      pdf: {
        text: hasFontAwesome ? '<i class="fas fa-file-pdf"></i> PDF' : "PDF",
        className: "btn btn-danger btn-sm btn-pdf",
        action: () => this.plugins.export?.exportPDF(),
      },
      print: {
        text: hasFontAwesome ? '<i class="fas fa-print"></i> Print' : "Print",
        className: "btn btn-info btn-sm btn-print",
        action: () => this.plugins.export?.print(),
      },
      colvis: {
        text: hasFontAwesome
          ? '<i class="fas fa-columns"></i> Columns'
          : "Columns",
        className: "btn btn-outline-secondary btn-sm btn-columns",
        action: () => this.toggleColumnVisibility(),
        attr: { "data-action": "colvis" },
      },
      shortcuts: {
        text: hasFontAwesome ? '<i class="fas fa-keyboard"></i>' : "Shortcuts",
        className: "btn btn-outline-secondary btn-sm btn-keyboard",
        action: () => this.showKeyboardShortcuts(),
        attr: {
          title: "Keyboard Shortcuts (Ctrl+H)",
        },
      },
    };

    return buttons[type] || { text: type };
  }

  /**
   * Create table structure
   */
  createTableStructure() {
    // Preserve original classes and add modern-table
    this.element.className = `${this.originalClasses} modern-table`;

    // Create thead if not exists
    if (!this.element.querySelector("thead")) {
      const thead = createElement("thead");
      this.element.appendChild(thead);
    }

    // Create tbody if not exists
    if (!this.element.querySelector("tbody")) {
      const tbody = createElement("tbody");
      this.element.appendChild(tbody);
    }

    this.thead = this.element.querySelector("thead");
    this.tbody = this.element.querySelector("tbody");

    // Create header
    this.createHeader();
  }

  /**
   * Create table header
   */
  createHeader() {
    const headerRow = createElement("tr");

    // Selection column
    if (this.options.select) {
      const th = createElement("th", {
        className: "select-checkbox text-center",
        style: "width: 40px;",
      });

      if (this.options.selectMultiple) {
        const checkbox = createElement("input", {
          type: "checkbox",
          className: "form-check-input select-all-checkbox",
        });
        th.appendChild(checkbox);
      }

      headerRow.appendChild(th);
    }

    // Data columns
    this.options.columns.forEach((column, index) => {
      const th = createElement("th", {
        "data-column": index,
        className: column.headerClassName || "",
      });

      if (column.headerStyle) {
        th.style.cssText = column.headerStyle;
      }

      if (column.headerId) {
        th.id = column.headerId;
      }

      // Column title (supports HTML)
      th.innerHTML = column.title || column.data;

      // Add sorting if enabled
      if (this.options.ordering && column.orderable !== false) {
        addClass(th, "sortable");
        th.style.cursor = "pointer";

        // Support both Font Awesome and CSS icons
        const hasFontAwesome =
          document.querySelector('link[href*="font-awesome"]') ||
          document.querySelector('link[href*="fontawesome"]');

        if (hasFontAwesome) {
          th.innerHTML += ' <i class="fas fa-sort sort-icon"></i>';
        } else {
          th.innerHTML += ' <span class="sort-icon"></span>';
        }

        // Add body classes for CSS priority
        this.detectFrameworks();
      }

      headerRow.appendChild(th);
    });

    // Clear existing header and add new one
    this.thead.innerHTML = "";
    this.thead.appendChild(headerRow);

    // Add column search row if enabled
    if (this.options.columnSearch) {
      this.createColumnSearchRow();
    }
  }

  /**
   * Create column search row
   */
  createColumnSearchRow() {
    const searchRow = createElement("tr", {
      className: "column-search-row",
    });

    // Selection column
    if (this.options.select) {
      const th = createElement("th", {
        className: "text-center",
        style: "padding: 8px;",
      });
      searchRow.appendChild(th);
    }

    // Data columns
    this.options.columns.forEach((column, index) => {
      const th = createElement("th", {
        style: "padding: 4px 8px;",
      });

      // Skip search for non-searchable columns
      if (
        column.searchable === false ||
        column.data === "DT_RowIndex" ||
        column.data === "action"
      ) {
        searchRow.appendChild(th);
        return;
      }

      // Create search input
      const searchInput = createElement("input", {
        type: "text",
        className: "form-control form-control-sm column-search-input",
        placeholder: `Search ${column.title || column.data}...`,
        "data-column": index,
        style: "box-sizing: border-box; min-width: 80px;",
      });

      // Add event listener with debounce
      searchInput.addEventListener(
        "input",
        debounce((e) => {
          this.searchColumn(index, e.target.value);
        }, this.options.searchDelay)
      );

      th.appendChild(searchInput);
      searchRow.appendChild(th);
    });

    this.thead.appendChild(searchRow);

    // Sync input widths with header columns after DOM is ready
    setTimeout(() => {
      this.syncColumnSearchWidths();
    }, 100);
  }

  /**
   * Sync column search input widths with header columns
   */
  syncColumnSearchWidths() {
    const headerCells = this.thead.querySelectorAll("tr:first-child th");
    const searchInputs = this.thead.querySelectorAll(".column-search-input");

    searchInputs.forEach((input, index) => {
      const columnIndex = parseInt(input.dataset.column);
      let headerIndex = columnIndex;

      // Adjust for selection column
      if (this.options.select) {
        headerIndex = columnIndex + 1;
      }

      const headerCell = headerCells[headerIndex];
      if (headerCell) {
        const headerWidth = headerCell.offsetWidth;
        const padding = 16; // 8px left + 8px right padding
        input.style.width = Math.max(headerWidth - padding, 80) + "px";
      }
    });
  }

  /**
   * Search specific column
   */
  searchColumn(columnIndex, searchTerm) {
    // Initialize column searches if not exists
    if (!this.columnSearches) {
      this.columnSearches = {};
    }

    // Update column search value
    this.columnSearches[columnIndex] = searchTerm;

    // Reset to first page
    this.currentPage = 1;

    // Save state
    if (this.stateManager && this.stateManager.isEnabled()) {
      this.stateManager.save();
    }

    // Reload data
    if (this.isClientSide) {
      this.processClientSideData();
    } else {
      this.loadData();
    }
  }

  /**
   * Get column search value
   */
  getColumnSearchValue(columnIndex) {
    return this.columnSearches ? this.columnSearches[columnIndex] : "";
  }

  /**
   * Clear all column searches
   */
  clearColumnSearches() {
    this.columnSearches = {};

    // Clear input values
    const searchInputs = findAll(".column-search-input", this.thead);
    searchInputs.forEach((input) => {
      input.value = "";
    });

    // Reload data
    if (this.isClientSide) {
      this.processClientSideData();
    } else {
      this.loadData();
    }
  }

  /**
   * Create pagination
   */
  createPagination() {
    if (!this.options.paging) return;

    this.paginationContainer = createElement("div", {
      className:
        "modern-table-pagination d-flex justify-content-between align-items-center mt-3",
    });

    // Info text
    this.infoElement = createElement("div", {
      className: "modern-table-info text-muted",
    });

    // Pagination controls
    this.paginationElement = createElement("nav");

    this.paginationContainer.appendChild(this.infoElement);
    this.paginationContainer.appendChild(this.paginationElement);

    this.wrapper.appendChild(this.paginationContainer);
  }

  /**
   * Create loading overlay
   */
  createLoadingOverlay() {
    this.loadingOverlay = createElement("div", {
      className: "modern-table-loading",
    });

    const spinner = createElement("div", {
      className: "text-primary",
      innerHTML: '<span class="visually-hidden">Loading...</span>',
    });

    this.loadingOverlay.appendChild(spinner);
    this.wrapper.style.position = "relative";
    this.wrapper.appendChild(this.loadingOverlay);
  }

  /**
   * Initialize components and plugins - FULL FEATURES
   */
  initializeComponents() {
    this.components = {};
    this.plugins = {};

    // Initialize all plugins for fair comparison
    if (this.options.filters && this.options.filters.length > 0) {
      this.components.filterPanel = new FilterPanel(this);
    }

    if (this.options.buttons && this.options.buttons.length > 0) {
      this.plugins.export = new ExportPlugin(this);
    }
    if (this.options.select) {
      this.plugins.selection = new SelectionPlugin(this);
    }
    if (this.options.ordering) {
      this.plugins.sorting = new SortingPlugin(this);
    }
    if (this.options.responsive) {
      try {
        this.plugins.responsive = new ResponsivePlugin(this);
      } catch (error) {
        console.warn("ResponsivePlugin failed:", error);
        this.options.responsive = false;
      }
    }
    if (this.options.theme) {
      try {
        this.plugins.theme = new ThemePlugin(this);
        this.plugins.theme.setTheme(this.options.theme);
      } catch (error) {
        console.warn("ThemePlugin failed:", error);
      }
    }
    if (this.options.keyboard) {
      try {
        this.plugins.keyboard = new KeyboardPlugin(this);
      } catch (error) {
        console.warn("KeyboardPlugin failed:", error);
      }
    }
    if (this.options.accessibility) {
      try {
        this.plugins.accessibility = new AccessibilityPlugin(this);
      } catch (error) {
        console.warn("AccessibilityPlugin failed:", error);
      }
    }
    if (this.options.fixedColumns) {
      try {
        this.plugins.fixedColumns = new FixedColumnsPlugin(this);
      } catch (error) {
        console.warn("FixedColumnsPlugin failed:", error);
      }
    }
  }

  /**
   * Attach event listeners
   */
  attachEvents() {
    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener("input", (e) => {
        this.search(e.target.value);
      });
    }

    // Length menu event listener sudah dipasang di createLengthMenu()

    // Column sorting (menggunakan SortingPlugin)
    if (this.options.ordering && this.plugins.sorting) {
      this.thead.addEventListener("click", (e) => {
        const th = e.target.closest("th[data-column]");
        if (th && th.classList.contains("sortable")) {
          const columnIndex = parseInt(th.dataset.column);
          this.plugins.sorting.toggleSort(columnIndex);
        }
      });
    }

    // Row selection (menggunakan SelectionPlugin)
    if (this.options.select && this.plugins.selection) {
      // Use event delegation for row checkboxes (works after data loads)
      this.tbody.addEventListener("change", (e) => {
        if (e.target.classList.contains("row-checkbox")) {
          this.plugins.selection.toggleRowSelection(e.target.closest("tr"));
        }
      });

      // Select all checkbox
      const selectAllCheckbox = find(".select-all-checkbox", this.thead);
      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", (e) => {
          this.plugins.selection.toggleAllSelection(e.target.checked);
        });
      }
    }

    // Row click event
    if (this.options.onRowClick) {
      this.tbody.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        if (row && row.dataset.index !== undefined) {
          const rowIndex = parseInt(row.dataset.index);
          const rowData = this.data[rowIndex];
          if (rowData) {
            this.options.onRowClick(rowData, rowIndex, e);
          }
        }
      });
    }
  }

  /**
   * Load all data for client-side processing (like DataTables default)
   */
  async loadAllDataForClientSide() {
    const apiUrl =
      typeof this.apiClient.config === "string"
        ? this.apiClient.config
        : this.apiClient.config?.url;
    if (!apiUrl) {
      console.error("No API URL configured");
      return;
    }

    try {
      this.showLoading(true);

      // Fetch all data at once (like DataTables client-side)
      const response = await this.apiClient.request({});

      if (response.success !== false) {
        // Store all data for client-side processing
        if (Array.isArray(response)) {
          this.originalData = response;
        } else if (response.data) {
          this.originalData = response.data;
        } else {
          // Handle dataSrc transformation
          this.originalData = response;
        }

        this.data = [...this.originalData];
        this.totalRecords = this.originalData.length;

        // Process client-side
        this.processClientSideData();
      } else {
        throw new Error(response.message || "API returned error");
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      this.showError(error.message);
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Load data from API (server-side processing)
   */
  async loadData() {
    const apiUrl =
      typeof this.apiClient.config === "string"
        ? this.apiClient.config
        : this.apiClient.config?.url;
    if (!apiUrl) {
      // Skip API loading if no URL configured (for static data)
      if (this.data && this.data.length > 0) {
        this.renderData();
        this.updatePagination();
        this.updateInfo();
        return;
      }
      console.error("No API URL configured. Config:", this.apiClient.config);
      this.showError("API URL not configured");
      return;
    }

    try {
      this.showLoading(true);

      const params = this.buildRequestParams();
      const response = await this.apiClient.request(params);

      if (response.success !== false) {
        this.processResponse(response);
        this.renderData();
        this.updatePagination();
        this.updateInfo();

        this.emit("dataLoaded", this.data, {
          total: this.totalRecords,
          filtered: this.filteredRecords,
          current_page: this.currentPage,
          last_page: this.totalPages,
        });
        // Emit initComplete event
        this.emit("initComplete", this.data, {
          total: this.totalRecords,
          filtered: this.filteredRecords,
          current_page: this.currentPage,
          last_page: this.totalPages,
        });

        if (this.options.initComplete) {
          this.options.initComplete(this.data, {
            total: this.totalRecords,
            filtered: this.filteredRecords,
            current_page: this.currentPage,
            last_page: this.totalPages,
          });
        }

        // Call preDrawCallback before rendering
        if (this.options.preDrawCallback) {
          this.options.preDrawCallback({
            data: this.data,
            recordsTotal: this.totalRecords,
            recordsFiltered: this.filteredRecords,
          });
        }

        // Call drawCallback after table is drawn
        if (this.options.drawCallback) {
          this.options.drawCallback({
            data: this.data,
            recordsTotal: this.totalRecords,
            recordsFiltered: this.filteredRecords,
          });
        }

        // Apply column visibility after data is fully loaded
        setTimeout(() => {
          this.applyAllColumnVisibility();
        }, 50);
      } else {
        throw new Error(response.message || "API returned error");
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      this.showError(error.message);
      this.emit("error", error);
      if (this.options.onError) {
        this.options.onError(error);
      }
    } finally {
      this.showLoading(false);
    }
  }

  /**
   * Build request parameters - DataTables Compatible
   */
  buildRequestParams() {
    // Initialize draw counter if not exists
    if (!this.drawCounter) this.drawCounter = 0;
    this.drawCounter++;

    // DataTables format parameters
    const params = {
      draw: this.drawCounter,
      start: (this.currentPage - 1) * this.options.pageLength,
      length: this.options.pageLength,
    };

    // Add columns info (DataTables format - exact same as DataTables)
    params.columns = this.options.columns.map((col, index) => {
      const columnSearchValue = this.getColumnSearchValue(index) || "";

      return {
        data: col.data,
        name: col.name || col.data,
        searchable: col.searchable !== false,
        orderable: col.orderable !== false,
        search: {
          value: columnSearchValue,
          regex: false,
        },
      };
    });

    // Add search (DataTables format - exact same as DataTables)
    const searchTerm =
      this.searchInput?.value?.trim() || this.stateManager?.pendingSearch || "";
    params.search = {
      value: searchTerm || "",
      regex: false,
    };

    // Add ordering (DataTables format - exact same as DataTables)
    const currentSort = this.plugins?.sorting?.getCurrentSort();
    if (currentSort) {
      params.order = [
        {
          column: currentSort.column,
          dir: currentSort.dir,
        },
      ];
    } else {
      params.order = [];
    }

    // Add filters as additional parameters (ModernTable enhancement)
    const filters = this.components?.filterPanel?.getFilters();
    if (filters && Object.keys(filters).length > 0) {
      params.filters = filters;
    }

    return params;
  }

  /**
   * Process API response - DataTables Compatible + Enhanced
   */
  processResponse(response) {
    // DataTables format (primary)
    if (response.recordsTotal !== undefined) {
      this.data = response.data || [];
      this.totalRecords = response.recordsTotal;
      this.filteredRecords = response.recordsFiltered || response.recordsTotal;

      // Calculate pagination from DataTables format
      this.totalPages = Math.ceil(
        this.filteredRecords / this.options.pageLength
      );

      // Current page is already set in this.currentPage (from goToPage or initial)
      // No need to calculate from response since DataTables doesn't return current page
    }
    // ModernTable format (fallback)
    else if (response.data) {
      this.data = response.data;
      this.totalRecords = response.meta?.total || response.data.length;
      this.filteredRecords = response.meta?.filtered || this.totalRecords;
      this.currentPage = response.meta?.current_page || 1;
      this.totalPages =
        response.meta?.last_page ||
        Math.ceil(this.filteredRecords / this.options.pageLength);
    }
    // Array format (simple)
    else if (Array.isArray(response)) {
      this.data = response;
      this.totalRecords = response.length;
      this.filteredRecords = response.length;
      this.totalPages = Math.ceil(response.length / this.options.pageLength);
    } else {
      throw new Error("Invalid response format");
    }

    // Handle optional ModernTable enhancements
    if (response.success === false) {
      throw new Error(response.message || "Server returned error");
    }

    // Store message for potential display
    this.lastMessage = response.message;
  }

  /**
   * Render table data - OPTIMIZED with DocumentFragment
   */
  renderData() {
    // Call preDrawCallback before rendering
    if (this.options.preDrawCallback) {
      const result = this.options.preDrawCallback({
        data: this.data,
        recordsTotal: this.totalRecords,
        recordsFiltered: this.filteredRecords,
      });
      // If preDrawCallback returns false, cancel rendering
      if (result === false) {
        return;
      }
    }

    if (!this.data || this.data.length === 0) {
      this.showNoData();
      return;
    }

    // Use DocumentFragment for batch DOM operations
    const fragment = document.createDocumentFragment();

    // Batch row creation
    this.data.forEach((rowData, index) => {
      const row = this.createRow(rowData, index);
      fragment.appendChild(row);
    });

    // Single DOM update
    this.tbody.innerHTML = "";
    this.tbody.appendChild(fragment);

    // Apply column visibility immediately
    this.applyAllColumnVisibility();

    // Setup responsive layout
    if (this.plugins.responsive) {
      this.plugins.responsive.updateAfterDataLoad();
    }

    // Call rowCallback for each row
    if (this.options.rowCallback) {
      const rows = this.tbody.querySelectorAll("tr");
      rows.forEach((row, index) => {
        if (this.data[index]) {
          this.options.rowCallback(row, this.data[index], index);
        }
      });
    }

    // Call headerCallback if header exists
    if (this.options.headerCallback && this.thead) {
      this.options.headerCallback(
        this.thead,
        this.data,
        (this.currentPage - 1) * this.options.pageLength,
        Math.min(
          this.currentPage * this.options.pageLength,
          this.filteredRecords
        ),
        this.data.map((_, index) => index)
      );
    }

    // Call drawCallback after rendering
    if (this.options.drawCallback) {
      this.options.drawCallback({
        data: this.data,
        recordsTotal: this.totalRecords,
        recordsFiltered: this.filteredRecords,
      });
    }

    // Sync column search widths after rendering
    if (this.options.columnSearch) {
      setTimeout(() => {
        this.syncColumnSearchWidths();
      }, 50);
    }

    // Call footerCallback if footer exists
    if (this.options.footerCallback && this.element.querySelector("tfoot")) {
      const tfoot = this.element.querySelector("tfoot");
      this.options.footerCallback(
        tfoot,
        this.data,
        (this.currentPage - 1) * this.options.pageLength,
        Math.min(
          this.currentPage * this.options.pageLength,
          this.filteredRecords
        ),
        this.data.map((_, index) => index)
      );
    }
  }

  /**
   * Create table row - OPTIMIZED with innerHTML building
   */
  createRow(rowData, index) {
    let rowHTML = "";

    // Selection column
    if (this.options.select) {
      rowHTML +=
        '<td class="select-checkbox text-center"><input type="checkbox" class="form-check-input row-checkbox"></td>';
    }

    // Data columns
    this.options.columns.forEach((column) => {
      let cellValue = this.getCellValue(rowData, column.data);

      // Special handling for DT_RowIndex
      if (column.data === "DT_RowIndex") {
        const start = (this.currentPage - 1) * this.options.pageLength + 1;
        cellValue = start + index;
      }

      // Apply render function
      if (column.render) {
        if (typeof column.render === "function") {
          cellValue = column.render(cellValue, "display", rowData, {
            row: index,
            col: 0,
          });
        } else if (typeof column.render === "string") {
          cellValue = this.applyBuiltinRenderer(cellValue, column.render);
        }
      }

      // Build cell HTML
      let cellAttrs = "";
      if (column.className) cellAttrs += ` class="${column.className}"`;
      if (column.style) cellAttrs += ` style="${column.style}"`;
      if (column.id) cellAttrs += ` id="${column.id}-${rowData.id || index}"`;

      rowHTML += `<td${cellAttrs}>${cellValue || ""}</td>`;
    });

    // Create row element with innerHTML (faster than DOM manipulation)
    const row = document.createElement("tr");
    row.setAttribute("data-index", index);
    row.innerHTML = rowHTML;

    // Call createdRow callback when row DOM element is created
    if (this.options.createdRow) {
      this.options.createdRow(row, rowData, index);
    }

    return row;
  }

  /**
   * Get cell value from row data
   */
  getCellValue(rowData, dataPath) {
    if (!dataPath) return "";

    // Handle nested properties (e.g., 'user.name')
    return dataPath.split(".").reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : "";
    }, rowData);
  }

  /**
   * Apply built-in renderers
   */
  applyBuiltinRenderer(value, type) {
    switch (type) {
      case "badge":
        const badgeClass = value === "active" ? "success" : "secondary";
        return `<span class="badge bg-${badgeClass}">${value}</span>`;
      case "date":
        return new Date(value).toLocaleDateString();
      case "currency":
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      case "boolean":
        return value ? "Yes" : "No";
      default:
        return value;
    }
  }

  /**
   * Show loading state
   */
  showLoading(show = true) {
    this.isLoading = show;
    if (this.loadingOverlay) {
      this.loadingOverlay.style.display = show ? "flex" : "none";
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    this.tbody.innerHTML = `
            <tr>
                <td colspan="${this.getTotalColumns()}" class="text-center text-danger p-4">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error: ${message}
                </td>
            </tr>
        `;
  }

  /**
   * Show no data message
   */
  showNoData() {
    this.tbody.innerHTML = `
            <tr>
                <td colspan="${this.getTotalColumns()}" class="text-center text-muted p-4">
                    <i class="fas fa-inbox me-2"></i>
                    ${this.options.language.noData}
                </td>
            </tr>
        `;
  }

  /**
   * Get total number of columns
   */
  getTotalColumns() {
    let count = this.options.columns.length;
    if (this.options.select) count++;
    return count;
  }

  /**
   * Update pagination
   */
  updatePagination() {
    if (!this.options.paging || !this.paginationElement) return;

    const pagination = createElement("ul", {
      className: `${this.classes.pagination} pagination-sm mb-0`,
    });

    // First button (large desktop only)
    const isMobile = window.innerWidth <= 768;
    if (this.totalPages > 7) {
      const firstItem = createElement("li", {
        className: `${this.classes.pageItem} page-first ${
          this.currentPage <= 1 ? "disabled" : ""
        }`,
      });

      const firstLink = createElement("a", {
        className: this.classes.pageLink,
        href: "#",
        innerHTML: this.options.language.paginate.first,
      });

      if (this.currentPage > 1) {
        firstLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.goToPage(1);
        });
      }

      firstItem.appendChild(firstLink);
      pagination.appendChild(firstItem);
    }

    // Previous button
    const prevItem = createElement("li", {
      className: `${this.classes.pageItem} ${
        this.currentPage <= 1 ? "disabled" : ""
      }`,
    });

    const prevText = isMobile ? "‹" : this.options.language.paginate.previous;
    const prevLink = createElement("a", {
      className: this.classes.pageLink,
      href: "#",
      innerHTML: prevText,
    });

    if (this.currentPage > 1) {
      prevLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.goToPage(this.currentPage - 1);
      });
    }

    prevItem.appendChild(prevLink);
    pagination.appendChild(prevItem);

    // Page numbers with ellipsis
    this.createPageNumbers(pagination);

    // Next button
    const nextItem = createElement("li", {
      className: `${this.classes.pageItem} ${
        this.currentPage >= this.totalPages ? "disabled" : ""
      }`,
    });

    const nextText = isMobile ? "›" : this.options.language.paginate.next;
    const nextLink = createElement("a", {
      className: this.classes.pageLink,
      href: "#",
      innerHTML: nextText,
    });

    if (this.currentPage < this.totalPages) {
      nextLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.goToPage(this.currentPage + 1);
      });
    }

    nextItem.appendChild(nextLink);
    pagination.appendChild(nextItem);

    // Last button (large desktop only)
    if (this.totalPages > 7) {
      const lastItem = createElement("li", {
        className: `${this.classes.pageItem} page-last ${
          this.currentPage >= this.totalPages ? "disabled" : ""
        }`,
      });

      const lastLink = createElement("a", {
        className: this.classes.pageLink,
        href: "#",
        innerHTML: this.options.language.paginate.last,
      });

      if (this.currentPage < this.totalPages) {
        lastLink.addEventListener("click", (e) => {
          e.preventDefault();
          this.goToPage(this.totalPages);
        });
      }

      lastItem.appendChild(lastLink);
      pagination.appendChild(lastItem);
    }

    // Update pagination element
    this.paginationElement.innerHTML = "";
    this.paginationElement.appendChild(pagination);
  }

  /**
   * Create page numbers with responsive design
   */
  createPageNumbers(pagination) {
    const current = this.currentPage;
    const total = this.totalPages;
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Mobile: Show minimal pagination (max 3 page numbers)
      if (total <= 3) {
        // Show all pages if 3 or fewer on mobile
        for (let i = 1; i <= total; i++) {
          this.createPageItem(pagination, i, i === current);
        }
      } else {
        // Mobile: Show only current page +/- 1 (max 3 numbers)
        let start, end;

        if (current === 1) {
          start = 1;
          end = Math.min(3, total);
        } else if (current === total) {
          start = Math.max(1, total - 2);
          end = total;
        } else {
          start = Math.max(1, current - 1);
          end = Math.min(total, current + 1);
        }

        // Only show first page if we're not starting from 1
        if (start > 1) {
          this.createPageItem(pagination, 1, false);
          if (start > 2) {
            this.createEllipsis(pagination);
          }
        }

        // Show the range
        for (let i = start; i <= end; i++) {
          this.createPageItem(pagination, i, i === current);
        }

        // Only show last page if we're not ending at total
        if (end < total) {
          if (end < total - 1) {
            this.createEllipsis(pagination);
          }
          this.createPageItem(pagination, total, false);
        }
      }
    } else {
      // Desktop: Simplified pagination to prevent wrapping
      if (total <= 5) {
        // Show all pages if 5 or fewer
        for (let i = 1; i <= total; i++) {
          this.createPageItem(pagination, i, i === current);
        }
      } else {
        // Simplified pagination with ellipsis
        if (current <= 3) {
          // Show: 1 2 3 4 ... last
          for (let i = 1; i <= 4; i++) {
            this.createPageItem(pagination, i, i === current);
          }
          this.createEllipsis(pagination);
          this.createPageItem(pagination, total, false);
        } else if (current >= total - 2) {
          // Show: 1 ... (total-3) (total-2) (total-1) total
          this.createPageItem(pagination, 1, false);
          this.createEllipsis(pagination);
          for (let i = total - 3; i <= total; i++) {
            this.createPageItem(pagination, i, i === current);
          }
        } else {
          // Show: 1 ... (current-1) current (current+1) ... total
          this.createPageItem(pagination, 1, false);
          this.createEllipsis(pagination);
          for (let i = current - 1; i <= current + 1; i++) {
            this.createPageItem(pagination, i, i === current);
          }
          this.createEllipsis(pagination);
          this.createPageItem(pagination, total, false);
        }
      }
    }
  }

  /**
   * Create individual page item
   */
  createPageItem(pagination, pageNum, isActive) {
    const pageItem = createElement("li", {
      className: `${this.classes.pageItem} ${isActive ? "active" : ""}`,
    });

    const pageLink = createElement("a", {
      className: this.classes.pageLink,
      href: "#",
      textContent: pageNum,
    });

    if (!isActive) {
      pageLink.addEventListener("click", (e) => {
        e.preventDefault();
        this.goToPage(pageNum);
      });
    }

    pageItem.appendChild(pageLink);
    pagination.appendChild(pageItem);
  }

  /**
   * Create ellipsis item
   */
  createEllipsis(pagination) {
    const ellipsisItem = createElement("li", {
      className: `${this.classes.pageItem} disabled`,
    });

    const ellipsisLink = createElement("span", {
      className: this.classes.pageLink,
      textContent: "...",
    });

    ellipsisItem.appendChild(ellipsisLink);
    pagination.appendChild(ellipsisItem);
  }

  /**
   * Update info text
   */
  updateInfo() {
    if (!this.options.info || !this.infoElement) return;

    const start = (this.currentPage - 1) * this.options.pageLength + 1;
    const end = Math.min(
      this.currentPage * this.options.pageLength,
      this.filteredRecords
    );

    let infoText;

    // Use infoCallback if provided
    if (this.options.infoCallback) {
      infoText = this.options.infoCallback(
        {
          recordsTotal: this.totalRecords,
          recordsFiltered: this.filteredRecords,
          start: start,
          end: end,
          page: this.currentPage,
          pages: this.totalPages,
        },
        start,
        end,
        this.totalRecords,
        this.filteredRecords,
        ""
      );
    } else {
      // Default info text
      infoText = this.options.language.info
        .replace("_START_", start)
        .replace("_END_", end)
        .replace("_TOTAL_", this.filteredRecords);

      if (this.filteredRecords < this.totalRecords) {
        infoText +=
          " " +
          this.options.language.infoFiltered.replace(
            "_MAX_",
            this.totalRecords
          );
      }
    }

    this.infoElement.innerHTML = infoText;
  }

  /**
   * Go to specific page
   */
  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;

    // Save state after page change
    if (this.stateManager && this.stateManager.isEnabled()) {
      this.stateManager.save();
    }

    this.loadData();
  }

  /**
   * Change page length
   */
  changePageLength(length) {
    // Handle "All" option
    if (length === -1) {
      this.options.pageLength = -1;
    } else {
      this.options.pageLength = Math.max(1, length);
    }

    this.currentPage = 1; // Reset to first page

    // Save state after change
    if (this.stateManager && this.stateManager.isEnabled()) {
      this.stateManager.save();
    }

    this.loadData();
  }

  /**
   * Get selected rows (delegate to SelectionPlugin)
   */
  getSelectedRows() {
    return this.plugins.selection?.getSelectedRows() || [];
  }

  /**
   * Search functionality
   */
  search(term) {
    this.currentPage = 1; // Reset to first page

    // Update search input if provided
    if (term !== undefined && this.searchInput) {
      this.searchInput.value = term;
    }

    // Save state after search
    if (this.stateManager && this.stateManager.isEnabled()) {
      this.stateManager.save();
    }

    this.loadData();
  }

  // Sorting methods moved to SortingPlugin

  /**
   * Reload table data
   */
  reload() {
    this.loadData();
  }

  // Filter methods moved to FilterPanel component

  /**
   * Toggle column visibility (dropdown)
   */
  toggleColumnVisibility() {
    // Check if dropdown already exists and toggle
    const existingDropdown = find(".column-visibility-dropdown", this.toolbar);
    if (existingDropdown) {
      const isVisible = existingDropdown.style.display === "block";
      existingDropdown.style.display = isVisible ? "none" : "block";
      return; // Toggle existing dropdown
    }

    // Find the colvis button to position dropdown
    const colvisBtn =
      find('button[data-action="colvis"]', this.toolbar) ||
      findAll("button", this.toolbar).find((btn) =>
        btn.textContent.includes("Columns")
      );

    if (!colvisBtn) {
      return;
    }

    // Create and show dropdown
    const dropdown = this.createColumnVisibilityDropdown(colvisBtn);

    // Show dropdown
    dropdown.style.display = "block";
  }

  /**
   * Create column visibility dropdown
   */
  createColumnVisibilityDropdown(triggerBtn) {
    // Create dropdown wrapper for relative positioning
    const dropdownWrapper = createElement("div", {
      style: "position: relative; display: inline-block;",
    });

    // Wrap the button
    triggerBtn.parentNode.insertBefore(dropdownWrapper, triggerBtn);
    dropdownWrapper.appendChild(triggerBtn);

    const dropdown = createElement("div", {
      className: "column-visibility-dropdown",
      style: `
                position: absolute;
                top: 100%;
                right: 0;
                min-width: 200px;
                max-width: 250px;
                z-index: 1050;
                background-color: #fff;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                padding: 12px;
                margin-top: 2px;
                display: none;
            `,
    });

    // Header
    const header = createElement("div", {
      style:
        "display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #dee2e6;",
    });

    const title = createElement("h6", {
      style: "margin: 0; font-size: 14px; font-weight: 600;",
      textContent: "Column Visibility",
    });

    const closeBtn = createElement("button", {
      type: "button",
      innerHTML: "×",
      style:
        "background: none; border: none; font-size: 18px; cursor: pointer; padding: 0; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;",
    });

    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.style.display = "none";
    });

    header.appendChild(title);
    header.appendChild(closeBtn);
    dropdown.appendChild(header);

    // columnVisibility should already be initialized in constructor
    // Don't reset or re-initialize here

    // Create checkboxes for each column
    this.options.columns.forEach((column, index) => {
      // Skip system columns (only DT_RowIndex, allow action column)
      if (column.data === "DT_RowIndex") {
        return;
      }

      const checkDiv = createElement("div", {
        style: "margin-bottom: 4px; display: flex; align-items: center;",
      });

      // Get current visibility state from columnVisibility
      const isVisible = this.columnVisibility[index] === true;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.style.cssText = "margin-right: 8px;";
      checkbox.id = `colvis-${index}-${Date.now()}`;
      checkbox.checked = isVisible; // Direct property assignment

      const label = createElement("label", {
        for: checkbox.id,
        style: "cursor: pointer; font-size: 14px;",
        textContent: column.title || column.data,
      });

      checkbox.addEventListener("change", (e) => {
        e.stopPropagation();
        this.setColumnVisibility(index, e.target.checked);
      });

      checkDiv.appendChild(checkbox);
      checkDiv.appendChild(label);
      dropdown.appendChild(checkDiv);
    });

    // Action buttons
    const actions = createElement("div", {
      style:
        "margin-top: 8px; padding-top: 8px; border-top: 1px solid #dee2e6; display: flex; gap: 4px;",
    });

    const showAllBtn = createElement("button", {
      type: "button",
      textContent: "Show All",
    });

    const hideAllBtn = createElement("button", {
      type: "button",
      textContent: "Hide All",
    });

    showAllBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showAllColumns();
      this.updateDropdownCheckboxes(dropdown);
    });

    hideAllBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.hideAllColumns();
      this.updateDropdownCheckboxes(dropdown);
    });

    actions.appendChild(showAllBtn);
    actions.appendChild(hideAllBtn);
    dropdown.appendChild(actions);

    // Append dropdown to wrapper
    const wrapper = triggerBtn.parentNode;
    wrapper.appendChild(dropdown);

    // Close dropdown when clicking outside (with proper cleanup)
    const closeHandler = (e) => {
      if (!dropdown.contains(e.target) && !triggerBtn.contains(e.target)) {
        dropdown.style.display = "none";
        document.removeEventListener("click", closeHandler);
      }
    };

    // Add event listener after a short delay to prevent immediate closure
    setTimeout(() => {
      document.addEventListener("click", closeHandler);
    }, 100);

    return dropdown;
  }

  /**
   * Set column visibility and save state
   */
  setColumnVisibility(columnIndex, visible) {
    // Update visibility state
    this.columnVisibility[columnIndex] = visible;

    // Apply visibility to DOM
    this.applyColumnVisibility(columnIndex, visible);

    // Save state
    if (this.stateManager && this.stateManager.isEnabled()) {
      this.stateManager.save();
    }
  }

  /**
   * Apply column visibility to DOM
   */
  applyColumnVisibility(columnIndex, visible) {
    const displayValue = visible ? "" : "none";

    // Calculate actual DOM index (account for selection column)
    let domIndex = columnIndex;
    if (this.options.select) {
      domIndex = columnIndex + 1; // +1 for selection column
    }

    // Toggle header
    if (this.thead) {
      const headerCells = this.thead.querySelectorAll("th");
      if (headerCells[domIndex]) {
        headerCells[domIndex].style.display = displayValue;
      }
    }

    // Toggle body cells
    if (this.tbody) {
      const bodyRows = this.tbody.querySelectorAll("tr");
      bodyRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells[domIndex]) {
          cells[domIndex].style.display = displayValue;
        }
      });
    }
  }

  /**
   * Apply all column visibility states to current DOM
   */
  applyAllColumnVisibility() {
    if (!this.columnVisibility) return;

    Object.keys(this.columnVisibility).forEach((columnIndex) => {
      const visible = this.columnVisibility[columnIndex];
      if (visible === false) {
        // Only apply hidden columns
        this.applyColumnVisibility(parseInt(columnIndex), false);
      }
    });
  }

  /**
   * Show all columns
   */
  showAllColumns() {
    this.options.columns.forEach((column, index) => {
      if (column.data !== "DT_RowIndex") {
        this.setColumnVisibility(index, true);
      }
    });
  }

  /**
   * Hide all columns (except system columns)
   */
  hideAllColumns() {
    this.options.columns.forEach((column, index) => {
      if (column.data !== "DT_RowIndex") {
        this.setColumnVisibility(index, false);
      }
    });
  }

  /**
   * Update dropdown checkboxes to match current state
   */
  updateDropdownCheckboxes(dropdown) {
    this.options.columns.forEach((column, index) => {
      if (column.data !== "DT_RowIndex") {
        const checkboxes = findAll(".form-check-input", dropdown);
        const checkbox = checkboxes.find((cb) => {
          const label = cb.nextElementSibling;
          return label && label.textContent === (column.title || column.data);
        });

        if (checkbox) {
          checkbox.checked = this.columnVisibility[index] === true;
        }
      }
    });
  }

  /**
   * Legacy method for compatibility
   */
  toggleColumn(columnIndex, visible) {
    this.setColumnVisibility(columnIndex, visible);
  }

  // Export methods moved to ExportPlugin

  /**
   * Detect available frameworks and add body classes for CSS priority
   */
  //   detectFrameworks() {
  //     const body = document.body;

  //     // Detect Bootstrap
  //     const hasBootstrap =
  //       document.querySelector('link[href*="bootstrap"]') ||
  //       window.bootstrap ||
  //       document.querySelector(".btn, .table, .form-control");

  //     if (hasBootstrap) {
  //       body.classList.add("bootstrap-loaded");
  //     }

  //     // Detect Font Awesome
  //     const hasFontAwesome =
  //       document.querySelector('link[href*="font-awesome"]') ||
  //       document.querySelector('link[href*="fontawesome"]') ||
  //       document.querySelector(".fas, .far, .fab");

  //     if (hasFontAwesome) {
  //       body.classList.add("fontawesome-loaded");
  //     }
  //   }

  detectFrameworks() {
    // Ambil elemen utama library
    const wrapper = document.querySelector(".modern-table-wrapper");
    if (!wrapper) return; // berhenti kalau belum ada wrapper di DOM

    // === Deteksi Bootstrap ===
    const hasBootstrap =
      document.querySelector('link[href*="bootstrap"]') || !!window.bootstrap;

    wrapper.classList.toggle("bootstrap-loaded", !!hasBootstrap);
    wrapper.classList.toggle("no-bootstrap", !hasBootstrap);

    // === Deteksi Font Awesome ===
    const hasFontAwesome =
      document.querySelector('link[href*="font-awesome"]') ||
      document.querySelector('link[href*="fontawesome"]') ||
      document.querySelector(".fas, .far, .fab");

    wrapper.classList.toggle("fontawesome-loaded", !!hasFontAwesome);
    wrapper.classList.toggle("no-fontawesome", !hasFontAwesome);
  }

  /**
   * Load saved state
   */
  loadSavedState() {
    if (!this.options.stateSave) return;

    let state;

    // Use stateLoadCallback if provided
    if (this.options.stateLoadCallback) {
      state = this.options.stateLoadCallback({
        table: this,
        stateSave: this.options.stateSave,
        stateDuration: this.options.stateDuration,
      });
    } else {
      // Default state loading
      state = this.stateManager.load();
    }

    if (state) {
      this.stateManager.applySync(state);
    }
  }

  /**
   * Save current state
   */
  saveState() {
    // Use stateSaveCallback if provided
    if (this.options.stateSaveCallback) {
      const stateData = this.stateManager.getState();
      this.options.stateSaveCallback(
        {
          table: this,
          stateSave: this.options.stateSave,
          stateDuration: this.options.stateDuration,
        },
        stateData
      );
    } else {
      // Default state saving
      this.stateManager.save();
    }
  }

  /**
   * Clear saved state
   */
  clearState() {
    this.stateManager.clear();
  }

  /**
   * Public methods sesuai master plan
   */
  page(pageNumber) {
    this.goToPage(pageNumber);
  }

  clearSelection() {
    this.plugins.selection?.clearSelection();
  }

  column(index) {
    return {
      visible: (show) => this.toggleColumn(index, show),
    };
  }

  columns = {
    adjust: () => {
      // Recalculate column widths - to be implemented
    },
  };

  state = {
    save: () => this.saveState(),
    load: () => this.loadSavedState(),
    clear: () => this.clearState(),
  };

  /**
   * Custom print with full configuration
   */
  customPrint(options = {}) {
    const defaults = {
      title: "Table Report",
      subtitle: "",
      columns: null, // null = all visible columns
      excludeColumns: [],
      pageSize: "A4",
      orientation: "portrait",
      showHeader: true,
      showFooter: true,
      customCSS: "",
      beforePrint: null,
      afterPrint: null,
      customData: null,
    };

    const config = { ...defaults, ...options };

    try {
      // Get data to print
      let printData = [...this.data];

      // Apply custom data transformation
      if (config.customData && typeof config.customData === "function") {
        printData = config.customData(printData);
      }

      // Filter columns
      const columnsToShow = this.getColumnsForPrint(config);

      // Create print window with error handling
      const printWindow = window.open(
        "",
        "_blank",
        "width=800,height=600,scrollbars=yes,resizable=yes"
      );

      if (!printWindow) {
        alert("Please allow popups for this site to enable printing.");
        return;
      }

      // Generate HTML
      const html = this.generatePrintHTML(printData, columnsToShow, config);

      // Write content to print window
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // Execute beforePrint callback
      if (config.beforePrint && typeof config.beforePrint === "function") {
        try {
          config.beforePrint(printWindow);
        } catch (error) {
          console.warn("Error in beforePrint callback:", error);
        }
      }

      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          try {
            printWindow.print();

            // Execute afterPrint callback
            if (config.afterPrint && typeof config.afterPrint === "function") {
              config.afterPrint();
            }

            // Close print window after printing
            setTimeout(() => {
              if (!printWindow.closed) {
                printWindow.close();
              }
            }, 1000);
          } catch (error) {
            console.error("Error during printing:", error);
            alert("Error occurred during printing. Please try again.");
          }
        }, 500);
      };

      // Handle print window errors
      printWindow.onerror = (error) => {
        console.error("Print window error:", error);
        alert("Error loading print content. Please try again.");
      };
    } catch (error) {
      console.error("Error in customPrint:", error);
      alert("Error preparing print content. Please try again.");
    }
  }

  /**
   * Get columns for printing
   */
  getColumnsForPrint(config) {
    let columns = this.options.columns.filter((col) => {
      // Skip system columns
      if (col.data === "DT_RowIndex") return false;

      // Skip excluded columns
      if (config.excludeColumns.includes(col.data)) return false;

      // If specific columns specified, only include those
      if (config.columns && config.columns.length > 0) {
        return config.columns.includes(col.data);
      }

      // Skip hidden columns
      const columnIndex = this.options.columns.indexOf(col);
      if (this.columnVisibility[columnIndex] === false) return false;

      return true;
    });

    return columns;
  }

  /**
   * Generate HTML for printing
   */
  generatePrintHTML(data, columns, config) {
    const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${config.title}</title>
                <style>
                    @page {
                        size: ${config.pageSize} ${config.orientation};
                        margin: 1in;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #333;
                        margin: 0;
                        padding: 0;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #ddd;
                        padding-bottom: 20px;
                    }
                    
                    .print-title {
                        font-size: 24px;
                        font-weight: bold;
                        color: #2c3e50;
                        margin: 0 0 10px 0;
                    }
                    
                    .print-subtitle {
                        font-size: 14px;
                        color: #7f8c8d;
                        margin: 0;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    
                    th, td {
                        padding: 8px 12px;
                        text-align: left;
                        border: 1px solid #ddd;
                    }
                    
                    th {
                        background-color: #f8f9fa;
                        font-weight: bold;
                        color: #495057;
                    }
                    
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    
                    .print-footer {
                        text-align: center;
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        font-size: 10px;
                        color: #6c757d;
                    }
                    
                    @media print {
                        body { -webkit-print-color-adjust: exact; }
                        .no-print { display: none !important; }
                    }
                    
                    ${config.customCSS}
                </style>
            </head>
            <body>
                ${
                  config.showHeader
                    ? `
                    <div class="print-header">
                        <h1 class="print-title">${config.title}</h1>
                        ${
                          config.subtitle
                            ? `<p class="print-subtitle">${config.subtitle}</p>`
                            : ""
                        }
                    </div>
                `
                    : ""
                }
                
                <table>
                    <thead>
                        <tr>
                            ${columns
                              .map((col) => `<th>${col.title || col.data}</th>`)
                              .join("")}
                        </tr>
                    </thead>
                    <tbody>
                        ${data
                          .map(
                            (row) => `
                            <tr>
                                ${columns
                                  .map((col) => {
                                    let cellValue = this.getCellValue(
                                      row,
                                      col.data
                                    );

                                    // Apply column render function for print
                                    if (
                                      col.render &&
                                      typeof col.render === "function"
                                    ) {
                                      cellValue = col.render(
                                        cellValue,
                                        "print",
                                        row,
                                        {}
                                      );
                                    }

                                    return `<td>${cellValue || ""}</td>`;
                                  })
                                  .join("")}
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
                
                ${
                  config.showFooter
                    ? `
                    <div class="print-footer">
                        <p>Generated on ${new Date().toLocaleString()}</p>
                        <p>Total Records: ${data.length}</p>
                    </div>
                `
                    : ""
                }
            </body>
            </html>
        `;

    return html;
  }

  /**
   * Handle export action with column filtering
   */
  handleExportAction(exportType, config) {
    if (!this.plugins.export) {
      console.warn("ExportPlugin not available");
      return;
    }

    // Get columns to export
    const exportColumns = this.getExportColumns(config.exportColumns);

    // Create export options
    const exportOptions = {
      columns: exportColumns,
      filename: config.filename,
      title: config.title,
      orientation: config.orientation,
      pageSize: config.pageSize,
      sheetName: config.sheetName,
    };

    // Call appropriate export method
    switch (exportType) {
      case "csv":
        this.plugins.export.exportCSV(exportOptions);
        break;
      case "excel":
        this.plugins.export.exportExcel(exportOptions);
        break;
      case "pdf":
        this.plugins.export.exportPDF(exportOptions);
        break;
      case "print":
        this.plugins.export.print(exportOptions);
        break;
      case "copy":
        this.plugins.export.copyToClipboard(exportOptions);
        break;
      default:
        console.warn(`Unknown export type: ${exportType}`);
    }
  }

  /**
   * Get columns for export based on exportColumns configuration
   */
  getExportColumns(exportColumns) {
    if (!exportColumns) {
      // Default: all visible columns except system columns
      return this.options.columns
        .filter((col, index) => {
          // Skip system columns
          if (col.data === "DT_RowIndex") return false;
          // Skip hidden columns
          if (this.columnVisibility[index] === false) return false;
          // Skip action columns by default
          if (col.data === "action") return false;
          return true;
        })
        .map((col) => col.data);
    }

    if (exportColumns === "all") {
      // All columns including hidden ones
      return this.options.columns
        .filter((col) => col.data !== "DT_RowIndex") // Skip only system columns
        .map((col) => col.data);
    }

    if (exportColumns === "visible") {
      // Only visible columns
      return this.options.columns
        .filter((col, index) => {
          if (col.data === "DT_RowIndex") return false;
          return this.columnVisibility[index] !== false;
        })
        .map((col) => col.data);
    }

    if (Array.isArray(exportColumns)) {
      // Specific columns array
      return exportColumns;
    }

    // Fallback
    return this.options.columns.map((col) => col.data);
  }

  /**
   * Process client-side data (filtering, sorting, pagination)
   */
  processClientSideData() {
    let processedData = [...this.originalData];

    // Apply global search filter
    const searchTerm = this.searchInput?.value?.trim() || "";
    if (searchTerm) {
      processedData = processedData.filter((row) => {
        return this.options.columns.some((column) => {
          const cellValue = this.getCellValue(row, column.data);
          return String(cellValue)
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        });
      });
    }

    // Apply column-specific search filters
    if (this.columnSearches) {
      Object.keys(this.columnSearches).forEach((columnIndex) => {
        const searchValue = this.columnSearches[columnIndex];
        if (searchValue && searchValue.trim()) {
          const column = this.options.columns[columnIndex];
          if (column) {
            processedData = processedData.filter((row) => {
              const cellValue = this.getCellValue(row, column.data);
              return String(cellValue)
                .toLowerCase()
                .includes(searchValue.toLowerCase());
            });
          }
        }
      });
    }

    // Apply sorting
    const currentSort = this.plugins?.sorting?.getCurrentSort();
    if (currentSort) {
      const column = this.options.columns[currentSort.column];
      if (column) {
        processedData.sort((a, b) => {
          const aVal = this.getCellValue(a, column.data);
          const bVal = this.getCellValue(b, column.data);

          let comparison = 0;
          if (aVal < bVal) comparison = -1;
          if (aVal > bVal) comparison = 1;

          return currentSort.dir === "desc" ? -comparison : comparison;
        });
      }
    }

    // Update totals
    this.totalRecords = this.originalData.length;
    this.filteredRecords = processedData.length;
    this.totalPages = Math.ceil(this.filteredRecords / this.options.pageLength);

    // Apply pagination
    const start = (this.currentPage - 1) * this.options.pageLength;
    const end = start + this.options.pageLength;
    this.data = processedData.slice(start, end);

    // Render data
    this.renderData();
    this.updatePagination();
    this.updateInfo();

    // Emit events
    this.emit("dataLoaded", this.data, {
      total: this.totalRecords,
      filtered: this.filteredRecords,
      current_page: this.currentPage,
      last_page: this.totalPages,
    });

    if (this.options.initComplete) {
      this.options.initComplete(this.data, {
        total: this.totalRecords,
        filtered: this.filteredRecords,
        current_page: this.currentPage,
        last_page: this.totalPages,
      });
    }

    // Call preDrawCallback before rendering
    if (this.options.preDrawCallback) {
      this.options.preDrawCallback({
        data: this.data,
        recordsTotal: this.totalRecords,
        recordsFiltered: this.filteredRecords,
      });
    }

    // Call drawCallback after table is drawn
    if (this.options.drawCallback) {
      this.options.drawCallback({
        data: this.data,
        recordsTotal: this.totalRecords,
        recordsFiltered: this.filteredRecords,
      });
    }
  }

  /**
   * Add new row (client-side only)
   */
  addRow(rowData) {
    if (!this.isClientSide) {
      console.warn("addRow() only works with client-side data");
      return;
    }

    this.originalData.push(rowData);
    this.processClientSideData();
  }

  /**
   * Update existing row (client-side only)
   */
  updateRow(index, newData) {
    if (!this.isClientSide) {
      console.warn("updateRow() only works with client-side data");
      return;
    }

    if (index >= 0 && index < this.originalData.length) {
      this.originalData[index] = { ...this.originalData[index], ...newData };
      this.processClientSideData();
    }
  }

  /**
   * Remove row (client-side only)
   */
  removeRow(index) {
    if (!this.isClientSide) {
      console.warn("removeRow() only works with client-side data");
      return;
    }

    if (index >= 0 && index < this.originalData.length) {
      this.originalData.splice(index, 1);
      this.processClientSideData();
    }
  }

  /**
   * Set new data array (client-side only)
   */
  setData(newData) {
    if (!this.isClientSide) {
      console.warn("setData() only works with client-side data");
      return;
    }

    this.originalData = [...newData];
    this.data = [];
    this.currentPage = 1;
    this.processClientSideData();
  }

  /**
   * Search functionality (auto-detects client vs server-side)
   */
  search(term) {
    this.currentPage = 1; // Reset to first page

    // Update search input if provided
    if (term !== undefined && this.searchInput) {
      this.searchInput.value = term;
    }

    // Save state
    if (this.stateManager && this.stateManager.isEnabled()) {
      this.stateManager.save();
    }

    if (this.isClientSide) {
      this.processClientSideData();
    } else {
      this.loadData();
    }
  }

  /**
   * Override goToPage for client-side
   */
  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;

    this.currentPage = page;

    if (this.stateManager && this.stateManager.isEnabled()) {
      this.stateManager.save();
    }

    if (this.isClientSide) {
      this.processClientSideData();
    } else {
      this.loadData();
    }
  }

  /**
   * Override changePageLength for client-side
   */
  changePageLength(length) {
    if (length === -1) {
      this.options.pageLength = -1;
    } else {
      this.options.pageLength = Math.max(1, length);
    }

    this.currentPage = 1;

    if (this.stateManager && this.stateManager.isEnabled()) {
      this.stateManager.save();
    }

    if (this.isClientSide) {
      this.processClientSideData();
    } else {
      this.loadData();
    }
  }

  /**
   * Show keyboard shortcuts popup
   */
  showKeyboardShortcuts() {
    const shortcuts = `⌨️ KEYBOARD SHORTCUTS

📍 Navigation:
• ↑↓ Arrow Keys - Navigate rows
• Home/End - First/last row  
• Page Up/Down - Navigate pages

✅ Selection:
• Enter/Space - Select row
• Ctrl+A - Select all
• Escape - Clear selection

🔧 Actions:
• Ctrl+C - Copy selected
• Ctrl+D - Delete selected
• Ctrl+F - Focus search
• Ctrl+R - Reload table
• Ctrl+H - Show shortcuts

💡 Tips:
• Click table area first to enable navigation
• Use Shift+Arrow for multi-select`;

    // Detect dark theme from multiple sources
    let isDark = false;

    if (this.options.theme === "dark") {
      isDark = true;
    } else if (this.options.theme === "light") {
      isDark = false;
    } else if (this.options.theme === "auto") {
      // For auto theme, check data-bs-theme first, then system preference
      const htmlTheme = document.documentElement.getAttribute("data-bs-theme");
      const bodyTheme = document.body.getAttribute("data-bs-theme");

      if (htmlTheme === "dark" || bodyTheme === "dark") {
        isDark = true;
      } else if (htmlTheme === "light" || bodyTheme === "light") {
        isDark = false;
      } else {
        // Fallback to system preference
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
    } else {
      // Fallback: check wrapper class or data-bs-theme
      isDark =
        this.wrapper?.classList.contains("theme-dark") ||
        document.documentElement.getAttribute("data-bs-theme") === "dark" ||
        document.body.getAttribute("data-bs-theme") === "dark";
    }

    const bgColor = isDark ? "#212529" : "white";
    const textColor = isDark ? "#adb5bd" : "#333";
    const borderColor = isDark ? "#333333" : "#ddd";
    const shadowColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.15)";

    // Create modern popup
    const popup = createElement("div", {
      style: `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px;
                padding: 20px; box-shadow: 0 4px 20px ${shadowColor};
                z-index: 9999; max-width: 400px; font-family: monospace;
                white-space: pre-line; line-height: 1.4; color: ${textColor};
            `,
    });

    const buttonBg = isDark ? "#2d2d2d" : "none";
    const buttonColor = isDark ? "#adb5bd" : "#333";
    const contentColor = isDark ? "#adb5bd" : "#666";

    popup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="color: ${textColor};">⌨️ Keyboard Shortcuts</strong>
                <button style="border: none; background: ${buttonBg}; font-size: 18px; cursor: pointer; padding: 0; width: 24px; height: 24px; color: ${buttonColor};">×</button>
            </div>
            <div style="font-size: 13px; color: ${contentColor};">${shortcuts}</div>
        `;

    // Close handlers
    const closeBtn = popup.querySelector("button");
    closeBtn.addEventListener("click", () => popup.remove());

    popup.addEventListener("click", (e) => e.stopPropagation());

    const closeOnOutside = () => {
      popup.remove();
      document.removeEventListener("click", closeOnOutside);
    };

    const closeOnEscape = (e) => {
      if (e.key === "Escape") {
        popup.remove();
        document.removeEventListener("keydown", closeOnEscape);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", closeOnOutside);
      document.addEventListener("keydown", closeOnEscape);
    }, 100);

    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 10000);
  }

  /**
   * Destroy table instance
   */
  destroy() {
    // Save state before destroy
    if (this.options.stateSave) {
      this.saveState();
    }

    // Clean up components
    this.components.filterPanel?.destroy();

    // Remove event listeners
    // Restore original HTML
    // Clean up references
  }
}

// Make ModernTable available globally
window.ModernTable = ModernTable;
