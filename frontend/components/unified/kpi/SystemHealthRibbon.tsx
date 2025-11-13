"use client";

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Area, AreaChart, ResponsiveContainer } from "@/components/ui/chart";
import {
  Mail,
  MessageCircle,
  Ticket,
  Share2,
  Mic,
  type LucideIcon,
} from "lucide-react";

export type SystemHealthMetric = {
  channel: string;
  label: string;
  icon: "Mail" | "MessageCircle" | "Ticket" | "Share2" | "Mic";
  color: string;
  total: number;
  sentiment: number;
  sentimentDelta: number;
  sentimentTrend: number[];
  urgencyPct: number;
  slaRisk: number;
  unresolved: number;
  unresolvedCompany: number;
  unresolvedCustomer: number;
  unresolvedCompanyPct: number;
  unresolvedCustomerPct: number;
  emergingTheme: string;
};

const SPARKLINE_COLORS: Record<SystemHealthMetric["channel"], { stroke: string; fill: string }> = {
  email: { stroke: "#60a5fa", fill: "rgba(96,165,250,0.25)" },
  chat: { stroke: "#34d399", fill: "rgba(52,211,153,0.22)" },
  ticket: { stroke: "#a855f7", fill: "rgba(168,85,247,0.22)" },
  social: { stroke: "#f472b6", fill: "rgba(244,114,182,0.2)" },
  voice: { stroke: "#f97316", fill: "rgba(249,115,22,0.22)" },
};

interface SystemHealthRibbonProps {
  data: SystemHealthMetric[];
  explanations?: Record<string, string>;
  onChannelSelect?: (channel: string) => void;
}

const iconMap: Record<SystemHealthMetric["icon"], LucideIcon> = {
  Mail,
  MessageCircle,
  Ticket,
  Share2,
  Mic,
};

export function SystemHealthRibbon({ data, explanations = {}, onChannelSelect }: SystemHealthRibbonProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {data.map((metric) => {
          const Icon = iconMap[metric.icon];
          const sentimentValue = metric.sentiment.toFixed(1);
          const sentimentDeltaColor = metric.sentimentDelta >= 0 ? "text-green-400" : "text-red-400";

          return (
            <Tooltip key={metric.channel}>
              <TooltipTrigger asChild>
                <Card
                  role="button"
                  onClick={() => onChannelSelect?.(metric.channel)}
                  className="border-[color:var(--border)] bg-[color:var(--card)] p-6 transition-all duration-200 hover:bg-[color:var(--background)] hover:border-[#b90abd]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b90abd]"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${metric.color}`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{metric.total}</div>
                      <div className="text-xs text-gray-400">Total</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Sentiment</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-200">
                          {sentimentValue}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(26,26,26,0.65)] ${sentimentDeltaColor}`}>
                          {metric.sentimentDelta >= 0 ? "↑" : "↓"}
                          {Math.abs(metric.sentimentDelta).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="h-12 w-full">
                      {metric.sentimentTrend.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={metric.sentimentTrend.map((value, idx) => ({ idx, value }))}
                            margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id={`spark-${metric.channel}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={SPARKLINE_COLORS[metric.channel].stroke} stopOpacity={0.6} />
                                <stop offset="95%" stopColor={SPARKLINE_COLORS[metric.channel].fill} stopOpacity={0.05} />
                              </linearGradient>
                            </defs>
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke={SPARKLINE_COLORS[metric.channel].stroke}
                              strokeWidth={2}
                              fill={`url(#spark-${metric.channel})`}
                              isAnimationActive={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full w-full rounded bg-[rgba(26,26,26,0.45)]" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Urgency</span>
                      <span className="text-sm font-semibold text-orange-400">{metric.urgencyPct}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">SLA Risk</span>
                      <span className="text-sm font-semibold text-red-400">{metric.slaRisk}%</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">Unresolved</span>
                      <span className="text-sm font-semibold text-gray-300">{metric.unresolved}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                      <span className="flex items-center gap-1">
                        Company
                        <span className="font-medium text-gray-200">
                          {metric.unresolvedCompany}
                          <span className="ml-1 text-[10px] text-gray-400">({metric.unresolvedCompanyPct}%)</span>
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        Customer
                        <span className="font-medium text-gray-200">
                          {metric.unresolvedCustomer}
                          <span className="ml-1 text-[10px] text-gray-400">({metric.unresolvedCustomerPct}%)</span>
                        </span>
                      </span>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-[color:var(--background)] text-sm text-gray-100">
                <div className="space-y-1">
                  <p className="font-medium text-white">Why this matters</p>
                  <p className="text-gray-300 text-xs">
                    {explanations[metric.channel] ?? "AI insight placeholder pending LLM integration."}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
