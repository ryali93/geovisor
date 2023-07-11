import { Component, ViewChild, AfterViewInit } from '@angular/core';

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale } from 'chart.js';

// This registers the controllers, elements and scales into Chart.js
Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale);


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements AfterViewInit {
  @ViewChild('indicesChart') indicesChart: any;

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart(): void {
    new Chart(this.indicesChart.nativeElement, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3, 7, 8, 12, 15, 16, 18],
            borderColor: 'rgba(255,99,132,1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
      }
    });
  }
}
