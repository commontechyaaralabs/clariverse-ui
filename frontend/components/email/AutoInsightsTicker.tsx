'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { KPIData, EisenhowerThread } from '@/lib/api';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface AutoInsightsTickerProps {
  kpiData: KPIData | null;
  threads: EisenhowerThread[];
}

interface Insight {
  id: string;
  text: string;
  severity: 'critical' | 'warning' | 'info';
}

export function AutoInsightsTicker({ kpiData, threads }: AutoInsightsTickerProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!kpiData || threads.length === 0) return;

    const generateInsights = (): Insight[] => {
      const newInsights: Insight[] = [];

      // SLA breach insights
      if (kpiData.sla_breach_risk_percentage > 10) {
        const atRiskCount = Math.round(
          (threads.length * kpiData.sla_breach_risk_percentage) / 100
        );
        const estimatedValue = Math.round(atRiskCount * (kpiData.business_impact_score || 72.3) * 10000);
        newInsights.push({
          id: 'sla-breach',
          text: `${atRiskCount} threads likely to breach SLA today (₹${(estimatedValue / 100000).toFixed(1)} Cr)`,
          severity: kpiData.sla_breach_risk_percentage > 20 ? 'critical' : 'warning',
        });
      }

      // Decision debt insights
      const decisionDebtHours = Math.round(
        (kpiData.internal_pending_count || 0) * (kpiData.avg_resolution_time_days || 2.3) * 24
      );
      if (decisionDebtHours > 500) {
        newInsights.push({
          id: 'decision-debt',
          text: `Decision debt at ${decisionDebtHours}hrs - ${kpiData.internal_pending_count} items pending internal action`,
          severity: decisionDebtHours > 1000 ? 'critical' : 'warning',
        });
      }

      // Intent spike insights
      const p1Threads = threads.filter((t) => t.priority === 'P1').length;
      if (p1Threads > 50) {
        newInsights.push({
          id: 'intent-spike',
          text: `${p1Threads} P1 threads detected - Intent spike in high-priority communications`,
          severity: p1Threads > 100 ? 'critical' : 'warning',
        });
      }

      // Friction insights
      const negativeSentimentThreads = threads.filter(
        (t) => (t.overall_sentiment || 3) < 2.5
      ).length;
      const frictionPercent = (negativeSentimentThreads / threads.length) * 100;
      if (frictionPercent > 30) {
        newInsights.push({
          id: 'friction',
          text: `Friction delta ${frictionPercent.toFixed(1)}% - ${negativeSentimentThreads} threads with negative sentiment`,
          severity: frictionPercent > 40 ? 'critical' : 'warning',
        });
      }

      // Escalation insights
      if (kpiData.escalation_rate > 10) {
        newInsights.push({
          id: 'escalation',
          text: `Escalation rate ${kpiData.escalation_rate.toFixed(1)}% - ${kpiData.escalation_count} threads escalated`,
          severity: kpiData.escalation_rate > 15 ? 'critical' : 'warning',
        });
      }

      // Silent threads
      const silentThreads = threads.filter((t) => {
        const daysSinceLastMessage =
          (new Date().getTime() - new Date(t.last_message_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceLastMessage > 3 && t.resolution_status !== 'closed';
      }).length;
      if (silentThreads > 20) {
        newInsights.push({
          id: 'silent',
          text: `${silentThreads} silent threads detected - No activity for >3 days`,
          severity: silentThreads > 50 ? 'critical' : 'warning',
        });
      }

      return newInsights;
    };

    const newInsights = generateInsights();
    setInsights(newInsights);

    // Rotate insights every 60 seconds
    if (newInsights.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % newInsights.length);
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [kpiData, threads]);

  if (insights.length === 0) {
    return null;
  }

  const currentInsight = insights[currentIndex];
  const severityColors = {
    critical: 'text-red-400 border-red-500/30 bg-red-500/10',
    warning: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
    info: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  };

  return (
    <Card className="bg-gray-900 border-gray-700 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2 flex-shrink-0">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-medium text-gray-400">Auto-Insights</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <motion.div
            key={currentInsight.id}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5 }}
            className={`px-3 py-1.5 rounded border ${severityColors[currentInsight.severity]}`}
          >
            <p className="text-sm font-medium whitespace-nowrap">{currentInsight.text}</p>
          </motion.div>
        </div>
        <div className="flex-shrink-0 text-xs text-gray-500">
          {currentIndex + 1}/{insights.length}
        </div>
      </div>
    </Card>
  );
}

