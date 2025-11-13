"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export type DateRange = {
  start: string;
  end: string;
};

interface UnifiedFiltersBarProps {
  dateFilterPreset: string;
  dateRange: DateRange;
  onPresetChange: (value: string) => void;
  onDateRangeChange: (range: DateRange) => void;
  onApply: () => void;
  onOpenAI: () => void;
}

export function UnifiedFiltersBar({
  dateFilterPreset,
  dateRange,
  onPresetChange,
  onDateRangeChange,
  onApply,
  onOpenAI,
}: UnifiedFiltersBarProps) {
  const activeFilters = useMemo(() => {
    const items: string[] = [];

    if (dateFilterPreset === "Custom" && dateRange.start && dateRange.end) {
      items.push(`Dates: ${dateRange.start} → ${dateRange.end}`);
    } else {
      items.push(`Preset: ${dateFilterPreset}`);
    }

    return items;
  }, [dateFilterPreset, dateRange]);

  return (
    <div className="space-y-4 animate-slide-down">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Unified Dashboard</h1>
          <p className="text-muted-foreground text-lg">
            ✨AI-powered insights across Email, Chat, Ticket, Social & Voice
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <Button
              onClick={onOpenAI}
              className="bg-gradient-to-r from-[#b90abd] to-[#5332ff] hover:from-[#a009b3] hover:to-[#4a2ae6] text-white transition-all duration-200 group h-[38px] px-6"
            >
              <span className="text-lg mr-2 group-hover:rotate-180 transition-transform duration-500 inline-block">✨</span>
              Generate your day in 2 minutes
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 justify-end">
            <span className="text-xs text-gray-400 whitespace-nowrap">Date:</span>
            <Select value={dateFilterPreset} onValueChange={onPresetChange}>
              <SelectTrigger className="w-[160px] border border-[color:var(--border)] bg-[color:var(--card)] text-white text-sm h-[38px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="border border-[color:var(--border)] bg-[color:var(--card)] text-white z-[9999] w-[160px]">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Current day">Current day</SelectItem>
                <SelectItem value="One Week">One Week</SelectItem>
                <SelectItem value="One Month">One Month</SelectItem>
                <SelectItem value="6 Months">6 Months</SelectItem>
                <SelectItem value="Custom">Custom</SelectItem>
              </SelectContent>
            </Select>

            {dateFilterPreset === "Custom" && (
              <>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(event) =>
                    onDateRangeChange({ ...dateRange, start: event.target.value })
                  }
                  className="border border-[color:var(--border)] bg-[color:var(--card)] text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b90abd] h-[38px]"
                />
                <span className="text-xs text-gray-500">→</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(event) =>
                    onDateRangeChange({ ...dateRange, end: event.target.value })
                  }
                  className="border border-[color:var(--border)] bg-[color:var(--card)] text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b90abd] h-[38px]"
                />
              </>
            )}

            <Button
              size="sm"
              type="button"
              onClick={onApply}
              className="bg-gradient-to-r from-[#b90abd] to-[#5332ff] hover:from-[#a009b3] hover:to-[#4a2ae6] text-white transition-all duration-200 h-[38px]"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="uppercase tracking-wide text-gray-500">Active Filters</span>
        {activeFilters.length === 0 && (
          <Badge variant="outline" className="border-[color:var(--border)] text-gray-400">
            None
          </Badge>
        )}
        {activeFilters.map((filter) => (
          <Badge key={filter} variant="secondary" className="border border-[color:var(--border)] bg-[color:var(--card)] text-gray-200">
            {filter}
          </Badge>
        ))}
      </div>
    </div>
  );
}
