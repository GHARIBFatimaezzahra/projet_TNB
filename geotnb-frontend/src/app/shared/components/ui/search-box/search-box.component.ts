import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject, takeUntil, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Observable, of } from 'rxjs';

export interface SearchSuggestion {
  value: string;
  label: string;
  category?: string;
  icon?: string;
}

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule
  ],
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Rechercher...';
  @Input() appearance: 'fill' | 'outline' = 'outline';
  @Input() debounceTime = 300;
  @Input() minSearchLength = 2;
  @Input() showClearButton = true;
  @Input() showSearchButton = false;
  @Input() showNoResults = true;
  @Input() suggestions: SearchSuggestion[] = [];
  @Input() suggestionProvider?: (query: string) => Observable<SearchSuggestion[]>;
  
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();
  @Output() suggestionSelected = new EventEmitter<SearchSuggestion>();

  searchControl = new FormControl('');
  filteredSuggestions: Observable<SearchSuggestion[]> = of([]);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.filteredSuggestions = this.searchControl.valueChanges.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      switchMap(value => this.filterSuggestions(value || '')),
      takeUntil(this.destroy$)
    );

    this.searchControl.valueChanges.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      if (value && value.length >= this.minSearchLength) {
        this.search.emit(value);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterSuggestions(query: string): Observable<SearchSuggestion[]> {
    if (!query || query.length < this.minSearchLength) {
      return of([]);
    }

    if (this.suggestionProvider) {
      return this.suggestionProvider(query);
    }

    const filtered = this.suggestions.filter(suggestion =>
      suggestion.label.toLowerCase().includes(query.toLowerCase()) ||
      suggestion.value.toLowerCase().includes(query.toLowerCase())
    );

    return of(filtered);
  }

  onEnterPressed(): void {
    const value = this.searchControl.value;
    if (value) {
      this.search.emit(value);
    }
  }

  onSuggestionSelected(event: any): void {
    const suggestion = this.suggestions.find(s => s.value === event.option.value);
    if (suggestion) {
      this.suggestionSelected.emit(suggestion);
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.clear.emit();
  }

  setValue(value: string): void {
    this.searchControl.setValue(value);
  }

  getValue(): string {
    return this.searchControl.value || '';
  }
}