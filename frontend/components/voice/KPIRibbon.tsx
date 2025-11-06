'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { KPIData } from '@/lib/voiceData';

interface KPIRibbonProps {
  data: KPIData;
}

export function KPIRibbon({ data }: KPIRibbonProps) {
      const kpis = [
        {
          label: 'Team QA Score',
          description: 'Overall communication quality score calculated from compliance adherence, empathy, tone, resolution accuracy, and listening patterns. Higher scores indicate better team performance.',
          value: data.overallTeamQAScore.value.toFixed(1),
          unit: '%',
          chart: null,
          trend: data.overallTeamQAScore.trend[6] > data.overallTeamQAScore.trend[0] ? 'up' : 'down'
        },
        {
          label: 'Compliance Adherence',
          description: 'Measures how well agents follow mandatory banking scripts including KYC verification, fraud guidelines, and regulatory wording. Critical for legal and regulatory compliance.',
          value: data.complianceAdherence.value.toFixed(1),
          unit: '%',
          chart: null,
          trend: 'up' as const
        },
        {
          label: 'Customer Emotion',
          description: 'Aggregated emotional state of customers based on AI sentiment analysis of call transcripts. Lower values indicate better customer satisfaction. Scale of 1-5 where lower scores mean happier, more satisfied customers.',
          value: data.customerEmotionIndex.value.toFixed(1),
          unit: '/5',
          chart: null,
          trend: data.customerEmotionIndex.trend[6] < data.customerEmotionIndex.trend[0] ? 'up' : 'down'
        },
        {
          label: 'High-Risk Calls',
          description: 'Number of calls flagged as critical or risky due to escalation likelihood, angry customers, or compliance violations. These calls require immediate manager review.',
          value: data.highRiskCallsCount.value.toString(),
          unit: '',
          chart: null,
          trend: data.highRiskCallsCount.trend
        },
        {
          label: 'Escalation Risk',
          description: 'AI-predicted probability of call escalations based on customer sentiment, agent behavior, and call patterns. Lower scores indicate better risk management.',
          value: data.escalationRiskScore.value.toFixed(1),
          unit: '%',
          chart: null,
          trend: 'down' as const
        },
        {
          label: 'Total Calls',
          description: 'Total number of calls handled by the team during the selected timeframe. Includes all call types and statuses. Track volume trends to manage workload.',
          value: data.totalCallsHandled.value.toString(),
          unit: '',
          chart: null,
          trend: 'up' as const
        }
      ];

  return (
    <TooltipProvider>
      <div className="grid grid-cols-6 gap-3 mb-6">
        {kpis.map((kpi, idx) => (
          <Tooltip key={idx}>
            <TooltipTrigger asChild>
              <Card className="p-3 cursor-help relative">
                <div className="absolute top-2 left-2 text-lg">✨</div>
                {kpi.trend === 'up' && <TrendingUp className="absolute top-2 right-2 w-4 h-4 text-green-500" />}
                {kpi.trend === 'down' && <TrendingDown className="absolute top-2 right-2 w-4 h-4 text-red-500" />}
                {kpi.trend === 'stable' && <Minus className="absolute top-2 right-2 w-4 h-4 text-gray-500" />}
                <CardContent className="p-0 space-y-2">
                  <div className="flex flex-col items-center justify-center text-center">
                    <p className="text-2xl font-bold text-white">{kpi.value}{kpi.unit}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                  </div>
                  {kpi.chart && <div className="h-8">{kpi.chart}</div>}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <p className="font-semibold mb-1">{kpi.label}</p>
              <p className="text-sm">{kpi.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

