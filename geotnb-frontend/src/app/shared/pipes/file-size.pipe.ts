import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined, precision: number = 1): string {
    if (bytes === null || bytes === undefined || bytes === 0) {
      return '0 B';
    }

    if (bytes < 0) {
      return 'Taille invalide';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    const formattedSize = unitIndex === 0 ? 
      size.toString() : 
      size.toFixed(precision);

    return `${formattedSize} ${units[unitIndex]}`;
  }
}
