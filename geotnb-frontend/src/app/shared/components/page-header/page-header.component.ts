import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-search-box',
  template: `
    <div class="search-box">
      <div class="search-input-wrapper">
        <input
          type="text"
          [formControl]="searchControl"
          [placeholder]="placeholder"
          class="search-input"
        >
        <i class="search-icon icon-search"></i>
        <button
          *ngIf="searchControl.value"
          class="clear-button"
          (click)="clear()"
        >
          <i class="icon-x"></i>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Rechercher...';
  @Input() debounceTime = 300;
  @Input() initialValue = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() searchClear = new EventEmitter<void>();

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (this.initialValue) {
      this.searchControl.setValue(this.initialValue);
    }

    this.searchControl.valueChanges
      .pipe(
        debounceTime(this.debounceTime),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.searchChange.emit(value || '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clear(): void {
    this.searchControl.setValue('');
    this.searchClear.emit();
  }
}