import { Component } from '@angular/core';
import { LoginComponent } from './features/auth/components/login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent],
  template: `<app-login></app-login>`
})
export class AppComponent {}