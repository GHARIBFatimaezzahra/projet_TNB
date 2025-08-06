import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeoTnbService {

  private apiUrl = 'http://localhost:3000/api/data'; // Remplace avec l'URL de ton backend

  constructor(private http: HttpClient) { }

  getData(): Observable<any> {
    return this.http.get<any>(this.apiUrl); // Récupère les données du backend
  }
}
