'use client';

interface ActionWheelData {
  issue: string;
  nextAction: string;
  priority: number;
  status: 'pending' | 'in_progress' | 'resolved';
}

interface ActionWheelProps {
  data: ActionWheelData[];
}

export function ActionWheel({ data }: ActionWheelProps) {
  const statusColors = {
    pending: 'bg-gray-500',
    in_progress: 'bg-yellow-500',
    resolved: 'bg-green-500',
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    resolved: 'Resolved',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.map((item, idx) => (
        <div
          key={idx}
          className="p-4 rounded-lg border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-purple-800/10 hover:border-purple-500/50 transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-white text-sm mb-1">{item.issue}</h4>
              <p className="text-xs text-gray-300 mb-2">{item.nextAction}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[item.status]}`}>
                {statusLabels[item.status]}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/30 text-purple-300">
                P{item.priority}
              </span>
            </div>
          </div>
          
          {/* Action Progress Indicator */}
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${statusColors[item.status]}`}
              style={{
                width: item.status === 'resolved' ? '100%' : item.status === 'in_progress' ? '50%' : '0%',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

