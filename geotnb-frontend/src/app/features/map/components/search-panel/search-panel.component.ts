import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent {
  @Output() close = new EventEmitter<void>();
  @Output() search = new EventEmitter<any>();

  searchForm: FormGroup;
  searchResults: any[] = [];

  constructor(private formBuilder: FormBuilder) {
    this.searchForm = this.formBuilder.group({
      referenceFonciere: [''],
      zonage: [''],
      proprietaire: ['']
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onSearch(): void {
    const searchCriteria = this.searchForm.value;
    this.search.emit(searchCriteria);
    // TODO: Implement search logic
  }

  onClear(): void {
    this.searchForm.reset();
    this.searchResults = [];
  }
}