import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import DOMPurify from 'dompurify';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  items: any[] = [];
  error: string = '';
  loading: boolean = true;
  chartRefs: { [key: string]: ElementRef } = {};

  constructor(private apiService: ApiService, private toastService: ToastService) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData(): void {
    this.apiService.getReportsData().subscribe(
      response => {
        console.log('API Response:', response); // Debug log
        this.items = response.items;
        this.loading = false;
        this.renderCharts();
      },
      error => {
        this.error = 'Failed to fetch data';
        console.error('Error fetching Summary data', error);
        this.loading = false;
      }
    );
  }

  renderCharts(): void {
    this.items.forEach(item => {
      if (item.type === 'chart' && this.chartRefs[item.data.id]) {
        try {
          const chartData = JSON.parse(item.data.chart_data);
          const chartConfig = chartData.chart;
          const svg = d3.select(this.chartRefs[item.data.id].nativeElement)
            .attr('width', 500)
            .attr('height', 300)
            .attr('role', 'img')
            .attr('aria-label', chartConfig.title);

          // Clear previous content
          svg.selectAll('*').remove();

          if (chartConfig.type === 'bar') {
            this.renderBarChart(svg, chartConfig);
          } else if (chartConfig.type === 'line') {
            this.renderLineChart(svg, chartConfig);
          } else if (chartConfig.type === 'pie') {
            this.renderPieChart(svg, chartConfig);
          }
        } catch (error) {
          console.error('Error rendering chart:', error);
        }
      }
    });
  }

  renderBarChart(svg: any, config: any): void {
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(config.series[0].labels)
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, config.yScale?.maximum || d3.max(config.series[0].data) || 0])
      .nice()
      .range([height, 0]);

    // Add grid
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => ''));

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y));

    // Add bars with animation
    g.selectAll('.bar')
      .data(config.series[0].data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: number, i: number) => x(config.series[0].labels[i]))
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', config.colors?.[0] || '#4CAF50')
      .transition()
      .duration(1000)
      .attr('y', (d: number) => y(d))
      .attr('height', (d: number) => height - y(d));

    // Add chart title inside the SVG
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .text(config.title);

    // Add axis labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 30)
      .attr('text-anchor', 'middle')
      .text(config.series[0].name);

    // Add caption inside the SVG
    if (config.caption) {
      console.log('Caption:', config.caption); // Debug log
      g.append('text')
        .attr('class', 'chart-caption')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#555')
        .text(config.caption);
    }
  }

  renderLineChart(svg: any, config: any): void {
    const margin = { top: 40, right: 20, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom + 70;

    const g = svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(config.series[0].labels)
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, config.yScale?.maximum || d3.max(config.series[0].data) || 0])
      .nice()
      .range([height, 0]);

    // Add grid
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickSize(-width)
        .tickFormat(() => ''));

    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y));

    // Add line with animation
    const line = d3.line()
      .x((d: [number, number], i: number) => x(config.series[0].labels[i] || '')! + x.bandwidth() / 2)
      .y((d: [number, number]) => y(d[1]));

    const path = g.append('path')
      .datum(config.series[0].data)
      .attr('class', 'line')
      .attr('stroke', config.colors?.[0] || '#2196F3')
      .attr('d', line);

    // Add points
    g.selectAll('.dot')
      .data(config.series[0].data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d: number, i: number) => (x(config.series[0].labels[i]) ?? 0) + x.bandwidth() / 2)
      .attr('cy', (d: number) => y(d))
      .attr('r', 4)
      .attr('fill', config.colors?.[0] || '#2196F3');

    // Add chart title inside the SVG
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .text(config.title);

    // Add axis labels
    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', width / 2)
      .attr('y', height + margin.bottom - 30)
      .attr('text-anchor', 'middle')
      .text(config.series[0].name);

    // Add caption inside the SVG
    if (config.caption) {
      g.append('text')
        .attr('class', 'chart-caption')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#555')
        .text(config.caption);
    }
  }

  renderPieChart(svg: any, config: any): void {
    const width = 500;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
      .value((d: any) => (d as { name: string; value: number }).value);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius - 50);

    const arcs = g.selectAll('.arc')
      .data(pie(config.series[0].data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .style('fill', (d: d3.PieArcDatum<{ name: string; value: number }>, i: number) => config.colors[i])
      .style('opacity', 0.8)
      .on('mouseover', function(this: SVGPathElement) {
      d3.select(this)
        .style('opacity', 1)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
      })
      .on('mouseout', function(this: SVGPathElement) {
      d3.select(this)
        .style('opacity', 0.8)
        .attr('stroke', 'none');
      });

    arcs.append('text')
      .attr('transform', (d: any) => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('fill', '#fff')
      .text((d: d3.PieArcDatum<{ name: string; value: number }>) => `${d.data.name}: ${d.data.value}%`);

    // Add chart title inside the SVG
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', 0)
      .attr('y', -radius + 20)
      .attr('text-anchor', 'middle')
      .text(config.title);

    // Add caption inside the SVG
    if (config.caption) {
      g.append('text')
        .attr('class', 'chart-caption')
        .attr('x', 0)
        .attr('y', radius - 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#555')
        .text(config.caption);
    }
  }

  renderContent(content: any): string {
    return DOMPurify.sanitize(content.data.html_content);
  }
}