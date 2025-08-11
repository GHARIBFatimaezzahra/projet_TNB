import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  template: `
    <div class="pagination-wrapper" *ngIf="totalPages > 1">
      <div class="pagination-info">
        <span>
          {{ startItem }} - {{ endItem }} sur {{ totalItems }} éléments
        </span>
      </div>
      
      <div class="pagination-controls">
        <button
          class="btn-pagination"
          [disabled]="currentPage === 1"
          (click)="goToPage(1)"
        >
          <i class="icon-chevron-double-left"></i>
        </button>
        
        <button
          class="btn-pagination"
          [disabled]="currentPage === 1"
          (click)="goToPage(currentPage - 1)"
        >
          <i class="icon-chevron-left"></i>
        </button>
        
        <button
          *ngFor="let page of visiblePages"
          class="btn-pagination"
          [class.active]="page === currentPage"
          [class.ellipsis]="page === '...'"
          [disabled]="page === '...'"
          (click)="goToPage(page)"
        >
          {{ page }}
        </button>
        
        <button
          class="btn-pagination"
          [disabled]="currentPage === totalPages"
          (click)="goToPage(currentPage + 1)"
        >
          <i class="icon-chevron-right"></i>
        </button>
        
        <button
          class="btn-pagination"
          [disabled]="currentPage === totalPages"
          (click)="goToPage(totalPages)"
        >
          <i class="icon-chevron-double-right"></i>
        </button>
      </div>
      
      <div class="page-size-selector">
        <select [value]="pageSize" (change)="onPageSizeChange($event)">
          <option *ngFor="let size of pageSizeOptions" [value]="size">
            {{ size }} / page
          </option>
        </select>
      </div>
    </div>
  `,
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 25, 50, 100];
  @Input() maxVisiblePages = 5;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visiblePages(): (number | string)[] {
    const pages: (number | string)[] = [];
    const half = Math.floor(this.maxVisiblePages / 2);
    
    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);
    
    if (end - start + 1 < this.maxVisiblePages) {
      start = Math.max(1, end - this.maxVisiblePages + 1);
    }
    
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push('...');
      }
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (end < this.totalPages) {
      if (end < this.totalPages - 1) {
        pages.push('...');
      }
      pages.push(this.totalPages);
    }
    
    return pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: any): void {
    const newPageSize = parseInt(event.target.value, 10);
    this.pageSizeChange.emit(newPageSize);
  }
}