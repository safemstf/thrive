// src/config/api-routes/simulations.routes.ts
import { RouteCategory, generateUniqueId } from '../api-routes';

export const simulationsRoutes: RouteCategory = {
  name: 'Simulations',
  routes: [
    {
      name: 'Get All Simulations',
      endpoint: '/api/simulations',
      method: 'GET',
      description: 'Get all simulations with filtering',
      queryParams: {
        limit: '10',
        page: '1'
      }
    },
    {
      name: 'Register Simulation',
      endpoint: '/api/simulations',
      method: 'POST',
      description: 'Register new simulation',
      body: () => ({
        simulation_id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: 'Test Simulation',
        type: 'physics',
        config: {
          test: true
        }
      })
    },
    {
      name: 'Get Simulation Stats',
      endpoint: '/api/simulations/stats',
      method: 'GET',
      description: 'Get comprehensive simulation statistics'
    },
    {
      name: 'Upload Simulation Results',
      endpoint: '/api/simulations/results',
      method: 'POST',
      description: 'Upload simulation results (legacy)',
      body: () => ({
        simulation_id: `sim_${Date.now()}`,
        results: {
          score: 85,
          completed: true
        }
      })
    },
    {
      name: 'Get Simulation by ID',
      endpoint: '/api/simulations/:id',
      method: 'GET',
      description: 'Get specific simulation details',
      params: {
        id: 'PLACEHOLDER_SIM_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Simulation Insights',
      endpoint: '/api/simulations/:id/insights',
      method: 'GET',
      description: 'Get simulation-specific analytics',
      params: {
        id: 'PLACEHOLDER_SIM_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Send Simulation Events',
      endpoint: '/api/simulations/:id/events',
      method: 'POST',
      description: 'Receive simulation events',
      params: {
        id: 'PLACEHOLDER_SIM_ID'
      },
      body: {
        events: [{
          type: 'interaction',
          timestamp: new Date().toISOString(),
          data: { action: 'click', target: 'button' }
        }]
      },
      skipInBatchTest: true
    },
    {
      name: 'Get Live Data',
      endpoint: '/api/simulations/:id/live-data',
      method: 'GET',
      description: 'Get live visualization data',
      params: {
        id: 'PLACEHOLDER_SIM_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Stream Events (SSE)',
      endpoint: '/api/simulations/:id/stream',
      method: 'GET',
      description: 'Real-time event stream (SSE)',
      params: {
        id: 'PLACEHOLDER_SIM_ID'
      },
      skipInBatchTest: true // SSE doesn't work well in batch tests
    },
    {
      name: 'Disconnect Simulation',
      endpoint: '/api/simulations/:id/disconnect',
      method: 'POST',
      description: 'Handle simulation disconnect',
      params: {
        id: 'PLACEHOLDER_SIM_ID'
      },
      skipInBatchTest: true
    },
    {
      name: 'Delete Simulation',
      endpoint: '/api/simulations/:id',
      method: 'DELETE',
      description: 'Delete simulation data',
      params: {
        id: 'PLACEHOLDER_SIM_ID'
      },
      skipInBatchTest: true
    },
    
    // Legacy endpoints that the backend supports
    {
      name: 'Legacy Simulation Data',
      endpoint: '/api/simulation-data',
      method: 'POST',
      description: 'Legacy simulation data endpoint',
      body: {
        simulation_id: 'sim_legacy_test',
        type: 'test_event',
        timestamp: new Date().toISOString(),
        data: { test: true }
      }
    },
    {
      name: 'Legacy Events',
      endpoint: '/api/events',
      method: 'POST',
      description: 'Legacy events endpoint',
      body: {
        simulation_id: 'sim_legacy_test',
        event_type: 'interaction',
        data: { action: 'test' }
      }
    },
    {
      name: 'Legacy Simulation Results',
      endpoint: '/api/simulation-results',
      method: 'POST',
      description: 'Legacy results endpoint',
      body: {
        simulation_id: 'sim_legacy_test',
        score: 90,
        completed: true
      }
    }
  ]
};