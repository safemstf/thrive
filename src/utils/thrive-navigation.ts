
// src/utils/thrive-navigation.ts

import { ASSESSMENTS } from "@/app/dashboard/thrive/assessments/assessments.types";
import { Brain, MessageSquare, Code, Calculator, Lightbulb } from "lucide-react";

export class ThriveNavigation {
  /**
   * Get assessment route by ID
   */
  static getAssessmentRoute(id: string): string {
    const assessment = ASSESSMENTS.find(a => a.id === id);
    return assessment?.route || '/dashboard/thrive/assessments';
  }

  /**
   * Get skill type icon
   */
  static getSkillIcon(skillType: string) {
    switch (skillType) {
      case 'critical-thinking': return Brain;
      case 'linguistic': return MessageSquare;
      case 'technical': return Code;
      case 'analytical': return Calculator;
      case 'creative': return Lightbulb;
      default: return Brain;
    }
  }

  /**
   * Generate auth redirect URL for specific assessment
   */
  static getAuthRedirectUrl(assessmentRoute: string, isLogin = false): string {
    const authPath = isLogin ? '/auth/login' : '/auth/register';
    return `${authPath}?redirect=${encodeURIComponent(assessmentRoute)}`;
  }

  /**
   * Generate auth redirect URL for dashboard
   */
  static getDashboardAuthUrl(isLogin = false): string {
    return this.getAuthRedirectUrl('/dashboard/thrive', isLogin);
  }
}
