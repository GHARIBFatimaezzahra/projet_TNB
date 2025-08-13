// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// Core Module
import { CoreModule } from './core/core.module';

// Routing
import { AppRoutingModule } from './app-routing.module';

// Root Component - IMPORTÉ (pas déclaré)
import { AppComponent } from './app.component';

// Layout Components - IMPORTÉS (pas déclarés)
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { PrintLayoutComponent } from './layouts/print-layout/print-layout.component';

@NgModule({
  // ❌ SUPPRIMEZ declarations complètement
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CoreModule,
    
    // ✅ AJOUTEZ les composants ici
    AppComponent,
    MainLayoutComponent,
    AuthLayoutComponent,
    PrintLayoutComponent,
    
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }