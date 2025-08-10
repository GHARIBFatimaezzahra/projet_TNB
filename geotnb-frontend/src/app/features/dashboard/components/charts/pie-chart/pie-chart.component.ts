import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef;
  @Input() data: any = null;
  @Input() title: string = '';

  private chart!: Chart;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  createChart(): void {
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: this.data || {
        labels: ['Zone Résidentielle', 'Zone Commerciale', 'Zone Industrielle'],
        datasets: [{
          data: [45, 30, 25],
          backgroundColor: ['#1976d2', '#388e3c', '#ff9800']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: !!this.title,
            text: this.title
          }
        }
      }
    });
  }
}