import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

// Services
import { ApiService } from './services/api.service';
import { AuthService } from './services/auth.service';
import { NotificationService } from './services/notification.service';
import { StorageService } from './services/storage.service';
import { SpatialProjectionService } from './services/spatial-projection.service';
import { WorkflowEngineService } from './services/workflow-engine.service';
import { AuditLoggerService } from './services/audit-logger.service';
import { BackupService } from './services/backup.service';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Services
    ApiService,
    AuthService,
    NotificationService,
    StorageService,
    SpatialProjectionService,
    WorkflowEngineService,
    AuditLoggerService,
    BackupService,
    
    // Guards
    AuthGuard,
    RolesGuard,
    UnsavedChangesGuard
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule');
    }
  }
}