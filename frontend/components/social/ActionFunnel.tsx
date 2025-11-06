'use client';

interface ActionFunnelData {
  topic: string;
  urgency: number; // 0-1
  resolutionStatus: string;
  resolvedPercent: number;
}

interface ActionFunnelProps {
  data: ActionFunnelData[];
}

export function ActionFunnel({ data }: ActionFunnelProps) {
  return (
    <div className="w-full space-y-4">
      {data.map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white">{item.topic}</span>
            <span className="text-xs text-gray-400">{item.resolutionStatus}</span>
          </div>
          
          {/* Urgency Bar */}
          <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                item.urgency > 0.7 ? 'bg-red-500' : item.urgency > 0.4 ? 'bg-yellow-500' : 'bg-gray-500'
              }`}
              style={{ width: `${item.urgency * 100}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
              {Math.round(item.urgency * 100)}% Urgent
            </span>
          </div>
          
          {/* Resolution Progress */}
          <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${item.resolvedPercent}%` }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-xs text-gray-300">
              {item.resolvedPercent}% Resolved
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

