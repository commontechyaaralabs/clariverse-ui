'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getKPIs,
  getEisenhowerThreads,
  KPIData,
  EisenhowerThread,
} from '@/lib/api';
import { QueueHealthMonitor } from '@/components/email/QueueHealthMonitor';
import { BottleneckHeatmap } from '@/components/email/BottleneckHeatmap';
import { DecisionDebtTracker } from '@/components/email/DecisionDebtTracker';
import { AnomalyAlertsPanel } from '@/components/email/AnomalyAlertsPanel';
import { DailyDigestCard } from '@/components/email/DailyDigestCard';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ManagerDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [threads, setThreads] = useState<EisenhowerThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kpis, threadsData] = await Promise.all([
        getKPIs(),
        getEisenhowerThreads(),
      ]);

      setKpiData(kpis);
      setThreads(threadsData);
    } catch (error) {
      console.error('Error loading manager dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh disabled - data only loads on mount or manual refresh
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-[#b90abd]" />
              <span className="text-white text-lg">Loading manager dashboard...</span>
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
                Operational Dashboard - Manager View
              </h1>
            </div>
            <p className="text-gray-400 flex items-center gap-2">
              <span className="text-lg">⚙️</span>
              Agentic analytics for team workload and queue health
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
                  className="bg-[#b90abd]/10 border-[#b90abd]/30 text-[#b90abd] hover:bg-[#b90abd]/20"
                >
                  🧭 Executive Cockpit
                </Button>
              </Link>
              <Link href="/email/manager">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#b90abd]/10 border-[#b90abd]/30 text-[#b90abd] hover:bg-[#b90abd]/20 border-2"
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

        {/* Daily Digest */}
        <DailyDigestCard kpiData={kpiData} threads={threads} />

        {/* Queue Health Monitor */}
        <QueueHealthMonitor threads={threads} onRebalance={loadData} />

        {/* Bottleneck Heatmap */}
        <BottleneckHeatmap threads={threads} />

        {/* Decision Debt Tracker */}
        <DecisionDebtTracker kpiData={kpiData} />

        {/* Anomaly Alerts Panel */}
        <AnomalyAlertsPanel kpiData={kpiData} threads={threads} />
      </div>
    </div>
  );
}

