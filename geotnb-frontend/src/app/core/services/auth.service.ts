// =====================================================
// SERVICE AUTHENTIFICATION - GESTION RÔLES & JWT
// =====================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

// Configuration
import { getConfig } from '../config/app.config';
import { API_ENDPOINTS } from '../config/endpoints.config';

// Import des modèles depuis database.models.ts
import { User, UserProfil } from '../models/database.models';

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  username: string;
  password: string;
  profil: UserProfil;
}

export interface AuthResponse {
  // Structure encapsulée du backend
  success?: boolean;
  data?: {
    user: User;
  access_token: string;
    refreshToken?: string;
    expiresIn?: number;
  };
  timestamp?: string;
  path?: string;
  version?: string;
  
  // Structure directe (pour compatibilité)
  user?: User;
  access_token?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface Permission {
  resource: string;
  actions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly config = getConfig();
  private readonly apiUrl = this.config.apiUrl;
  
  // État d'authentification
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private permissionsSubject = new BehaviorSubject<Permission[]>([]);

  // Observables publics
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public permissions$ = this.permissionsSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuthState();
  }

  // =====================================================
  // INITIALISATION
  // =====================================================

  public initializeAuthState(): void {
    const token = this.getStoredToken();
    const user = this.getStoredUser();

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
      this.loadUserPermissions(user.profil);
    } else {
      this.clearAuthData();
    }
  }

  // =====================================================
  // AUTHENTIFICATION
  // =====================================================

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${API_ENDPOINTS.auth.login}`,
      credentials
    ).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(this.handleAuthError)
    );
  }

  /**Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG5002: Parser Error: Unexpected token ')' at column 49 in [ (new Date(parcelleForm.get('datePermis')?.value).getFullYear() + parcelleForm.get('dureeExoneration')?.value) ] in C:\Users\pc\Downloads\Projet_TNB\geotnb-frontend\src\app\features\parcelles\components\parcelle-form\parcelle-form.component.html@282:30 [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:283:30:
      283 │ ...          {{ (new Date(parcelleForm.get('datePermis')?.value)....
          ╵              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~   

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'new' does not exist on type 'ParcelleFormComponent'.
 [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:283:34:
      283 │ ...                          {{ (new Date(parcelleForm.get('dateP...
          ╵                                  ~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-divider' is not a known element:
1. If 'mat-divider' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-divider' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:294:18:
      294 │                   <mat-divider></mat-divider>
          ╵                   ~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:297:20:
      297 │                     <mat-icon>calculate</mat-icon>
          ╵                     ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card' is not a known element:
1. If 'mat-card' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:302:20:
      302 │                     <mat-card class="calculation-card">
          ╵                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card-content' is not a known element:
1. If 'mat-card-content' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card-content' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:303:22:
      303 │                       <mat-card-content>
          ╵                       ~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'currentParcelle' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:307:37:
      307 │ ...               <span>{{ currentParcelle.surfaceImposable }} m�...
          ╵                            ~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'currentParcelle' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:311:37:
      311 │ ...               <span>{{ currentParcelle.prixUnitaireM2 || 0 }}...
          ╵                            ~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'currentParcelle' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:315:45:
      315 │ ...       <span><strong>{{ currentParcelle.montantTotalTnb || 0 }...
          ╵                            ~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'calculateTnb' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:320:55:
      320 │ ...                           type="button" (click)="calculateTnb()"
          ╵                                                      ~~~~~~~~~~~~   

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'currentParcelle' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:321:45:
      321 │                                 [disabled]="!currentParcelle"       
          ╵                                              ~~~~~~~~~~~~~~~        

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:323:26:
      323 │                           <mat-icon>refresh</mat-icon>
          ╵                           ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'previousTab' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:333:60:
      333 │ ...         <button mat-button type="button" (click)="previousTab()"
          ╵                                                       ~~~~~~~~~~~   

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:335:20:
      335 │                     <mat-icon>navigate_before</mat-icon>
          ╵                     ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'nextTab' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:340:49:
      340 │                           type="button" (click)="nextTab()"
          ╵                                                  ~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:343:20:
      343 │                     <mat-icon>navigate_next</mat-icon>
          ╵                     ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-tab' is not a known element:
1. If 'mat-tab' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-tab' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:352:8:
      352 │         <mat-tab label="Géométrie">
          ╵         ~~~~~~~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card' is not a known element:
1. If 'mat-card' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:354:12:
      354 │             <mat-card class="tab-card">
          ╵             ~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card-header' is not a known element:
1. If 'mat-card-header' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card-header' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:355:14:
      355 │               <mat-card-header>
          ╵               ~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card-title' is not a known element:
1. If 'mat-card-title' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card-title' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:356:16:
      356 │                 <mat-card-title>
          ╵                 ~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:357:18:
      357 │                   <mat-icon>map</mat-icon>
          ╵                   ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card-subtitle' is not a known element:
1. If 'mat-card-subtitle' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card-subtitle' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:360:16:
      360 │                 <mat-card-subtitle>
          ╵                 ~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card-content' is not a known element:
1. If 'mat-card-content' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card-content' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:365:14:
      365 │               <mat-card-content>
          ╵               ~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:369:20:
      369 │                     <mat-icon>map</mat-icon>
          ╵                     ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:379:22:
      379 │                       <mat-icon>create</mat-icon>
          ╵                       ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:383:22:
      383 │                       <mat-icon>upload</mat-icon>
          ╵                       ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:387:22:
      387 │                       <mat-icon>clear</mat-icon>
          ╵                       ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'previousTab' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:395:60:
      395 │ ...         <button mat-button type="button" (click)="previousTab()"
          ╵                                                       ~~~~~~~~~~~   

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:397:20:
      397 │                     <mat-icon>navigate_before</mat-icon>
          ╵                     ~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card' is not a known element:
1. If 'mat-card' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:409:8:
      409 │         <mat-card class="actions-card">
          ╵         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-card-content' is not a known element:
1. If 'mat-card-content' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-card-content' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:410:10:
      410 │           <mat-card-content>
          ╵           ~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:414:18:
      414 │                   <mat-icon class="success-icon">check_circle</ma...
          ╵                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:418:18:
      418 │                   <mat-icon class="error-icon">error</mat-icon>     
          ╵                   ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'validationResult' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:419:27:
      419 │ ...              <span>{{ validationResult.errors?.length || 0 }}...
          ╵                           ~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'saving' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:425:36:
      425 │                         [disabled]="saving" class="cancel-action">  
          ╵                                     ~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'saving' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:431:60:
      431 │                         [disabled]="parcelleForm.invalid || saving" 
          ╵                                                             ~~~~~~  

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:433:18:
      433 │                   <mat-icon *ngIf="!saving">save</mat-icon>
          ╵                   ~~~~~~~~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-icon' is not a known element:
1. If 'mat-icon' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-icon' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:434:18:
      434 │ ...          <mat-icon *ngIf="saving" class="spinning">sync</mat-...
          ╵              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2339: Property 'saving' does not exist on type 'ParcelleFormComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.html:435:21:
      435 │                   {{ saving ? 'Enregistrement...' : (isCreateMode...
          ╵                      ~~~~~~

  Error occurs in the template of component ParcelleFormComponent.

    src/app/features/parcelles/components/parcelle-form/parcelle-form.component.ts:18:15:
      18 │   templateUrl: './parcelle-form.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2345: Argument of type 'AbstractControl<any, any, any>' is not assignable to parameter of type 'FormGroup<any>'.
  Type 'AbstractControl<any, any, any>' is missing the following properties from type 'FormGroup<any>': controls, registerControl, addControl, removeControl, and 2 more. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-form/proprietaires-tab/proprietaires-tab.component.html:115:50:
      115 │ ...roprietaireDisplayName(proprietaireForm) || 'Nouveau propriét... 
          ╵                           ~~~~~~~~~~~~~~~~

  Error occurs in the template of component ProprietairesTabComponent.

    src/app/features/parcelles/components/parcelle-form/proprietaires-tab/proprietaires-tab.component.ts:62:15:
      62 │   templateUrl: './proprietaires-tab.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-chip-list' is not a known element:
1. If 'mat-chip-list' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-chip-list' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.html:187:16:
      187 │                 <mat-chip-list>
          ╵                 ~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleListComponent.

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.ts:64:15:
      64 │   templateUrl: './parcelle-list.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-chip-list' is not a known element:
1. If 'mat-chip-list' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-chip-list' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.html:235:14:
      235 │               <mat-chip-list>
          ╵               ~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleListComponent.

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.ts:64:15:
      64 │   templateUrl: './parcelle-list.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-chip-list' is not a known element:
1. If 'mat-chip-list' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-chip-list' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.html:272:14:
      272 │               <mat-chip-list>
          ╵               ~~~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleListComponent.

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.ts:64:15:
      64 │   templateUrl: './parcelle-list.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-divider' is not a known element:
1. If 'mat-divider' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-divider' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.html:308:16:
      308 │                 <mat-divider></mat-divider>
          ╵                 ~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleListComponent.

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.ts:64:15:
      64 │   templateUrl: './parcelle-list.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-divider' is not a known element:
1. If 'mat-divider' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-divider' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.html:328:16:
      328 │                 <mat-divider></mat-divider>
          ╵                 ~~~~~~~~~~~~~

  Error occurs in the template of component ParcelleListComponent.

    src/app/features/parcelles/components/parcelle-list/parcelle-list.component.ts:64:15:
      64 │   templateUrl: './parcelle-list.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8002: Can't bind to 'selected' since it isn't a known property of 'mat-chip'.
1. If 'mat-chip' is an Angular component and it has 'selected' input, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-chip' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message.
3. To allow any property add 'NO_ERRORS_SCHEMA' to the '@Component.schemas' of this component. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.html:43:19:
      43 │                    [selected]="selectedQuickFilter === filter.id"    
         ╵                    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~    

  Error occurs in the template of component ParcelleSearchComponent.

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.ts:81:15:
      81 │   templateUrl: './parcelle-search.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-suffix' is not a known element:
1. If 'mat-suffix' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-suffix' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.html:205:16:
      205 │                 <mat-suffix>m²</mat-suffix>
          ╵                 ~~~~~~~~~~~~

  Error occurs in the template of component ParcelleSearchComponent.

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.ts:81:15:
      81 │   templateUrl: './parcelle-search.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-suffix' is not a known element:
1. If 'mat-suffix' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-suffix' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.html:212:16:
      212 │                 <mat-suffix>m²</mat-suffix>
          ╵                 ~~~~~~~~~~~~

  Error occurs in the template of component ParcelleSearchComponent.

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.ts:81:15:
      81 │   templateUrl: './parcelle-search.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-suffix' is not a known element:
1. If 'mat-suffix' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-suffix' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.html:221:16:
      221 │                 <mat-suffix>m²</mat-suffix>
          ╵                 ~~~~~~~~~~~~

  Error occurs in the template of component ParcelleSearchComponent.

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.ts:81:15:
      81 │   templateUrl: './parcelle-search.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-suffix' is not a known element:
1. If 'mat-suffix' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-suffix' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.html:228:16:
      228 │                 <mat-suffix>m²</mat-suffix>
          ╵                 ~~~~~~~~~~~~

  Error occurs in the template of component ParcelleSearchComponent.

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.ts:81:15:
      81 │   templateUrl: './parcelle-search.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-suffix' is not a known element:
1. If 'mat-suffix' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-suffix' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.html:258:16:
      258 │                 <mat-suffix>DH</mat-suffix>
          ╵                 ~~~~~~~~~~~~

  Error occurs in the template of component ParcelleSearchComponent.

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.ts:81:15:
      81 │   templateUrl: './parcelle-search.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] NG8001: 'mat-suffix' is not a known element:
1. If 'mat-suffix' is an Angular component, then verify that it is included in the '@Component.imports' of this component.
2. If 'mat-suffix' is a Web Component then add 'CUSTOM_ELEMENTS_SCHEMA' to the '@Component.schemas' of this component to suppress this message. [plugin angular-compiler]

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.html:265:16:
      265 │                 <mat-suffix>DH</mat-suffix>
          ╵                 ~~~~~~~~~~~~

  Error occurs in the template of component ParcelleSearchComponent.

    src/app/features/parcelles/components/parcelle-search/parcelle-search.component.ts:81:15:
      81 │   templateUrl: './parcelle-search.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


X [ERROR] TS2341: Property 'resetForm' is private and only accessible within class 'ValidationPanelComponent'. [plugin angular-compiler]

    src/app/features/parcelles/components/workflow/validation-panel/validation-panel.component.html:331:58:
      331 │ ...          <button mat-button type="button" (click)="resetForm()">
          ╵                                                        ~~~~~~~~~    

  Error occurs in the template of component ValidationPanelComponent.

    src/app/features/parcelles/components/workflow/validation-panel/validation-panel.component.ts:97:15:
      97 │   templateUrl: './validation-panel.component.html',
         ╵                ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


Watch mode enabled. Watching for file changes...

   * Inscription utilisateur
   */
  register(registerData: RegisterDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${API_ENDPOINTS.auth.register}`,
      registerData
    ).pipe(
      catchError(this.handleAuthError)
    );
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): Observable<any> {
    const refreshToken = this.getStoredRefreshToken();
    
    return this.http.post(
      `${this.apiUrl}${API_ENDPOINTS.auth.logout}`,
      { refreshToken }
    ).pipe(
      tap(() => {
        this.handleLogout();
      }),
      catchError(() => {
        // Même si la déconnexion côté serveur échoue, on déconnecte côté client
        this.handleLogout();
        return throwError(() => new Error('Erreur lors de la déconnexion'));
      })
    );
  }
  
  /**
   * Rafraîchir le token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getStoredRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('Aucun refresh token disponible'));
    }

    return this.http.post<AuthResponse>(
      `${this.apiUrl}${API_ENDPOINTS.auth.refresh}`,
      { refreshToken }
    ).pipe(
      tap(response => {
        this.handleAuthSuccess(response);
      }),
      catchError(error => {
        this.handleLogout();
        return throwError(() => error);
      })
    );
  }
  
  /**
   * Récupérer le profil utilisateur
   */
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${API_ENDPOINTS.auth.profile}`)
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.storeUser(user);
        }),
        catchError(this.handleAuthError)
      );
  }

  /**
   * Changer le mot de passe
   */
  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}${API_ENDPOINTS.auth.changePassword}`,
      { oldPassword, newPassword }
    ).pipe(
      catchError(this.handleAuthError)
    );
  }

  // =====================================================
  // GESTION DES RÔLES ET PERMISSIONS
  // =====================================================

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserProfil): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.profil === role;
  }

  /**
   * Vérifier si l'utilisateur a un des rôles spécifiés
   */
  hasAnyRole(roles: UserProfil[]): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? roles.includes(currentUser.profil) : false;
  }

  /**
   * Vérifier si l'utilisateur peut effectuer une action sur une ressource
   */
  canAccess(resource: string, action: string): boolean {
    const permissions = this.permissionsSubject.value;
    const permission = permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action) : false;
  }

  /**
   * Obtenir toutes les permissions de l'utilisateur
   */
  getUserPermissions(): Permission[] {
    return this.permissionsSubject.value;
  }

  /**
   * Charger les permissions selon le rôle
   */
  private loadUserPermissions(role: UserProfil): void {
    const permissions = this.getPermissionsByRole(role);
    this.permissionsSubject.next(permissions);
  }

  /**
   * Définir les permissions par rôle
   */
  private getPermissionsByRole(role: UserProfil): Permission[] {
    const permissions: { [key in UserProfil]: Permission[] } = {
      [UserProfil.ADMIN]: [
        { resource: 'parcelles', actions: ['create', 'read', 'update', 'delete', 'validate', 'publish', 'archive'] },
        { resource: 'proprietaires', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'fiches-fiscales', actions: ['create', 'read', 'update', 'delete', 'generate'] },
        { resource: 'documents', actions: ['create', 'read', 'update', 'delete', 'upload'] },
        { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage-roles'] },
        { resource: 'configuration', actions: ['read', 'update'] },
        { resource: 'dashboard', actions: ['read', 'export'] },
        { resource: 'audit', actions: ['read', 'export'] },
        { resource: 'backup', actions: ['create', 'restore', 'download'] }
      ],
      
      [UserProfil.AGENT_FISCAL]: [
        { resource: 'parcelles', actions: ['read', 'update', 'validate'] },
        { resource: 'proprietaires', actions: ['create', 'read', 'update'] },
        { resource: 'fiches-fiscales', actions: ['create', 'read', 'update', 'generate'] },
        { resource: 'documents', actions: ['create', 'read', 'update', 'upload'] },
        { resource: 'dashboard', actions: ['read'] }
      ],
      
      [UserProfil.TECHNICIEN_SIG]: [
        { resource: 'parcelles', actions: ['create', 'read', 'update', 'delete'] },
        { resource: 'proprietaires', actions: ['create', 'read', 'update'] },
        { resource: 'documents', actions: ['create', 'read', 'update', 'delete', 'upload'] },
        { resource: 'import-export', actions: ['import', 'export'] },
        { resource: 'spatial', actions: ['query', 'analysis'] },
        { resource: 'dashboard', actions: ['read'] }
      ],
      
      [UserProfil.LECTEUR]: [
        { resource: 'parcelles', actions: ['read'] },
        { resource: 'proprietaires', actions: ['read'] },
        { resource: 'fiches-fiscales', actions: ['read'] },
        { resource: 'documents', actions: ['read'] },
        { resource: 'dashboard', actions: ['read'] }
      ]
    };

    return permissions[role] || [];
  }

  // =====================================================
  // HELPERS POUR LES PERMISSIONS SPÉCIFIQUES
  // =====================================================

  // Permissions Parcelles
  canCreateParcelle(): boolean { return this.canAccess('parcelles', 'create'); }
  canEditParcelle(): boolean { return this.canAccess('parcelles', 'update'); }
  canDeleteParcelle(): boolean { return this.canAccess('parcelles', 'delete'); }
  canValidateParcelle(): boolean { return this.canAccess('parcelles', 'validate'); }
  canPublishParcelle(): boolean { return this.canAccess('parcelles', 'publish'); }
  canArchiveParcelle(): boolean { return this.canAccess('parcelles', 'archive'); }

  // Permissions Propriétaires
  canCreateProprietaire(): boolean { return this.canAccess('proprietaires', 'create'); }
  canEditProprietaire(): boolean { return this.canAccess('proprietaires', 'update'); }
  canDeleteProprietaire(): boolean { return this.canAccess('proprietaires', 'delete'); }

  // Permissions Fiches Fiscales
  canGenerateFiche(): boolean { return this.canAccess('fiches-fiscales', 'generate'); }
  canEditFiche(): boolean { return this.canAccess('fiches-fiscales', 'update'); }

  // Permissions Administration
  canManageUsers(): boolean { return this.canAccess('users', 'manage-roles'); }
  canManageConfiguration(): boolean { return this.canAccess('configuration', 'update'); }
  canAccessAudit(): boolean { return this.canAccess('audit', 'read'); }

  // =====================================================
  // GESTION DU STOCKAGE
  // =====================================================

  private handleAuthSuccess(response: AuthResponse): void {
    console.log('🔐 Auth Response:', response);
    
    // Extraire les données de la réponse encapsulée
    const authData = response.data || response;
    
    // Vérifier que la réponse contient les données nécessaires
    if (!authData || !authData.access_token) {
      console.error('❌ Invalid auth response: missing access_token', authData);
      throw new Error('Réponse d\'authentification invalide');
    }

    if (!authData.user) {
      console.error('❌ Invalid auth response: missing user data', authData);
      throw new Error('Données utilisateur manquantes');
    }

    // Stocker les données d'authentification (backend utilise access_token, pas accessToken)
    this.storeToken(authData.access_token);
    if (authData.refreshToken) {
      this.storeRefreshToken(authData.refreshToken);
    }
    if (authData.expiresIn) {
      this.storeTokenExpiration(authData.expiresIn);
    }
    this.storeUser(authData.user);

    // Mettre à jour l'état
    this.currentUserSubject.next(authData.user);
    this.isAuthenticatedSubject.next(true);
    
    // Charger les permissions si le profil existe
    if (authData.user && authData.user.profil) {
      this.loadUserPermissions(authData.user.profil);
    } else {
      console.warn('⚠️ User profil not found, using default permissions');
      this.permissionsSubject.next([]);
    }
  }

  private handleLogout(): void {
    this.clearAuthData();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.permissionsSubject.next([]);
    this.router.navigate(['/auth/login']);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.config.auth.tokenKey, token);
  }

  private storeRefreshToken(token: string): void {
    localStorage.setItem(this.config.auth.refreshTokenKey, token);
  }

  private storeTokenExpiration(expiresIn: number): void {
    const expirationDate = new Date().getTime() + (expiresIn * 1000);
    localStorage.setItem(this.config.auth.tokenExpirationKey, expirationDate.toString());
  }

  private storeUser(user: User): void {
    try {
      localStorage.setItem(this.config.auth.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('❌ Erreur lors du stockage de l\'utilisateur:', error);
    }
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.config.auth.tokenKey);
  }

  private getStoredRefreshToken(): string | null {
    return localStorage.getItem(this.config.auth.refreshTokenKey);
  }

  private getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.config.auth.userKey);
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de l\'utilisateur stocké:', error);
      // Nettoyer le localStorage en cas d'erreur
      localStorage.removeItem(this.config.auth.userKey);
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    const expiration = localStorage.getItem(this.config.auth.tokenExpirationKey);
    if (!expiration) return true;
    
    return new Date().getTime() > parseInt(expiration, 10);
  }

  private clearAuthData(): void {
    try {
      localStorage.removeItem(this.config.auth.tokenKey);
      localStorage.removeItem(this.config.auth.refreshTokenKey);
      localStorage.removeItem(this.config.auth.tokenExpirationKey);
      localStorage.removeItem(this.config.auth.userKey);
      
      // Nettoyer aussi les anciennes clés qui pourraient causer des problèmes
      localStorage.removeItem('geotnb_user');
      localStorage.removeItem('geotnb_token');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage des données d\'authentification:', error);
    }
  }

  // =====================================================
  // GETTERS PUBLICS
  // =====================================================

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  get token(): string | null {
    return this.getStoredToken();
  }

  get userRole(): UserProfil | null {
    return this.currentUser?.profil || null;
  }

  get isAdmin(): boolean {
    return this.hasRole(UserProfil.ADMIN);
  }

  get isAgentFiscal(): boolean {
    return this.hasRole(UserProfil.AGENT_FISCAL);
  }

  get isTechnicienSIG(): boolean {
    return this.hasRole(UserProfil.TECHNICIEN_SIG);
  }

  get isLecteur(): boolean {
    return this.hasRole(UserProfil.LECTEUR);
  }

  // =====================================================
  // GESTION DES PERMISSIONS
  // =====================================================

  /**
   * Vérifie si l'utilisateur a l'une des permissions requises
   */
  hasPermission(...roles: UserProfil[]): boolean {
    if (!this.isAuthenticated || !this.currentUser) {
      return false;
    }
    
    return roles.includes(this.currentUser.profil);
  }

  // =====================================================
  // GESTION DES ERREURS
  // =====================================================

  private handleAuthError = (error: any): Observable<never> => {
    console.error('Erreur d\'authentification:', error);
    
    let errorMessage = 'Une erreur est survenue';
    
    if (error.status === 401) {
      errorMessage = 'Identifiants incorrects';
      this.handleLogout();
    } else if (error.status === 403) {
      errorMessage = 'Accès refusé';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  };
}