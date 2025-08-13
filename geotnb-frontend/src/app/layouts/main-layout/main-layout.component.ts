import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true, // ✅ AJOUTEZ
  imports: [CommonModule, RouterOutlet], 
  template: `
    <div class="main-layout">
      <header>
        <!-- Header component will go here -->
        <h1>GeoTNB - Système de gestion TNB</h1>
      </header>
      <nav>
        <!-- Sidebar navigation will go here -->
        <a routerLink="/dashboard">Dashboard</a>
        <a routerLink="/parcelles">Parcelles</a>
        <a routerLink="/proprietaires">Propriétaires</a>
      </nav>
      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .main-layout {
      display: grid;
      grid-template-areas: 
        "header header"
        "nav main";
      grid-template-rows: 60px 1fr;
      grid-template-columns: 250px 1fr;
      min-height: 100vh;
    }
    header { grid-area: header; background: #f8f9fa; padding: 1rem; }
    nav { grid-area: nav; background: #343a40; padding: 1rem; }
    main { grid-area: main; padding: 1rem; }
    nav a { display: block; color: white; margin: 0.5rem 0; text-decoration: none; }
  `]
})
export class MainLayoutComponent { }