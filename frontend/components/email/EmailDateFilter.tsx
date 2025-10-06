"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailDateFilterProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onClear: () => void;
}

const PRESET_RANGES = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 days", value: "last7days" },
  { label: "Last 30 days", value: "last30days" },
  { label: "Last 6 months", value: "last6months" },
  { label: "Last year", value: "lastyear" },
  { label: "All time", value: "alltime" },
];

export default function EmailDateFilter({ onDateRangeChange, onClear }: EmailDateFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
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

  const getDateRange = (preset: string) => {
    const today = new Date();
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    switch (preset) {
      case "today":
        return { start: formatDate(today), end: formatDate(today) };
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return { start: formatDate(yesterday), end: formatDate(yesterday) };
      case "last7days":
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        return { start: formatDate(last7Days), end: formatDate(today) };
      case "last30days":
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        return { start: formatDate(last30Days), end: formatDate(today) };
      case "last6months":
        const last6Months = new Date(today);
        last6Months.setMonth(last6Months.getMonth() - 6);
        return { start: formatDate(last6Months), end: formatDate(today) };
      case "lastyear":
        const lastYear = new Date(today);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        return { start: formatDate(lastYear), end: formatDate(today) };
      case "alltime":
        return { start: "01-01-2020", end: formatDate(today) };
      default:
        return { start: "", end: "" };
    }
  };

  const handlePresetClick = (preset: string) => {
    const range = getDateRange(preset);
    onDateRangeChange(range.start, range.end);
    setSelectedPreset(preset);
    setIsCustomOpen(false);
    setIsDropdownOpen(false);
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      onDateRangeChange(customStartDate, customEndDate);
      setSelectedPreset(null);
      setIsDropdownOpen(false);
    }
  };

  const handleClear = () => {
    setCustomStartDate("");
    setCustomEndDate("");
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
          ? PRESET_RANGES.find(p => p.value === selectedPreset)?.label
          : customStartDate && customEndDate
          ? `${customStartDate} - ${customEndDate}`
          : "Date Range"
        }
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ease-in-out ${isDropdownOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 md:w-80 bg-black/80 rounded-xl shadow-2xl p-4 border border-white/10 z-[100] animate-fade-in transition-all duration-300 ease-in-out transform origin-top-right">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Select Date Range</h3>
              {(selectedPreset || customStartDate || customEndDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-white hover:bg-gray-800 p-1 rounded-lg transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Preset Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {PRESET_RANGES.map((preset) => (
                <Button
                  key={preset.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePresetClick(preset.value)}
                  className={`${
                    selectedPreset === preset.value
                      ? "bg-gradient-to-r from-primary to-accent text-foreground shadow-lg shadow-primary/30"
                      : "bg-white/5 hover:bg-white/10 text-foreground border border-white/10 hover:border-white/20 transition-all duration-200 backdrop-blur-sm"
                  } rounded-lg px-3 py-2 text-sm`}
                >
                  {preset.label}
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
                Custom Range
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isCustomOpen ? 'rotate-180' : ''}`} />
              </Button>
            </div>

            {/* Custom Date Inputs */}
            {isCustomOpen && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
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
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white cursor-pointer hover:text-gray-300 transition-colors duration-200" 
                        style={{ filter: 'none', textShadow: 'none', boxShadow: 'none' }}
                        onClick={() => {
                          const input = document.getElementById('start-date-input') as HTMLInputElement;
                          if (input) input.showPicker();
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
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
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white cursor-pointer hover:text-gray-300 transition-colors duration-200" 
                        style={{ filter: 'none', textShadow: 'none', boxShadow: 'none' }}
                        onClick={() => {
                          const input = document.getElementById('end-date-input') as HTMLInputElement;
                          if (input) input.showPicker();
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCustomApply}
                    disabled={!customStartDate || !customEndDate}
                    className="flex-1 bg-gradient-to-r from-electric-violet to-app-blue text-white hover:shadow-lg hover:shadow-electric-violet/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-lg"
                  >
                    Apply
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsCustomOpen(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:border-gray-500 transition-all duration-200 rounded-lg"
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
