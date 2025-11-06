'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter, Calendar, X, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  urgency: string[];
  priority: string[];
  topic: string[];
  search: string;
}

interface EmailFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'closed', label: 'Closed' },
];

const urgencyOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const priorityOptions = [
  { value: 'P1', label: 'P1 - Critical' },
  { value: 'P2', label: 'P2 - High' },
  { value: 'P3', label: 'P3 - Medium' },
  { value: 'P4', label: 'P4 - Low' },
  { value: 'P5', label: 'P5 - Minimal' },
];

const topicOptions = [
  { value: 'billing', label: 'Billing' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'account', label: 'Account Issues' },
  { value: 'feature', label: 'Feature Requests' },
  { value: 'general', label: 'General Inquiry' },
];

export function EmailFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  onApplyFilters 
}: EmailFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = (value: string) => {
    const newStatus = filters.status.includes(value)
      ? filters.status.filter(s => s !== value)
      : [...filters.status, value];
    
    onFiltersChange({
      ...filters,
      status: newStatus,
    });
  };

  const handleUrgencyChange = (value: string) => {
    const newUrgency = filters.urgency.includes(value)
      ? filters.urgency.filter(u => u !== value)
      : [...filters.urgency, value];
    
    onFiltersChange({
      ...filters,
      urgency: newUrgency,
    });
  };

  const handleTopicChange = (value: string) => {
    const newTopic = filters.topic.includes(value)
      ? filters.topic.filter(t => t !== value)
      : [...filters.topic, value];
    
    onFiltersChange({
      ...filters,
      topic: newTopic,
    });
  };

  const handlePriorityChange = (value: string) => {
    const newPriority = filters.priority.includes(value)
      ? filters.priority.filter(p => p !== value)
      : [...filters.priority, value];
    
    onFiltersChange({
      ...filters,
      priority: newPriority,
    });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value,
      },
    });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value,
    });
  };

  const activeFiltersCount = 
    filters.status.length + 
    filters.urgency.length + 
    filters.priority.length +
    filters.topic.length + 
    (filters.search ? 1 : 0) +
    (filters.dateRange.start ? 1 : 0) +
    (filters.dateRange.end ? 1 : 0);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#b90abd]" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="bg-[#b90abd] text-white text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
            <Button
              size="sm"
              onClick={onApplyFilters}
              className="bg-[#b90abd] hover:bg-[#a009b3] text-white"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Apply
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search threads, subjects, participants..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Start Date
            </label>
            <Input
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => handleDateChange('start', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              End Date
            </label>
            <Input
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => handleDateChange('end', e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t border-gray-700">
            {/* Status Filters */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.status.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusChange(option.value)}
                    className={
                      filters.status.includes(option.value)
                        ? "bg-[#b90abd] text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Urgency Filters */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Urgency
              </label>
              <div className="flex flex-wrap gap-2">
                {urgencyOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.urgency.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUrgencyChange(option.value)}
                    className={
                      filters.urgency.includes(option.value)
                        ? "bg-red-600 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Priority Filters */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Priority Level
              </label>
              <div className="flex flex-wrap gap-2">
                {priorityOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.priority.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePriorityChange(option.value)}
                    className={
                      filters.priority.includes(option.value)
                        ? "bg-purple-600 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Topic Filters */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Topic / Cluster
              </label>
              <div className="flex flex-wrap gap-2">
                {topicOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={filters.topic.includes(option.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTopicChange(option.value)}
                    className={
                      filters.topic.includes(option.value)
                        ? "bg-green-600 text-white"
                        : "border-gray-600 text-gray-300 hover:bg-gray-700"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="pt-4 border-t border-gray-700">
            <div className="flex flex-wrap gap-2">
              {filters.status.map((status) => (
                <span
                  key={`status-${status}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[#b90abd]/20 text-[#b90abd] text-xs rounded-full"
                >
                  Status: {statusOptions.find(o => o.value === status)?.label}
                  <button
                    onClick={() => handleStatusChange(status)}
                    className="ml-1 hover:text-[#a009b3]"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.urgency.map((urgency) => (
                <span
                  key={`urgency-${urgency}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full"
                >
                  Urgency: {urgencyOptions.find(o => o.value === urgency)?.label}
                  <button
                    onClick={() => handleUrgencyChange(urgency)}
                    className="ml-1 hover:text-red-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.priority.map((priority) => (
                <span
                  key={`priority-${priority}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full"
                >
                  Priority: {priorityOptions.find(o => o.value === priority)?.label}
                  <button
                    onClick={() => handlePriorityChange(priority)}
                    className="ml-1 hover:text-purple-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {filters.topic.map((topic) => (
                <span
                  key={`topic-${topic}`}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full"
                >
                  Topic: {topicOptions.find(o => o.value === topic)?.label}
                  <button
                    onClick={() => handleTopicChange(topic)}
                    className="ml-1 hover:text-green-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
