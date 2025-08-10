import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// Services
import { AuthService } from './auth/auth.service';
import { ApiService } from './services/api.service';
import { NotificationService } from './services/notification.service';
import { LoadingService } from './services/loading.service';
import { ExportService } from './services/export.service';

// Guards
import { AuthGuard } from './auth/auth.guard';
import { RoleGuard } from './auth/role.guard';

// Interceptors
import { JwtInterceptor } from './auth/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    // Core Services
    AuthService,
    ApiService,
    NotificationService,
    LoadingService,
    ExportService,
    
    // Guards
    AuthGuard,
    RoleGuard,

    // HTTP Interceptors
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingInterceptor,
      multi: true
    }
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only'
      );
    }
  }

  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        // Additional root providers can be added here
      ]
    };
  }
}