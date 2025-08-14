// src/services/api.ts - Enhanced version
import { Assessment, PlatformStats, LeaderboardEntry, RankedUser } from '@/types/thrive.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Enhanced error types
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request interceptor for auth
interface RequestConfig extends RequestInit {
  requiresAuth?: boolean;
}

class ApiService {
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const { requiresAuth = false, ...options } = config || {};
    
    const headers = {
      'Content-Type': 'application/json',
      ...(requiresAuth && this.getAuthHeaders()),
      ...options?.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new ApiError(response.status, `API Error: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(0, 'Network error occurred');
    }
  }

  // Assessment endpoints
  async getAssessments(): Promise<Assessment[]> {
    return this.request<Assessment[]>('/assessments');
  }

  async getAssessment(id: string): Promise<Assessment> {
    return this.request<Assessment>(`/assessments/${id}`);
  }

  async getFeaturedAssessments(): Promise<Assessment[]> {
    return this.request<Assessment[]>('/assessments/featured');
  }

  // Platform stats endpoints
  async getPlatformStats(): Promise<PlatformStats> {
    return this.request<PlatformStats>('/stats');
  }

  async getRealtimeStats(): Promise<Partial<PlatformStats>> {
    return this.request<Partial<PlatformStats>>('/stats/realtime');
  }

  // Leaderboard endpoints
  async getLeaderboard(limit: number = 10): Promise<RankedUser[]> {
    return this.request<RankedUser[]>(`/leaderboard?limit=${limit}`);
  }

  async getGlobalLeaderboard(skillType?: string): Promise<RankedUser[]> {
    const query = skillType ? `?skillType=${skillType}` : '';
    return this.request<RankedUser[]>(`/leaderboard/global${query}`);
  }

  // User assessment endpoints
  async startAssessment(assessmentId: string): Promise<{ sessionId: string; timeLimit: number }> {
    return this.request<{ sessionId: string; timeLimit: number }>(
      `/assessments/${assessmentId}/start`, 
      { method: 'POST', requiresAuth: true }
    );
  }

  async submitAssessment(
    sessionId: string, 
    answers: any[]
  ): Promise<{ score: number; results: any; percentile: number }> {
    return this.request<{ score: number; results: any; percentile: number }>(
      `/assessments/sessions/${sessionId}/submit`, 
      {
        method: 'POST',
        body: JSON.stringify({ answers }),
        requiresAuth: true
      }
    );
  }

  async getAssessmentSession(sessionId: string): Promise<{
    id: string;
    assessmentId: string;
    currentQuestion: number;
    timeRemaining: number;
    status: 'active' | 'completed' | 'expired';
  }> {
    return this.request(`/assessments/sessions/${sessionId}`, { requiresAuth: true });
  }

  // User profile endpoints
  async getUserProfile(): Promise<{
    id: string;
    name: string;
    email: string;
    verified: boolean;
    completedAssessments: number;
    averageScore: number;
    rank: number;
    skills: Record<string, number>;
  }> {
    return this.request('/users/profile', { requiresAuth: true });
  }

  async getUserAssessments(): Promise<{
    completed: Assessment[];
    inProgress: Assessment[];
    recommended: Assessment[];
  }> {
    return this.request('/users/assessments', { requiresAuth: true });
  }

  // Analytics endpoints
  async getSkillAnalytics(): Promise<{
    marketDemand: Record<string, number>;
    salaryCorrelation: Record<string, number>;
    industryBreakdown: Record<string, Record<string, number>>;
  }> {
    return this.request('/analytics/skills');
  }

  async getIndustryInsights(): Promise<{
    topSkills: string[];
    growthTrends: Record<string, number>;
    demandForecast: Record<string, number>;
  }> {
    return this.request('/analytics/industry');
  }

  // Employer verification endpoints
  async submitVerificationRequest(data: {
    companyName: string;
    jobTitle: string;
    workEmail: string;
    linkedinProfile?: string;
  }): Promise<{ requestId: string; status: 'pending' | 'approved' | 'rejected' }> {
    return this.request('/verification/request', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true
    });
  }

  async getVerificationStatus(): Promise<{
    status: 'none' | 'pending' | 'verified' | 'rejected';
    submittedAt?: string;
    verifiedAt?: string;
  }> {
    return this.request('/verification/status', { requiresAuth: true });
  }
}

export const apiService = new ApiService();
