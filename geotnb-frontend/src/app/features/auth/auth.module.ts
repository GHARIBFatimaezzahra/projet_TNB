import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent
  ],
  imports: [
    CommonModule,          // Nécessaire pour *ngIf, *ngFor
    ReactiveFormsModule,   // Nécessaire pour [formGroup]
    AuthRoutingModule
  ]
})
export class AuthModule { }