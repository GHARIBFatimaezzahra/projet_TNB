import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeoTnbService {
  private apiUrl = 'http://localhost:3000';  // Remplacez par l'URL de votre API backend

  constructor(private http: HttpClient) {}

  // Exemple de méthode GET
  getData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/your-endpoint`);
  }

  // Exemple de méthode POST
  postData(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/your-endpoint`, data);
  }
}
