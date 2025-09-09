// TypeScript definitions for ModernTable.js

export interface ModernTableColumn {
  data: string;
  title?: string;
  orderable?: boolean;
  searchable?: boolean;
  className?: string;
  style?: string;
  render?: (data: any, type: string, row: any, meta: any) => string;
  headerClassName?: string;
  headerStyle?: string;
}

export interface ModernTableButton {
  text?: string;
  className?: string;
  action?: (e: Event, dt: ModernTable, node: HTMLElement, config: any) => void;
  init?: (dt: ModernTable, node: HTMLElement, config: any) => void;
  destroy?: (dt: ModernTable, node: HTMLElement, config: any) => void;
  enabled?: boolean;
  attr?: Record<string, string>;
}

export interface ModernTableFilter {
  column: string;
  type: 'select' | 'text' | 'date' | 'daterange' | 'numberrange' | 'clear';
  label?: string;
  placeholder?: string;
  options?: Array<{ value: string; text: string }>;
  className?: string;
  icon?: string;
  action?: () => void;
}

export interface ModernTableOptions {
  // Data source
  api?: string;
  
  // Columns
  columns: ModernTableColumn[];
  
  // Pagination
  paging?: boolean;
  pageLength?: number;
  lengthMenu?: number[];
  
  // Search & Filter
  searching?: boolean;
  searchDelay?: number;
  
  // Sorting
  ordering?: boolean;
  order?: Array<[number, 'asc' | 'desc']>;
  
  // Selection
  select?: boolean;
  selectMultiple?: boolean;
  
  // Responsive
  responsive?: boolean;
  
  // Theme
  theme?: 'light' | 'dark' | 'auto';
  
  // Keyboard navigation
  keyboard?: boolean;
  
  // Accessibility
  accessibility?: boolean;
  
  // UI Elements
  info?: boolean;
  processing?: boolean;
  
  // Buttons
  buttons?: Array<string | ModernTableButton>;
  
  // Filters
  filters?: ModernTableFilter[];
  
  // State
  stateSave?: boolean;
  stateDuration?: number;
  
  // Language
  language?: {
    search?: string;
    lengthMenu?: string;
    info?: string;
    infoEmpty?: string;
    infoFiltered?: string;
    paginate?: {
      first?: string;
      last?: string;
      next?: string;
      previous?: string;
    };
    processing?: string;
    noData?: string;
  };
  
  // Callbacks
  onDataLoaded?: (data: any[], meta: any) => void;
  onError?: (error: Error) => void;
  onRowClick?: (row: any, index: number) => void;
  onSelectionChange?: (selectedRows: any[]) => void;
  onInit?: () => void;
}

export declare class ModernTable {
  constructor(selector: string | HTMLElement, options: ModernTableOptions);
  
  // Data methods
  reload(): void;
  loadData(): Promise<void>;
  
  // Search methods
  search(term: string): void;
  
  // Selection methods
  getSelectedRows(): any[];
  clearSelection(): void;
  
  // Pagination methods
  page(pageNumber: number): void;
  goToPage(page: number): void;
  changePageLength(length: number): void;
  
  // Column methods
  column(index: number): {
    visible(show?: boolean): boolean | void;
  };
  
  columns: {
    adjust(): void;
  };
  
  // State methods
  state: {
    save(): void;
    load(): void;
    clear(): void;
  };
  
  // Print methods
  customPrint(options?: any): void;
  
  // Event methods
  on(event: string, callback: Function): void;
  emit(event: string, ...args: any[]): void;
  
  // Destroy
  destroy(): void;
  
  // Properties
  data: any[];
  filteredData: any[];
  currentPage: number;
  totalRecords: number;
  element: HTMLElement;
  wrapper: HTMLElement;
  options: ModernTableOptions;
}

export default ModernTable;