// src/config/api-routes/health.routes.ts
import { RouteCategory } from '../api-routes';

export const healthRoutes: RouteCategory = {
  name: 'Health',
  routes: [
    {
      name: 'Basic Health Check',
      endpoint: '/api/health',
      method: 'GET',
      description: 'Basic health check'
    },
    {
      name: 'Detailed Health',
      endpoint: '/api/health/detailed',
      method: 'GET',
      description: 'Detailed system health'
    },
    {
      name: 'Readiness Probe',
      endpoint: '/api/health/ready',
      method: 'GET',
      description: 'Readiness probe'
    },
    {
      name: 'Liveness Probe',
      endpoint: '/api/health/live',
      method: 'GET',
      description: 'Liveness probe'
    },
    {
      name: 'API Documentation',
      endpoint: '/api',
      method: 'GET',
      description: 'Get API documentation'
    },
    {
      name: 'Routing Health',
      endpoint: '/api/routing-health',
      method: 'GET',
      description: 'Get routing system health'
    }
  ]
};