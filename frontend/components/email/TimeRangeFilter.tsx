"use client";

import { useState } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface TimeRangeFilterProps {
  onTimeRangeChange: (timeRange: string) => void;
  onClear: () => void;
}

const timeRangeOptions = [
  { value: 'hourly', label: 'Last Hour', description: 'Past 60 minutes' },
  { value: 'daily', label: 'Last 24 Hours', description: 'Past day' },
  { value: 'weekly', label: 'Last 7 Days', description: 'Past week' },
  { value: 'monthly', label: 'Last 30 Days', description: 'Past month' },
  { value: 'quarterly', label: 'Last 3 Months', description: 'Past quarter' },
  { value: 'yearly', label: 'Last Year', description: 'Past 12 months' },
  { value: 'all', label: 'All Time', description: 'Complete dataset' }
];

export default function TimeRangeFilter({ onTimeRangeChange, onClear }: TimeRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('monthly');

  const handleTimeRangeSelect = (timeRange: string) => {
    setSelectedRange(timeRange);
    onTimeRangeChange(timeRange);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedRange('monthly');
    onClear();
    setIsOpen(false);
  };

  const selectedOption = timeRangeOptions.find(option => option.value === selectedRange);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-app-black border border-iron/30 rounded-lg text-app-white hover:border-electric-violet/50 transition-all duration-300 min-w-[200px]"
      >
        <Clock className="w-4 h-4 text-electric-violet" />
        <div className="flex-1 text-left">
          <div className="text-sm font-medium">Time Range</div>
          <div className="text-xs text-manatee">{selectedOption?.label}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-manatee transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[90] bg-black/40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-80 bg-black rounded-xl shadow-2xl p-4 border border-gray-700 z-[100] animate-fade-in transition-all duration-300 ease-in-out transform origin-top-left">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Select Data or Time Range</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {timeRangeOptions.slice(0, 6).map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleTimeRangeSelect(option.value)}
                    className={`${
                      selectedRange === option.value
                        ? "bg-gradient-to-r from-electric-violet to-app-blue text-white shadow-lg shadow-electric-violet/30"
                        : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500 transition-all duration-200"
                    } rounded-lg px-3 py-2 text-sm`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <button
                  onClick={() => handleTimeRangeSelect('all')}
                  className={`w-full ${
                    selectedRange === 'all'
                      ? "bg-gradient-to-r from-electric-violet to-app-blue text-white shadow-lg shadow-electric-violet/30"
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500 transition-all duration-200"
                  } rounded-lg px-3 py-2 text-sm mb-3`}
                >
                  All Time
                </button>
                
                <button
                  onClick={handleClear}
                  className="w-full text-center px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  Reset to Monthly
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
