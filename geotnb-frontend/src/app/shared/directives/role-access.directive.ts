import { Directive, Input, TemplateRef, ViewContainerRef, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UserProfil } from '../../core/models/database.models';

@Directive({
  selector: '[appRoleAccess]',
  standalone: true
})
export class RoleAccessDirective implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private requiredRoles: UserProfil[] = [];
  private hasView = false;

  @Input() set appRoleAccess(roles: UserProfil | UserProfil[]) {
    this.requiredRoles = Array.isArray(roles) ? roles : [roles];
    this.updateView();
  }

  @Input() appRoleAccessElse?: TemplateRef<any>;

  constructor(
    private authService: AuthService,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateView();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateView(): void {
    const hasPermission = this.checkPermission();

    if (hasPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasPermission && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
      
      if (this.appRoleAccessElse) {
        this.viewContainer.createEmbeddedView(this.appRoleAccessElse);
      }
    }
  }

  private checkPermission(): boolean {
    if (this.requiredRoles.length === 0) {
      return true;
    }

    const user = this.authService.currentUser;
    if (!user) {
      return false;
    }

    return this.requiredRoles.includes(user.profil);
  }
}