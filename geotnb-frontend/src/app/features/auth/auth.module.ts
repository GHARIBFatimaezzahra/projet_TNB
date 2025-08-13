import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Component } from '@angular/core'; 
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <h2>🌍 GeoTNB</h2>
            <p>Système de gestion de la Taxe sur les Terrains Non Bâtis</p>
          </div>
          
          <form class="login-form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
            <div class="form-group">
              <label for="username">Nom d'utilisateur</label>
              <input 
                type="text" 
                id="username"
                name="username"
                [(ngModel)]="credentials.username"
                placeholder="Votre nom d'utilisateur" 
                class="form-control"
                required
                #username="ngModel"
              />
              <div class="error-message" *ngIf="username.invalid && username.touched">
                Le nom d'utilisateur est requis
              </div>
            </div>
            
            <div class="form-group">
              <label for="password">Mot de passe</label>
              <input 
                type="password" 
                id="password"
                name="password"
                [(ngModel)]="credentials.password"
                placeholder="Votre mot de passe" 
                class="form-control"
                required
                #password="ngModel"
              />
              <div class="error-message" *ngIf="password.invalid && password.touched">
                Le mot de passe est requis
              </div>
            </div>
            
            <div class="form-options">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  [(ngModel)]="rememberMe"
                  name="rememberMe"
                > Se souvenir de moi
              </label>
              <a href="#" class="forgot-link" (click)="onForgotPassword($event)">
                Mot de passe oublié ?
              </a>
            </div>
            
            <button 
              type="submit" 
              class="btn-login"
              [disabled]="loginForm.invalid || isLoading"
            >
              <span *ngIf="!isLoading">Se connecter</span>
              <span *ngIf="isLoading">🔄 Connexion...</span>
            </button>
            
            <div class="error-message" *ngIf="loginError">
              {{ loginError }}
            </div>
          </form>
          
          <div class="login-footer">
            <p>&copy; 2025 Commune d'Oujda - GeoConseil</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }
    
    .login-container {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      width: 100%;
      max-width: 420px;
      overflow: hidden;
    }
    
    .login-card {
      padding: 2.5rem;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    
    .login-header h2 {
      margin: 0 0 0.75rem 0;
      color: #333;
      font-size: 2.2rem;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .login-header p {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
      line-height: 1.4;
    }
    
    .login-form {
      margin-bottom: 1.5rem;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 0.6rem;
      color: #333;
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    .form-control {
      width: 100%;
      padding: 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 8px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: all 0.3s ease;
      background: #fafbfc;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
      background: white;
    }
    
    .form-control.ng-invalid.ng-touched {
      border-color: #dc3545;
      box-shadow: 0 0 0 3px rgba(220,53,69,0.1);
    }
    
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 1.5rem 0;
      font-size: 0.9rem;
    }
    
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      cursor: pointer;
      color: #555;
      font-weight: 500;
    }
    
    .checkbox-label input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: #007bff;
    }
    
    .forgot-link {
      color: #007bff;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
    }
    
    .forgot-link:hover {
      color: #0056b3;
      text-decoration: underline;
    }
    
    .btn-login {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #007bff, #0056b3);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .btn-login:hover:not(:disabled) {
      background: linear-gradient(135deg, #0056b3, #004085);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0,123,255,0.3);
    }
    
    .btn-login:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      font-weight: 500;
      text-align: center;
    }
    
    .form-group .error-message {
      text-align: left;
      margin-top: 0.25rem;
    }
    
    .login-footer {
      text-align: center;
      padding-top: 1.5rem;
      border-top: 1px solid #e9ecef;
    }
    
    .login-footer p {
      margin: 0;
      color: #6c757d;
      font-size: 0.85rem;
    }
    
    @media (max-width: 480px) {
      .login-wrapper {
        padding: 0.5rem;
      }
      
      .login-card {
        padding: 2rem;
      }
      
      .login-header h2 {
        font-size: 1.8rem;
      }
      
      .form-control {
        padding: 0.875rem;
      }
      
      .btn-login {
        padding: 0.875rem;
      }
    }
  `]
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };
  
  rememberMe = false;
  isLoading = false;
  loginError = '';

  onSubmit() {
    if (!this.credentials.username || !this.credentials.password) {
      this.loginError = 'Veuillez saisir vos identifiants';
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    // Simulation de connexion
    setTimeout(() => {
      if (this.credentials.username === 'admin' && this.credentials.password === 'admin') {
        // Connexion réussie
        console.log('Connexion réussie');
        // Ici vous pouvez rediriger vers le dashboard
        // this.router.navigate(['/dashboard']);
      } else {
        this.loginError = 'Identifiants incorrects';
      }
      this.isLoading = false;
    }, 1500);
  }

  onForgotPassword(event: Event) {
    event.preventDefault();
    alert('Fonctionnalité "Mot de passe oublié" à implémenter.\nContactez votre administrateur système.');
  }
}

// Routes pour le module
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    LoginComponent // ✅ Importer le composant standalone au lieu de le déclarer
  ]
  // ❌ Suppression de declarations: [LoginComponent]
})
export class AuthModule { }