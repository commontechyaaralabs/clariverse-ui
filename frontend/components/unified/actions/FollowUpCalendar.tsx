"use client";

import { Card } from "@/components/ui/card";

interface FollowUpCalendarProps {
  followUps: { id: string; title: string; dueDate: string; severity: string }[];
  onSelect: (id: string) => void;
}

const severityColor: Record<string, string> = {
  critical: "bg-rose-500/80",
  high: "bg-amber-500/80",
  medium: "bg-blue-500/80",
  low: "bg-emerald-500/80",
};

export function FollowUpCalendar({ followUps, onSelect }: FollowUpCalendarProps) {
  const start = new Date();
  const days = Array.from({ length: 14 }, (_, idx) => addDays(start, idx));
  const map = new Map<string, { id: string; severity: string; title: string }[]>();

  followUps.forEach((item) => {
    const key = item.dueDate.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(item);
  });

  return (
    <Card className="border border-[color:var(--border)] bg-[color:var(--card)] p-6 space-y-4 transition-all duration-200 hover:border-[#b90abd]/40 hover:bg-[color:var(--background)]">
      <h3 className="text-lg font-semibold text-white">Follow-Up Calendar</h3>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-300">
        {days.map((day) => {
          const key = formatDate(day);
          const items = map.get(key) ?? [];
          const dayLabel = day.toLocaleDateString("en-US", { weekday: "short" });
          const dayNumber = day.getDate();
          return (
            <button
              key={key}
              type="button"
              onClick={() => items[0] && onSelect(items[0].id)}
              className={`rounded-lg border border-[color:var(--border)] bg-[rgba(26,26,26,0.65)] px-2 py-3 space-y-2 transition-all hover:border-[#b90abd]/40 hover:bg-[color:var(--background)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#b90abd] ${
                items.length > 0 ? "shadow-lg shadow-purple-500/10" : ""
              }`}
            >
              <div className="text-[10px] uppercase tracking-wide text-gray-500">{dayLabel}</div>
              <div className="text-sm font-semibold text-gray-200">{dayNumber}</div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`mx-auto h-1.5 w-6 rounded-full ${severityColor[item.severity] ?? "bg-purple-500/60"}`}
                />
              ))}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
