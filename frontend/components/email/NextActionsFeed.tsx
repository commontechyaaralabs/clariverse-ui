'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActionableCard } from '@/lib/api';
import { Play, Clock, Target, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface NextActionsFeedProps {
  actions: ActionableCard[];
  onRunAction?: (actionId: string, actionType: string) => void;
}

export function NextActionsFeed({ actions, onRunAction }: NextActionsFeedProps) {
  const [runningActions, setRunningActions] = useState<Set<string>>(new Set());

  // Rank and take top 10
  const rankedActions = actions
    .sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    })
    .slice(0, 10);

  const handleRun = async (actionId: string, actionType: string) => {
    setRunningActions((prev) => new Set(prev).add(actionId));
    try {
      // Simulate action execution
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (onRunAction) {
        onRunAction(actionId, actionType);
      }
    } finally {
      setRunningActions((prev) => {
        const next = new Set(prev);
        next.delete(actionId);
        return next;
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'high':
        return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'text-[#b90abd] border-[#b90abd]/30 bg-[#b90abd]/10';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4" />;
      case 'high':
        return <Target className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Next 10 Actions</CardTitle>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md">
            <span className="text-sm">✨</span>
            <span className="text-xs text-purple-300 font-medium">AI Ranked</span>
          </div>
        </div>
        <CardDescription className="text-gray-400">
          Ranked actions with one-click execution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rankedActions.length > 0 ? (
            rankedActions.map((action, index) => {
              const isRunning = runningActions.has(action.id);
              const primaryAction = action.cta_buttons.find((btn) => btn.variant === 'primary') || action.cta_buttons[0];

              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-700 rounded-lg p-4 hover:border-purple-500/50 transition-all duration-200 bg-gray-800/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-1.5 rounded border ${getPriorityColor(action.priority)}`}>
                          {getPriorityIcon(action.priority)}
                        </div>
                        <span className="text-xs font-medium text-gray-400">
                          #{index + 1} • {action.priority.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mb-1 truncate">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">
                        {action.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Thread: {action.subject_norm}</span>
                        {action.metadata.sla_breach_risk && (
                          <span className="text-red-400">
                            SLA Risk: {action.metadata.sla_breach_risk.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRun(action.id, primaryAction?.action || 'reply')}
                      disabled={isRunning}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-200 flex-shrink-0"
                      size="sm"
                    >
                      {isRunning ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No actions available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

