'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPIData, EisenhowerThread } from '@/lib/api';
import { Sparkles, CheckCircle, UserPlus, Calendar, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DailyDigestCardProps {
  kpiData: KPIData | null;
  threads: EisenhowerThread[];
}

interface DayPlan {
  doNow: Array<{ id: string; title: string; priority: string }>;
  delegate: Array<{ id: string; title: string; assignTo: string }>;
  schedule: Array<{ id: string; title: string; scheduledTime: string }>;
}

export function DailyDigestCard({ kpiData, threads }: DailyDigestCardProps) {
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const generateDayPlan = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate plan from threads
      const p1Threads = threads
        .filter((t) => t.priority === 'P1' && t.resolution_status !== 'closed')
        .slice(0, 5)
        .map((t) => ({
          id: t.thread_id,
          title: t.subject_norm,
          priority: t.priority,
        }));

      const delegateThreads = threads
        .filter((t) => t.quadrant === 'delegate' && t.resolution_status !== 'closed')
        .slice(0, 3)
        .map((t) => ({
          id: t.thread_id,
          title: t.subject_norm,
          assignTo: t.owner || 'Team Member',
        }));

      const scheduleThreads = threads
        .filter((t) => t.quadrant === 'schedule' && t.resolution_status !== 'closed')
        .slice(0, 3)
        .map((t) => ({
          id: t.thread_id,
          title: t.subject_norm,
          scheduledTime: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        }));

      setDayPlan({
        doNow: p1Threads,
        delegate: delegateThreads,
        schedule: scheduleThreads,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = (itemId: string) => {
    setCompletedItems((prev) => new Set(prev).add(itemId));
  };

  const totalItems = dayPlan
    ? dayPlan.doNow.length + dayPlan.delegate.length + dayPlan.schedule.length
    : 0;
  const completedCount = completedItems.size;
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Daily Digest</CardTitle>
          </div>
          <Button
            onClick={generateDayPlan}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate My Day Plan
              </>
            )}
          </Button>
        </div>
        <CardDescription className="text-gray-400">
          AI-generated tasks grouped by priority: Do Now, Delegate, Schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dayPlan ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            {totalItems > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-medium">
                    {completedCount}/{totalItems} completed
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 h-2 rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Do Now */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-semibold text-white">Do Now</h3>
              </div>
              <AnimatePresence>
                <div className="space-y-2">
                  {dayPlan.doNow.map((item) => {
                    const isCompleted = completedItems.has(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isCompleted ? 0.5 : 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          isCompleted
                            ? 'bg-gray-800/50 border-gray-700'
                            : 'bg-red-500/10 border-red-500/30'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isCompleted}
                          onChange={() => handleComplete(item.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600"
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-400">{item.priority}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </div>

            {/* Delegate */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <UserPlus className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-semibold text-white">Delegate</h3>
              </div>
              <div className="space-y-2">
                {dayPlan.delegate.map((item) => {
                  const isCompleted = completedItems.has(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isCompleted ? 0.5 : 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isCompleted
                          ? 'bg-gray-800/50 border-gray-700'
                          : 'bg-blue-500/10 border-blue-500/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleComplete(item.id)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600"
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">Assign to: {item.assignTo}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-yellow-400" />
                <h3 className="text-sm font-semibold text-white">Schedule</h3>
              </div>
              <div className="space-y-2">
                {dayPlan.schedule.map((item) => {
                  const isCompleted = completedItems.has(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isCompleted ? 0.5 : 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        isCompleted
                          ? 'bg-gray-800/50 border-gray-700'
                          : 'bg-yellow-500/10 border-yellow-500/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isCompleted}
                        onChange={() => handleComplete(item.id)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-purple-600"
                      />
                      <div className="flex-1">
                        <p className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-400">Scheduled: {item.scheduledTime}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-sm">
              Click "Generate My Day Plan" to create your personalized task list
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

