// features/auth/login/login.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Animation d'entrée
    this.animateOnLoad();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    // Validation simple côté client
    if (!email || !password) {
      this.showError('Veuillez remplir tous les champs');
      return;
    }
    
    if (!this.isValidEmail(email)) {
      this.showError('Format email invalide');
      return;
    }
    
    if (password.length < 6) {
      this.showError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    // Simulation de connexion
    this.simulateLogin(form, { email, password });
  }

  togglePassword(): void {
    const passwordField = document.getElementById('password') as HTMLInputElement;
    const passwordIcon = document.getElementById('passwordIcon') as HTMLElement;
    
    if (passwordField && passwordIcon) {
      if (passwordField.type === 'password') {
        passwordField.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
      } else {
        passwordField.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
      }
    }
  }

  private simulateLogin(form: HTMLFormElement, credentials: { email: string; password: string }): void {
    const button = form.querySelector('.login-button') as HTMLButtonElement;
    
    if (button) {
      // État de chargement
      button.classList.add('loading');
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner"></i> Connexion en cours...';
      
      // Simulation d'un appel API
      setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
        
        // Simuler une connexion réussie
        this.handleSuccessfulLogin();
        
      }, 2000);
    }
  }

  private handleSuccessfulLogin(): void {
    // Simulation de sauvegarde de token
    const mockUser = {
      id: 1,
      email: 'user@example.com',
      name: 'Admin User',
      role: 'ADMIN'
    };
    
    // Stockage temporaire (à remplacer par votre AuthService)
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'mock-jwt-token');
    
    // Afficher un message de succès
    this.showSuccess('Connexion réussie !');
    
    // Redirection vers le dashboard après un court délai
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private showError(message: string): void {
    // Implémentation simple d'affichage d'erreur
    // À remplacer par votre service de notification
    const existingAlert = document.querySelector('.error-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = 'error-alert';
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fee;
      color: #c53030;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #fed7d7;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
    `;
    alert.innerHTML = `
      <i class="fas fa-exclamation-circle" style="margin-right: 8px;"></i>
      ${message}
    `;

    document.body.appendChild(alert);

    // Suppression automatique après 5 secondes
    setTimeout(() => {
      if (alert && alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  private showSuccess(message: string): void {
    // Implémentation simple d'affichage de succès
    const existingAlert = document.querySelector('.success-alert');
    if (existingAlert) {
      existingAlert.remove();
    }

    const alert = document.createElement('div');
    alert.className = 'success-alert';
    alert.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f0fff4;
      color: #38a169;
      padding: 12px 20px;
      border-radius: 8px;
      border: 1px solid #c6f6d5;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
    `;
    alert.innerHTML = `
      <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
      ${message}
    `;

    document.body.appendChild(alert);

    // Suppression automatique après 3 secondes
    setTimeout(() => {
      if (alert && alert.parentNode) {
        alert.remove();
      }
    }, 3000);
  }

  private animateOnLoad(): void {
    // Animation d'entrée pour le composant
    setTimeout(() => {
      const container = document.querySelector('.login-container');
      if (container) {
        container.classList.add('animate-in');
      }
    }, 100);
  }

  // Méthodes utilitaires pour les templates
  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}