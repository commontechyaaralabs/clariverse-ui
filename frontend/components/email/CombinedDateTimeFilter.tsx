"use client";

import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CombinedDateTimeFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onTimeRangeChange: (timeRange: string) => void;
  onClear: () => void;
}

const timeRangeOptions = [
  { value: '1hour', label: '1 Hour', description: 'Past 60 minutes' },
  { value: '12hours', label: '12 Hours', description: 'Past 12 hours' },
  { value: '24hours', label: '24 Hours', description: 'Past day' },
  { value: '48hours', label: '48 Hours', description: 'Past 2 days' },
  { value: '1week', label: '1 Week', description: 'Past 7 days' },
  { value: '1month', label: '1 Month', description: 'Past 30 days' },
  { value: '3months', label: '3 Months', description: 'Past 90 days' },
  { value: '6months', label: '6 Months', description: 'Past 180 days' },
  { value: '1year', label: '1 Year', description: 'Past 365 days' },
  { value: 'all', label: 'All Time', description: 'Complete dataset' }
];

export default function CombinedDateTimeFilter({ 
  onDateRangeChange, 
  onTimeRangeChange, 
  onClear 
}: CombinedDateTimeFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setIsCustomOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsCustomOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handlePresetClick = (preset: string) => {
    setSelectedPreset(preset);
    setIsCustomOpen(false);
    setIsDropdownOpen(false);
    onTimeRangeChange(preset);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      const startDateTime = customStartTime ? `${customStartDate} ${customStartTime}` : customStartDate;
      const endDateTime = customEndTime ? `${customEndDate} ${customEndTime}` : customEndDate;
      onDateRangeChange(startDateTime, endDateTime);
      setSelectedPreset(null);
      setIsDropdownOpen(false);
    }
  };

  const handleClear = () => {
    setCustomStartDate("");
    setCustomEndDate("");
    setCustomStartTime("");
    setCustomEndTime("");
    setSelectedPreset(null);
    setIsCustomOpen(false);
    setIsDropdownOpen(false);
    onClear();
  };

  const convertToInputFormat = (dateStr: string) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  };

  const convertFromInputFormat = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Backdrop overlay when dropdown is open */}
      {isDropdownOpen && (
        <div className="fixed inset-0 z-[90] bg-black/10" onClick={() => setIsDropdownOpen(false)} />
      )}
      
      {/* Dropdown Button */}
      <Button
        variant="outline"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="neu-button hover:shadow-neu-button-hover text-muted-foreground hover:text-foreground px-4 py-2 focus:outline-none transition-all duration-300 ease-in-out"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <Calendar className="w-4 h-4 mr-2" />
        {selectedPreset 
          ? timeRangeOptions.find(p => p.value === selectedPreset)?.label
          : customStartDate && customEndDate
          ? `${customStartDate} - ${customEndDate}`
          : "Select Date or Time Range"
        }
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
         <div className="absolute top-full right-0 mt-2 w-64 md:w-80 bg-black/80 rounded-xl shadow-2xl p-4 border border-white/10 z-[100] animate-fade-in transition-all duration-300 ease-in-out transform origin-top-right">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Select Data or Time Range</h3>
              {(selectedPreset || customStartDate || customEndDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground hover:bg-white/10 p-1 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Time Range Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetClick(option.value)}
                  className={`${
                    selectedPreset === option.value
                      ? "bg-gradient-to-r from-primary to-accent text-foreground shadow-lg shadow-primary/30"
                      : "bg-white/5 hover:bg-white/10 text-foreground border border-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-sm"
                  } rounded-lg px-3 py-2 text-sm`}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Custom Date Range Toggle */}
            <div className="border-t border-white/10 pt-4">
              <Button
                variant="ghost"
                onClick={() => setIsCustomOpen(!isCustomOpen)}
                className="w-full bg-white/5 hover:bg-white/10 text-foreground border border-white/10 hover:border-white/20 transition-all duration-200 rounded-lg px-3 py-2 backdrop-blur-sm"
              >
                Custom Date and Time Range
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isCustomOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Custom Date and Time Inputs */}
            {isCustomOpen && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Start Date
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        id="start-date-input"
                        value={convertToInputFormat(customStartDate)}
                        onChange={(e) => setCustomStartDate(convertFromInputFormat(e.target.value))}
                        className="bg-white/5 border border-white/10 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm pr-8 [&::-webkit-calendar-picker-indicator]:hidden backdrop-blur-sm"
                        style={{ 
                          colorScheme: 'dark',
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                      />
                      <Calendar 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground cursor-pointer hover:text-muted-foreground transition-colors duration-200" 
                        style={{ filter: 'none', textShadow: 'none', boxShadow: 'none' }}
                        onClick={() => {
                          const input = document.getElementById('start-date-input') as HTMLInputElement;
                          if (input) input.showPicker();
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      End Date
                    </label>
                    <div className="relative">
                      <Input
                        type="date"
                        id="end-date-input"
                        value={convertToInputFormat(customEndDate)}
                        onChange={(e) => setCustomEndDate(convertFromInputFormat(e.target.value))}
                        className="bg-white/5 border border-white/10 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm pr-8 [&::-webkit-calendar-picker-indicator]:hidden backdrop-blur-sm"
                        style={{ 
                          colorScheme: 'dark',
                          WebkitAppearance: 'none',
                          MozAppearance: 'textfield'
                        }}
                      />
                      <Calendar 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-foreground cursor-pointer hover:text-muted-foreground transition-colors duration-200" 
                        style={{ filter: 'none', textShadow: 'none', boxShadow: 'none' }}
                        onClick={() => {
                          const input = document.getElementById('end-date-input') as HTMLInputElement;
                          if (input) input.showPicker();
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Start Time
                    </label>
                    <Input
                      type="time"
                      value={customStartTime}
                      onChange={(e) => setCustomStartTime(e.target.value)}
                      className="bg-white/5 border border-white/10 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm backdrop-blur-sm"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      End Time
                    </label>
                    <Input
                      type="time"
                      value={customEndTime}
                      onChange={(e) => setCustomEndTime(e.target.value)}
                      className="bg-white/5 border border-white/10 text-foreground placeholder-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-lg text-sm backdrop-blur-sm"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCustomDateApply}
                    disabled={!customStartDate || !customEndDate}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-foreground hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg backdrop-blur-sm"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCustomOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-foreground border border-white/10 hover:border-white/20 transition-all duration-200 rounded-lg backdrop-blur-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
