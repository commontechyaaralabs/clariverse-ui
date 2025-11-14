'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts';
import { TopicBubbleData } from '@/lib/api';
import { useState } from 'react';

interface TopicBubbleMapProps {
  data: TopicBubbleData[];
  onTopicClick?: (topic: string) => void;
}

export function TopicBubbleMap({ data, onTopicClick }: TopicBubbleMapProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // Transform data for scatter chart
  const scatterData = data.map((item, index) => ({
    x: item.resolutionDifficulty,
    y: item.businessImpact,
    z: item.volume,
    name: item.topic,
    sentiment: item.sentiment,
    volume: item.volume,
    fullData: item,
  }));

  // Get color based on sentiment (-1 to 1 -> red to green)
  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.5) return '#10b981'; // Green - positive
    if (sentiment >= 0) return '#84cc16'; // Light green - slightly positive
    if (sentiment >= -0.5) return '#f59e0b'; // Orange - slightly negative
    return '#ef4444'; // Red - negative
  };

  const handleClick = (data: any) => {
    if (data && data.payload) {
      const topic = data.payload.name;
      setSelectedTopic(topic);
      if (onTopicClick) {
        onTopicClick(topic);
      }
    }
  };

  // Find max values for scaling
  const maxVolume = Math.max(...data.map(d => d.volume));
  const minVolume = Math.min(...data.map(d => d.volume));

  return (
    <div className="w-full">
      {/* Quadrant Labels */}
      <div className="relative h-96 mb-4">
        <div className="absolute top-4 left-4 text-xs font-semibold text-gray-400 z-10">
          High Impact
        </div>
        <div className="absolute top-4 right-4 text-xs font-semibold text-gray-400 z-10">
          Easy to Solve
        </div>
        <div className="absolute bottom-4 left-4 text-xs font-semibold text-gray-400 z-10">
          Low Impact
        </div>
        <div className="absolute bottom-4 right-4 text-xs font-semibold text-gray-400 z-10">
          Hard to Solve
        </div>
        
        {/* Crisis Zone Highlight */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 border-2 border-red-500/30 border-dashed rounded-lg pointer-events-none">
          <div className="absolute top-2 right-2 text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded">
            CRISIS ZONE
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
            data={scatterData}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Resolution Difficulty"
              domain={[0, 100]}
              label={{ value: 'Resolution Difficulty (Easy → Hard)', position: 'insideBottom', offset: -5, style: { fill: '#939394' } }}
              stroke="#939394"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Business Impact"
              domain={[0, 100]}
              label={{ value: 'Business Impact (Low → High)', angle: -90, position: 'insideLeft', style: { fill: '#939394' } }}
              stroke="#939394"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <ZAxis 
              type="number" 
              dataKey="z" 
              range={[50, 400]} 
              name="Volume"
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  const topicData = data.fullData as TopicBubbleData;
                  return (
                    <div className="bg-gray-900 border border-purple-500/50 rounded-lg p-3 shadow-lg">
                      <div className="font-semibold text-white mb-2">{topicData.topic}</div>
                      <div className="text-xs space-y-1">
                        <div className="text-gray-300">
                          Volume: <span className="text-white font-medium">{topicData.volume}</span>
                        </div>
                        <div className="text-gray-300">
                          Business Impact: <span className="text-white font-medium">{topicData.businessImpact}/100</span>
                        </div>
                        <div className="text-gray-300">
                          Resolution Difficulty: <span className="text-white font-medium">{topicData.resolutionDifficulty}/100</span>
                        </div>
                        <div className="text-gray-300">
                          Sentiment: <span className={`font-medium ${topicData.sentiment >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {(topicData.sentiment * 100).toFixed(0)}%
                          </span>
                        </div>
                        {topicData.sampleQuotes && topicData.sampleQuotes.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-700">
                            <div className="text-gray-400 text-xs mb-1">Sample Quotes:</div>
                            {topicData.sampleQuotes.slice(0, 2).map((quote, idx) => (
                              <div key={idx} className="text-gray-500 text-xs italic">"{quote}"</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter 
              name="Topics" 
              data={scatterData} 
              fill="#8884d8"
              onClick={handleClick}
            >
              {scatterData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getSentimentColor(entry.sentiment)}
                  opacity={selectedTopic === entry.name ? 1 : 0.7}
                  stroke={selectedTopic === entry.name ? '#a855f7' : 'transparent'}
                  strokeWidth={selectedTopic === entry.name ? 3 : 0}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-400">Negative Sentiment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-400">Positive Sentiment</span>
          </div>
          <div className="text-gray-500">
            Bubble size = Volume
          </div>
        </div>
        <div className="text-xs text-gray-500">
          Click bubbles to see details
        </div>
      </div>

      {/* Topic Cards */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        {data.map((topic) => (
          <div
            key={topic.topic}
            className={`p-2 rounded border transition-colors cursor-pointer ${
              selectedTopic === topic.topic
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-700 hover:border-purple-500'
            }`}
            onClick={() => {
              setSelectedTopic(topic.topic);
              if (onTopicClick) {
                onTopicClick(topic.topic);
              }
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSentimentColor(topic.sentiment) }}
              ></div>
              <div className="text-sm font-medium text-white">{topic.topic}</div>
            </div>
            <div className="text-xs text-gray-400">
              Vol: {topic.volume} | Sent: {(topic.sentiment * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Impact: {topic.businessImpact} | Diff: {topic.resolutionDifficulty}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
















