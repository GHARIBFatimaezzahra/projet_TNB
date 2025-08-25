import { Component, Input, Output, EventEmitter, ViewChild, OnInit, OnDestroy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { SelectionModel } from '@angular/cdk/collections';
import { Subject, takeUntil } from 'rxjs';

// ✅ Import des composants manquants
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

// ✅ CORRECTION: Interface BadgeConfig avec types stricts
export interface BadgeConfig {
  type: 'custom' | 'validation' | 'occupation' | 'payment';
  colorMap?: { [key: string]: string };
}

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'badge' | 'actions' | 'custom';
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: 'start' | 'end';
  template?: TemplateRef<any>;
  pipe?: string;
  pipeArgs?: any[];
  badgeConfig?: BadgeConfig;
}

export interface TableAction {
  key: string;
  label: string;
  icon: string;
  color?: 'primary' | 'accent' | 'warn';
  disabled?: (row: any) => boolean;
  visible?: (row: any) => boolean;
  tooltip?: string;
}

export interface TableFilter {
  key: string;
  value: any;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
}

export interface TableConfig {
  selectable?: boolean;
  multiSelect?: boolean;
  showRowIndex?: boolean;
  showRowActions?: boolean;
  stickyHeader?: boolean;
  expandableRows?: boolean;
  virtualScrolling?: boolean;
  alternatingRows?: boolean;
  hoverEffect?: boolean;
  dense?: boolean;
  showPaginator?: boolean;
  showFilter?: boolean;
  showColumnToggle?: boolean;
  showExport?: boolean;
  exportFormats?: string[];
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatProgressBarModule,
    // ✅ Ajout de l'import manquant
    StatusBadgeComponent
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnDestroy {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() config: TableConfig = {};
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() pageSize = 20;
  @Input() pageSizeOptions = [10, 20, 50, 100];
  @Input() filters: TableFilter[] = [];
  @Input() noDataMessage = 'Aucune donnée disponible';
  
  // ✅ Correction de trackByFn avec une signature plus robuste
  @Input() trackByFn: (index: number, item: any) => any = this.defaultTrackByFn.bind(this);

  @Output() rowClick = new EventEmitter<any>();
  @Output() rowDoubleClick = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() filterChange = new EventEmitter<TableFilter[]>();
  @Output() export = new EventEmitter<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<any>();
  selection = new SelectionModel<any>(true, []);
  displayedColumns: string[] = [];
  visibleColumns: string[] = [];
  globalFilter = '';
  expandedRows = new Set<any>();
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.initializeTable();
    this.setupDataSource();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ✅ Fonction trackBy par défaut
  defaultTrackByFn(index: number, item: any): any {
    return item?.id || item?.uuid || index;
  }

  private initializeTable(): void {
    // Configurer les colonnes affichées
    this.displayedColumns = [];
    
    if (this.config.selectable) {
      this.displayedColumns.push('select');
    }
    
    if (this.config.showRowIndex) {
      this.displayedColumns.push('index');
    }

    // Ajouter les colonnes de données
    this.visibleColumns = this.columns.map(col => col.key);
    this.displayedColumns.push(...this.visibleColumns);
    
    if (this.config.showRowActions && this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }

    // Configuration par défaut
    this.config = {
      selectable: false,
      multiSelect: true,
      showRowIndex: false,
      showRowActions: true,
      stickyHeader: true,
      expandableRows: false,
      alternatingRows: true,
      hoverEffect: true,
      dense: false,
      showPaginator: true,
      showFilter: true,
      showColumnToggle: true,
      showExport: false,
      exportFormats: ['csv', 'excel', 'pdf'],
      ...this.config
    };
  }

  private setupDataSource(): void {
    this.dataSource.data = this.data;
    
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
    
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }

    // Filtre personnalisé
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const globalMatch = this.globalFilterPredicate(data, filter);
      const columnFilters = this.columnFilterPredicate(data);
      return globalMatch && columnFilters;
    };

    // Écouter les changements de sélection
    this.selection.changed.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.selectionChange.emit(this.selection.selected);
    });
  }

  private globalFilterPredicate(data: any, filter: string): boolean {
    if (!filter) return true;
    
    const searchValue = filter.toLowerCase();
    return this.columns.some(column => {
      const value = data[column.key];
      return value && value.toString().toLowerCase().includes(searchValue);
    });
  }

  private columnFilterPredicate(data: any): boolean {
    return this.filters.every(filter => {
      const value = data[filter.key];
      
      switch (filter.operator) {
        case 'equals':
          return value === filter.value;
        case 'contains':
          return value && value.toString().toLowerCase().includes(filter.value.toLowerCase());
        case 'startsWith':
          return value && value.toString().toLowerCase().startsWith(filter.value.toLowerCase());
        case 'endsWith':
          return value && value.toString().toLowerCase().endsWith(filter.value.toLowerCase());
        case 'gt':
          return value > filter.value;
        case 'lt':
          return value < filter.value;
        case 'gte':
          return value >= filter.value;
        case 'lte':
          return value <= filter.value;
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(value);
        default:
          return true;
      }
    });
  }

  // Gestion de la sélection
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
  }

  toggleRow(row: any): void {
    this.selection.toggle(row);
  }

  // Gestion des événements
  onRowClick(row: any, event: MouseEvent): void {
    if (!event.defaultPrevented) {
      this.rowClick.emit(row);
    }
  }

  onRowDoubleClick(row: any): void {
    this.rowDoubleClick.emit(row);
  }

  onActionClick(action: string, row: any, event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit({
      active: sort.active,
      direction: sort.direction
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onGlobalFilterChange(value: string): void {
    this.globalFilter = value;
    this.dataSource.filter = value.trim().toLowerCase();
  }

  onColumnFilterChange(): void {
    this.dataSource.filter = ' '; // Trigger filter update
    this.filterChange.emit(this.filters);
  }

  // Gestion des colonnes
  toggleColumn(columnKey: string): void {
    const index = this.visibleColumns.indexOf(columnKey);
    if (index > -1) {
      this.visibleColumns.splice(index, 1);
    } else {
      this.visibleColumns.push(columnKey);
    }
    this.updateDisplayedColumns();
  }

  private updateDisplayedColumns(): void {
    this.displayedColumns = [];
    
    if (this.config.selectable) {
      this.displayedColumns.push('select');
    }
    
    if (this.config.showRowIndex) {
      this.displayedColumns.push('index');
    }

    this.displayedColumns.push(...this.visibleColumns);
    
    if (this.config.showRowActions && this.actions.length > 0) {
      this.displayedColumns.push('actions');
    }
  }

  // Expandable rows
  toggleRowExpansion(row: any): void {
    if (this.expandedRows.has(row)) {
      this.expandedRows.delete(row);
    } else {
      this.expandedRows.add(row);
    }
  }

  isRowExpanded(row: any): boolean {
    return this.expandedRows.has(row);
  }

  // Export
  onExport(format: string): void {
    this.export.emit(format);
  }

  // Utilitaires
  getColumnValue(row: any, column: TableColumn): any {
    return row[column.key];
  }

  isActionVisible(action: TableAction, row: any): boolean {
    return action.visible ? action.visible(row) : true;
  }

  isActionDisabled(action: TableAction, row: any): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  getRowClass(row: any, index: number): string {
    const classes = [];
    
    if (this.config.alternatingRows && index % 2 === 1) {
      classes.push('alternate-row');
    }
    
    if (this.selection.isSelected(row)) {
      classes.push('selected-row');
    }
    
    if (this.expandedRows.has(row)) {
      classes.push('expanded-row');
    }
    
    return classes.join(' ');
  }

  // ✅ Méthode pour vérifier si une colonne est sortable (pour le template)
  isColumnSortable(column: TableColumn): boolean {
    return column.sortable !== false; // Par défaut sortable sauf si explicitement false
  }

  // ✅ Méthode pour obtenir la clé de tri (retourne string ou undefined pour éviter les erreurs)
  getSortKey(column: TableColumn): string | undefined {
    return this.isColumnSortable(column) ? column.key : undefined;
  }

  // ✅ CORRECTION: Méthode pour obtenir le type de badge de manière sûre
  getBadgeType(column: TableColumn): 'custom' | 'validation' | 'occupation' | 'payment' {
    if (column.badgeConfig?.type) {
      const type = column.badgeConfig.type;
      if (type === 'custom' || type === 'validation' || type === 'occupation' || type === 'payment') {
        return type;
      }
    }
    return 'custom'; // Valeur par défaut
  }

  // ✅ Méthode de formatage pour remplacer dynamicPipe
  formatValue(value: any, column: TableColumn): string {
    if (!column.pipe || value == null) return value;
    
    switch (column.pipe) {
      case 'date':
        return new Date(value).toLocaleDateString('fr-FR');
      case 'currency':
        return new Intl.NumberFormat('fr-MA', { 
          style: 'currency', 
          currency: 'MAD' 
        }).format(value);
      case 'number':
        return new Intl.NumberFormat('fr-FR').format(value);
      case 'percent':
        return new Intl.NumberFormat('fr-FR', { 
          style: 'percent' 
        }).format(value);
      case 'uppercase':
        return value.toString().toUpperCase();
      case 'lowercase':
        return value.toString().toLowerCase();
      default:
        return value;
    }
  }

  // Refresh data
  refresh(): void {
    this.dataSource.data = [...this.data];
  }

  // Clear selection
  clearSelection(): void {
    this.selection.clear();
  }

  // Get selected rows
  getSelectedRows(): any[] {
    return this.selection.selected;
  }
}