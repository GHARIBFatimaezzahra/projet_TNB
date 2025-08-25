import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'coordinateFormat',
  standalone: true
})
export class CoordinateFormatPipe implements PipeTransform {
  transform(
    coordinates: [number, number] | null | undefined, 
    format: 'dms' | 'dd' | 'lambert' = 'dd', 
    precision: number = 6
  ): string {
    if (!coordinates || coordinates.length !== 2) {
      return 'Coordonnées invalides';
    }

    const [x, y] = coordinates;

    switch (format) {
      case 'dms':
        return this.formatDMS(x, y);
      case 'lambert':
        return this.formatLambert(x, y, precision);
      default: // 'dd'
        return this.formatDecimalDegrees(x, y, precision);
    }
  }

  private formatDecimalDegrees(lon: number, lat: number, precision: number): string {
    return `${lat.toFixed(precision)}°N, ${Math.abs(lon).toFixed(precision)}°W`;
  }

  private formatDMS(lon: number, lat: number): string {
    const formatCoord = (coord: number, isLat: boolean): string => {
      const abs = Math.abs(coord);
      const degrees = Math.floor(abs);
      const minutes = Math.floor((abs - degrees) * 60);
      const seconds = ((abs - degrees) * 60 - minutes) * 60;
      
      const direction = isLat ? (coord >= 0 ? 'N' : 'S') : (coord >= 0 ? 'E' : 'W');
      
      return `${degrees}°${minutes}'${seconds.toFixed(1)}"${direction}`;
    };

    return `${formatCoord(lat, true)}, ${formatCoord(lon, false)}`;
  }

  private formatLambert(x: number, y: number, precision: number): string {
    return `X: ${x.toFixed(precision)}, Y: ${y.toFixed(precision)} (Lambert)`;
  }
}