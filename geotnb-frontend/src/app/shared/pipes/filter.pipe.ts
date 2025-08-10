import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform(items: any[], searchText: string, searchFields?: string[]): any[] {
    if (!items || !searchText) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some(field => {
          const value = this.getNestedValue(item, field);
          return String(value).toLowerCase().includes(searchText);
        });
      } else {
        return Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchText)
        );
      }
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, p) => o && o[p], obj);
  }
}