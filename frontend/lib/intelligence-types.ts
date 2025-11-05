// Intelligence Layer Types for AI Business Command Center

export interface Action {
  id: string;
  type: 'escalate' | 'respond' | 'assign' | 'schedule' | 'notify' | 'create_task';
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime?: string;
  requiresApproval?: boolean;
}

export interface RiskRadarData {
  risks: {
    id: string;
    x: number;
    y: number;
    severity: number;
    color: string;
    label: string;
    threadId?: string;
    description: string;
  }[];
  criticalCount: number;
  warningCount: number;
  mitigatedCount: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  suggestedAction: Action;
  supportingData: {
    threads: string[];
    metrics: Record<string, any>;
  };
  expectedOutcome: string;
  riskAssessment: {
    riskLevel: 'low' | 'medium' | 'high';
    concerns: string[];
  };
}

export type AIMode = 'advisor' | 'autopilot' | 'learning';

export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}
