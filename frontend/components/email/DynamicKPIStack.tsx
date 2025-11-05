'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { KPIData } from '@/lib/api';
import { TrendingUp, TrendingDown, AlertCircle, Clock, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicKPIStackProps {
  data: KPIData;
  previousData?: KPIData | null;
}

interface KPIItem {
  id: string;
  label: string;
  value: string;
  unit?: string;
  icon: typeof TrendingUp;
  color: string;
  bgColor: string;
  delta?: number;
  deltaLabel?: string;
}

export function DynamicKPIStack({ data, previousData }: DynamicKPIStackProps) {
  const [displayData, setDisplayData] = useState<KPIData>(data);

  // Update display data when new data arrives
  useEffect(() => {
    setDisplayData(data);
  }, [data]);

  // Calculate decision debt in hours (approximate: pending internal × avg resolution time)
  const decisionDebtHours = Math.round(
    (data.internal_pending_count || 0) * (data.avg_resolution_time_days || 2.3) * 24
  );

  // Calculate value at risk (₹) - approximate based on P1 threads and business impact
  const valueAtRisk = Math.round(
    (data.urgent_threads_count || 0) * (data.business_impact_score || 72.3) * 10000
  );

  // Calculate intent spikes (percentage change in thread volume)
  const intentSpike = previousData
    ? ((data.total_threads - previousData.total_threads) / previousData.total_threads) * 100
    : 0;

  // Calculate SLA breach percentage
  const slaBreachPercent = data.sla_breach_risk_percentage || 0;

  const kpiItems: KPIItem[] = [
    {
      id: 'sla-breach',
      label: 'SLA Breach %',
      value: slaBreachPercent.toFixed(1),
      unit: '%',
      icon: AlertCircle,
      color: slaBreachPercent > 10 ? 'text-red-400' : slaBreachPercent > 5 ? 'text-yellow-400' : 'text-green-400',
      bgColor: slaBreachPercent > 10 ? 'bg-red-500/10' : slaBreachPercent > 5 ? 'bg-yellow-500/10' : 'bg-green-500/10',
      delta: previousData
        ? slaBreachPercent - (previousData.sla_breach_risk_percentage || 0)
        : undefined,
    },
    {
      id: 'decision-debt',
      label: 'Decision Debt',
      value: decisionDebtHours.toLocaleString(),
      unit: 'hrs',
      icon: Clock,
      color: decisionDebtHours > 1000 ? 'text-red-400' : decisionDebtHours > 500 ? 'text-yellow-400' : 'text-blue-400',
      bgColor: decisionDebtHours > 1000 ? 'bg-red-500/10' : decisionDebtHours > 500 ? 'bg-yellow-500/10' : 'bg-blue-500/10',
      delta: previousData
        ? decisionDebtHours -
          Math.round(
            ((previousData.internal_pending_count || 0) * (previousData.avg_resolution_time_days || 2.3) * 24)
          )
        : undefined,
    },
    {
      id: 'value-at-risk',
      label: '₹ At-Risk',
      value: `₹${(valueAtRisk / 100000).toFixed(1)}Cr`,
      icon: DollarSign,
      color: valueAtRisk > 50000000 ? 'text-red-400' : valueAtRisk > 20000000 ? 'text-yellow-400' : 'text-green-400',
      bgColor: valueAtRisk > 50000000 ? 'bg-red-500/10' : valueAtRisk > 20000000 ? 'bg-yellow-500/10' : 'bg-green-500/10',
    },
    {
      id: 'intent-spikes',
      label: 'Intent Spikes',
      value: intentSpike > 0 ? `↑ ${intentSpike.toFixed(1)}` : `↓ ${Math.abs(intentSpike).toFixed(1)}`,
      unit: '%',
      icon: Activity,
      color: intentSpike > 10 ? 'text-red-400' : intentSpike > 0 ? 'text-yellow-400' : 'text-blue-400',
      bgColor: intentSpike > 10 ? 'bg-red-500/10' : intentSpike > 0 ? 'bg-yellow-500/10' : 'bg-blue-500/10',
      delta: intentSpike,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <AnimatePresence>
        {kpiItems.map((item) => {
          const Icon = item.icon;
          const hasDelta = item.delta !== undefined && item.delta !== 0;
          const isPositive = item.delta !== undefined && item.delta < 0; // Negative delta is good for most metrics

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <Card
                className={`relative overflow-hidden border-l-4 ${
                  hasDelta && !isPositive
                    ? 'border-l-red-500 animate-pulse'
                    : hasDelta && isPositive
                      ? 'border-l-green-500'
                      : 'border-l-gray-600'
                } bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300`}
              >
                {/* Animated background on delta change */}
                {hasDelta && (
                  <motion.div
                    className={`absolute inset-0 ${
                      isPositive ? 'bg-green-500/5' : 'bg-red-500/5'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  />
                )}

                <CardContent className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-400">{item.label}</span>
                    <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <motion.span
                      key={item.value}
                      initial={{ scale: 1.2, color: '#ffffff' }}
                      animate={{ scale: 1, color: '#ffffff' }}
                      transition={{ duration: 0.3 }}
                      className="text-2xl font-bold text-white"
                    >
                      {item.value}
                    </motion.span>
                    {item.unit && (
                      <span className="text-sm text-gray-400">{item.unit}</span>
                    )}
                  </div>

                  {hasDelta && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-1 mt-2"
                    >
                      {isPositive ? (
                        <TrendingDown className="h-3 w-3 text-green-400" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-400" />
                      )}
                      <span
                        className={`text-xs font-medium ${
                          isPositive ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {Math.abs(item.delta!).toFixed(1)}
                      </span>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

