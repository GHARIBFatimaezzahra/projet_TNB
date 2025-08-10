import { Component, Input } from '@angular/core';
import { DashboardStats } from '../../../../core/models/dashboard.interface';

@Component({
  selector: 'app-stats-cards',
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss']
})
export class StatsCardsComponent {
  @Input() stats: DashboardStats | null = null;
}