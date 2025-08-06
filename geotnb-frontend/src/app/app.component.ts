import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'geotnb-frontend';
  connectionStatus = 'Non testé';
  users: any[] = [];
  newUser = { name: '', email: '' };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.testBackendConnection();
  }

  testBackendConnection() {
    this.userService.testConnection().subscribe({
      next: (response) => {
        console.log('Connexion réussie:', response);
        this.connectionStatus = 'Connecté ✅ - ' + response.message;
      },
      error: (error) => {
        console.error('Erreur de connexion:', error);
        this.connectionStatus = 'Erreur de connexion ❌';
      }
    });
  }

  onAddUser() {
    if (this.newUser.name && this.newUser.email) {
      console.log('Tentative d\'ajout:', this.newUser);
      this.users.push({...this.newUser, id: Date.now()});
      this.newUser = { name: '', email: '' };
    }
  }
}