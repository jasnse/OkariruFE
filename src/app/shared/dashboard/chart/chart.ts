import { Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, afterNextRender } from '@angular/core';
import { Chart as ChartJS, ChartType, registerables } from 'chart.js';


ChartJS.register(...registerables);

export interface ChartDatum {
  label: string;
  value: number;
}

const DEFAULT_COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#b91c1c', '#8b5cf6'];

@Component({
  imports: [],
  selector: 'app-chart',
  templateUrl: './chart.html',
})
export class Chart implements OnChanges, OnDestroy {

  @Input() data: ChartDatum[] = [];
  @Input() type: ChartType = 'bar';
  @Input() colors: string[] = DEFAULT_COLORS;
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: ChartJS;

  constructor() {
    // canvas cuma ada setelah view di-render, dan cuma di browser (aman dari SSR)
    afterNextRender(() => this.renderChart());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.chart.data.labels = this.data.map(d => d.label);
      this.chart.data.datasets[0].data = this.data.map(d => d.value);
      this.chart.update();
    }
  }

  private renderChart(): void {
    if (!this.canvasRef) return;
    const isPie = this.type === 'pie';

    this.chart = new ChartJS(this.canvasRef.nativeElement, {
      type: this.type,
      data: {
        labels: this.data.map(d => d.label),
        datasets: [{
          data: this.data.map(d => d.value),
          backgroundColor: isPie ? this.colors : this.colors[0],
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: isPie } },
      },
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

}
