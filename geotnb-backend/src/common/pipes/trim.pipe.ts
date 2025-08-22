import { PipeTransform, Injectable } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return value.trim();
    }
    
    if (typeof value === 'object' && value !== null) {
      return this.trimObject(value);
    }
    
    return value;
  }

  private trimObject(obj: any): any {
    const trimmed = {};
    
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        
        if (typeof value === 'string') {
          trimmed[key] = value.trim();
        } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          trimmed[key] = this.trimObject(value);
        } else {
          trimmed[key] = value;
        }
      }
    }
    
    return trimmed;
  }
}