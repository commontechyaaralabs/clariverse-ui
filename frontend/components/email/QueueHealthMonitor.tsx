'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GaugeChart from '@/components/charts/GaugeChart';
import { EisenhowerThread } from '@/lib/api';
import { Activity, Users, RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface QueueHealthMonitorProps {
  threads: EisenhowerThread[];
  onRebalance?: () => void;
}

interface OwnerStatus {
  owner: string;
  openThreads: number;
  throughput: number; // threads per day
  slaTarget: number; // target threads per day
  status: 'healthy' | 'warning' | 'critical';
}

export function QueueHealthMonitor({ threads, onRebalance }: QueueHealthMonitorProps) {
  const [isRebalancing, setIsRebalancing] = useState(false);

  const queueData = useMemo(() => {
    // Group threads by owner
    const ownerMap = new Map<string, EisenhowerThread[]>();

    threads.forEach((thread) => {
      const owner = thread.owner || thread.assigned_to || 'Unassigned';
      const existing = ownerMap.get(owner) || [];
      existing.push(thread);
      ownerMap.set(owner, existing);
    });

    // Calculate owner statuses
    const ownerStatuses: OwnerStatus[] = Array.from(ownerMap.entries()).map(([owner, ownerThreads]) => {
      const openThreads = ownerThreads.filter((t) => t.resolution_status !== 'closed').length;
      
      // Estimate throughput (simplified: calculate from thread ages)
      // Calculate average age of resolved threads or use default
      const now = new Date().getTime();
      const resolvedThreads = ownerThreads.filter(t => t.resolution_status === 'closed');
      const avgResolutionDays = resolvedThreads.length > 0
        ? resolvedThreads.reduce((sum, t) => {
            const firstMessageTime = new Date(t.first_message_at || t.last_message_at).getTime();
            const lastMessageTime = new Date(t.last_message_at).getTime();
            const resolutionDays = (lastMessageTime - firstMessageTime) / (1000 * 60 * 60 * 24);
            return sum + (resolutionDays || 2.3);
          }, 0) / resolvedThreads.length
        : 2.3; // Default fallback
      const throughput = avgResolutionDays > 0 ? 7 / avgResolutionDays : 0; // threads per week
      
      // SLA target: assume 10 threads per day per owner
      const slaTarget = 10 * 7; // per week
      
      // Calculate status
      const ratio = slaTarget > 0 ? openThreads / slaTarget : 0;
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (ratio > 1.5) status = 'critical';
      else if (ratio > 1.0) status = 'warning';

      return {
        owner,
        openThreads,
        throughput,
        slaTarget,
        status,
      };
    }).sort((a, b) => b.openThreads - a.openThreads);

    // Calculate overall queue health
    const totalOpen = threads.filter((t) => t.resolution_status !== 'closed').length;
    const totalThroughput = ownerStatuses.reduce((sum, o) => sum + o.throughput, 0);
    const totalSlaTarget = ownerStatuses.reduce((sum, o) => sum + o.slaTarget, 0);
    
    // Calculate queue health based on multiple factors:
    // 1. Capacity utilization (inverse - less is better)
    // 2. Status distribution (how many owners are in critical/warning)
    // 3. Average owner load (how evenly distributed)
    
    // Factor 1: Capacity utilization (0-100%)
    // If we're at 0% capacity, that's 100% health
    // If we're at 50% capacity, that's 75% health
    // If we're at 100% capacity, that's 50% health
    // If we're at 200% capacity, that's 10% health (minimum floor)
    const capacityUtilization = totalSlaTarget > 0 ? (totalOpen / totalSlaTarget) : 0;
    const capacityHealth = capacityUtilization <= 1.0 
      ? 100 - (capacityUtilization * 50) // 0-100% utilization = 100-50% health
      : Math.max(10, 50 - (capacityUtilization - 1.0) * 40); // >100% = 50-10% health (floor at 10%)
    
    // Factor 2: Status distribution penalty
    const criticalOwners = ownerStatuses.filter((o) => o.status === 'critical').length;
    const warningOwners = ownerStatuses.filter((o) => o.status === 'warning').length;
    const totalOwners = ownerStatuses.length;
    const criticalRatio = totalOwners > 0 ? criticalOwners / totalOwners : 0;
    const warningRatio = totalOwners > 0 ? warningOwners / totalOwners : 0;
    
    // Status penalty: reduce health based on critical/warning ratio
    let statusPenalty = 0;
    if (criticalRatio > 0.7) statusPenalty = 40; // >70% critical = -40%
    else if (criticalRatio > 0.5) statusPenalty = 30; // >50% critical = -30%
    else if (criticalRatio > 0.3) statusPenalty = 20; // >30% critical = -20%
    else if (warningRatio > 0.5) statusPenalty = 10; // >50% warning = -10%
    
    // Factor 3: Load balance (how evenly distributed is the workload)
    // If all owners have similar load, that's good
    // If some owners are overloaded while others are idle, that's bad
    let loadBalancePenalty = 0;
    if (ownerStatuses.length > 1) {
      const avgLoad = ownerStatuses.reduce((sum, o) => sum + o.openThreads, 0) / ownerStatuses.length;
      const maxLoad = Math.max(...ownerStatuses.map((o) => o.openThreads));
      const loadVariance = avgLoad > 0 ? (maxLoad / avgLoad) : 1;
      // If max load is >2x average, apply penalty
      if (loadVariance > 2.5) loadBalancePenalty = 15;
      else if (loadVariance > 2.0) loadBalancePenalty = 10;
    }
    
    // Combine all factors, but ensure minimum of 5% to show there's still some capacity
    const queueHealth = Math.max(5, Math.min(100, capacityHealth - statusPenalty - loadBalancePenalty));

    return {
      ownerStatuses,
      queueHealth: Math.round(queueHealth * 10) / 10, // Round to 1 decimal
      totalOpen,
      totalThroughput: Math.round(totalThroughput * 10) / 10, // Round to 1 decimal
    };
  }, [threads]);

  const handleRebalance = async () => {
    setIsRebalancing(true);
    try {
      // Simulate AI rebalancing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (onRebalance) {
        onRebalance();
      }
    } finally {
      setIsRebalancing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Queue Health Monitor</CardTitle>
          </div>
          <Button
            onClick={handleRebalance}
            disabled={isRebalancing}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white"
            size="sm"
          >
            {isRebalancing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Rebalancing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Rebalance Queue
              </>
            )}
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          Real-time gauge: open threads / throughput × SLA target
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gauge Chart */}
          <div className="flex items-center justify-center min-h-[400px] w-full">
            <div className="w-full max-w-lg">
              <GaugeChart
                data={[
                  {
                    name: 'Queue Health',
                    value: 100, // Use 100 as base for gauge visualization
                    color: queueData.queueHealth > 80 ? '#10b981' : queueData.queueHealth > 50 ? '#eab308' : '#ef4444',
                    percentage: queueData.queueHealth,
                  },
                ]}
                title="Queue Health"
              />
            </div>
          </div>

          {/* Owner Mini Cards */}
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Owner Status
            </div>
            {queueData.ownerStatuses.slice(0, 6).map((owner, index) => (
              <motion.div
                key={owner.owner}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(owner.status)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{owner.owner}</p>
                    <p className="text-xs text-gray-400">
                      {owner.openThreads} open • {owner.throughput.toFixed(1)}/week throughput
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {owner.status}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

