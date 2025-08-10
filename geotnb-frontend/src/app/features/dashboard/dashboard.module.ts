import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardRoutingModule } from './dashboard-routing.module';

import { DashboardComponent } from './dashboard.component';
import { StatsCardsComponent } from './components/stats-cards/stats-cards.component';
import { PieChartComponent } from './components/charts/pie-chart/pie-chart.component';
import { BarChartComponent } from './components/charts/bar-chart/bar-chart.component';

@NgModule({
  declarations: [
    DashboardComponent,
    StatsCardsComponent,
    PieChartComponent,
    BarChartComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }