import { Injectable } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly register: promClient.Registry;

  // Métricas básicas para demonstração
  private readonly httpRequestsTotal: promClient.Counter;
  private readonly httpRequestDuration: promClient.Histogram;
  private readonly activeConnections: promClient.Gauge;

  constructor() {
    this.register = new promClient.Registry();

    // Adiciona métricas padrão do Node.js (CPU, memória, etc.)
    promClient.collectDefaultMetrics({ register: this.register });

    // Contador simples de requisições HTTP
    this.httpRequestsTotal = new promClient.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    // Histograma de duração de requisições
    this.httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
      registers: [this.register],
    });

    // Gauge simples para conexões ativas
    this.activeConnections = new promClient.Gauge({
      name: 'active_connections',
      help: 'Number of active connections',
      registers: [this.register],
    });

    // Simular algumas métricas básicas
    this.startBasicMetricsSimulation();
  }

  getMetrics(): Promise<string> {
    return this.register.metrics();
  }

  // Método para registrar uma requisição HTTP
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number): void {
    this.httpRequestsTotal.labels(method, route, statusCode.toString()).inc();
    this.httpRequestDuration.labels(method, route).observe(duration);
  }

  // Simulação básica de métricas para demonstração
  private startBasicMetricsSimulation(): void {
    // Simular algumas requisições HTTP periodicamente
    setInterval(() => {
      const methods = ['GET', 'POST', 'PUT', 'DELETE'];
      const routes = ['/api/health', '/api/users', '/api/data', '/metrics'];
      const statusCodes = [200, 201, 400, 404, 500];
      
      const method = methods[Math.floor(Math.random() * methods.length)];
      const route = routes[Math.floor(Math.random() * routes.length)];
      const statusCode = statusCodes[Math.floor(Math.random() * statusCodes.length)];
      const duration = Math.random() * 2; // 0-2 segundos
      
      this.recordHttpRequest(method, route, statusCode, duration);
      
      // Simular conexões ativas
      const connections = Math.floor(Math.random() * 50) + 10; // 10-60 conexões
      this.activeConnections.set(connections);
    }, 5000); // A cada 5 segundos
  }
}