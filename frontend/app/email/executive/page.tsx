'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getKPIs,
  getEisenhowerThreads,
  getActionableCards,
  KPIData,
  EisenhowerThread,
  ActionableCard,
} from '@/lib/api';
import { DynamicKPIStack } from '@/components/email/DynamicKPIStack';
import { RiskRadarPolar } from '@/components/email/RiskRadarPolar';
import { IntentFlowMap } from '@/components/email/IntentFlowMap';
import { NextActionsFeed } from '@/components/email/NextActionsFeed';
import { AutoInsightsTicker } from '@/components/email/AutoInsightsTicker';
import { runNextAction } from '@/lib/actions';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ExecutiveCockpit() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [previousKpiData, setPreviousKpiData] = useState<KPIData | null>(null);
  const [threads, setThreads] = useState<EisenhowerThread[]>([]);
  const [actionableCards, setActionableCards] = useState<ActionableCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Store previous data for delta calculations
      if (kpiData) {
        setPreviousKpiData(kpiData);
      }

      const [kpis, threadsData, actions] = await Promise.all([
        getKPIs(),
        getEisenhowerThreads(),
        getActionableCards(),
      ]);

      setKpiData(kpis);
      setThreads(threadsData);
      setActionableCards(actions);
    } catch (error) {
      console.error('Error loading executive cockpit data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed kpiData dependency to prevent auto-refresh

  useEffect(() => {
    loadData();
    // Auto-refresh disabled - data only loads on mount or manual refresh
  }, []);

  const handleRunAction = useCallback(async (actionId: string, actionType: string) => {
    try {
      await runNextAction(actionId, actionType);
      // Reload data after action
      await loadData();
    } catch (error) {
      console.error('Error running action:', error);
    }
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-[#b90abd]" />
              <span className="text-white text-lg">Loading executive cockpit...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--sidebar)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">
                Decision Wall - Executive Cockpit
              </h1>
            </div>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="text-lg">🧭</span>
              F1 telemetry wall for communications intelligence
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link href="/email">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-indigo-600/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20"
                >
                  📊 Executive Summary
                </Button>
              </Link>
              <Link href="/email/executive">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#b90abd]/10 border-[#b90abd]/30 text-[#b90abd] hover:bg-[#b90abd]/20 border-2"
                >
                  🧭 Executive Cockpit
                </Button>
              </Link>
              <Link href="/email/manager">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#b90abd]/10 border-[#b90abd]/30 text-[#b90abd] hover:bg-[#b90abd]/20"
                >
                  ⚙️ Manager View
                </Button>
              </Link>
              <Link href="/email/finance">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-600/10 border-green-500/30 text-green-300 hover:bg-green-600/20"
                >
                  🧑‍💼 Finance View
                </Button>
              </Link>
              <Link href="/email/ops">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-yellow-600/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-600/20"
                >
                  🧑‍💼 Ops View
                </Button>
              </Link>
            </div>
          </div>
          <Button
            onClick={loadData}
            variant="outline"
            className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Top Strip: Dynamic KPI Stack */}
        {kpiData && (
          <DynamicKPIStack data={kpiData} previousData={previousKpiData} />
        )}

        {/* Auto-Insights Ticker */}
        {kpiData && <AutoInsightsTicker kpiData={kpiData} threads={threads} />}

        {/* Center: Risk Radar and Intent Flow Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Risk Radar */}
          <RiskRadarPolar threads={threads} />

          {/* Intent Flow Map */}
          <IntentFlowMap threads={threads} />
        </div>

        {/* Bottom: Next 10 Actions Feed */}
        <NextActionsFeed actions={actionableCards} onRunAction={handleRunAction} />
      </div>
    </div>
  );
}

