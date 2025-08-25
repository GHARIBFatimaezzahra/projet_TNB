import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil, filter } from 'rxjs';

export interface BreadcrumbItem {
  label: string;
  url: string;
  active: boolean;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  breadcrumbs: BreadcrumbItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.buildBreadcrumbs();
      });

    // Construire le breadcrumb initial
    this.buildBreadcrumbs();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildBreadcrumbs(): void {
    let route: ActivatedRoute | null = this.activatedRoute.root;
    let url = '';
    const breadcrumbs: BreadcrumbItem[] = [];

    // Ajouter l'accueil
    breadcrumbs.push({
      label: 'Accueil',
      url: '/dashboard',
      active: false,
      icon: 'home'
    });

    while (route) {
      if (route.snapshot.data['breadcrumb']) {
        url += `/${route.snapshot.url.map(segment => segment.path).join('/')}`;
        breadcrumbs.push({
          label: route.snapshot.data['breadcrumb'],
          url: url,
          active: false,
          icon: route.snapshot.data['breadcrumbIcon']
        });
      }
      route = route.firstChild;
    }

    // Marquer le dernier élément comme actif
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].active = true;
    }

    this.breadcrumbs = breadcrumbs;
  }

  navigate(url: string): void {
    this.router.navigate([url]);
  }
}