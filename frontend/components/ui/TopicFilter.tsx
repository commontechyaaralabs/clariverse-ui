'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';

export interface TopicOption {
  value: string;
  label: string;
}

interface TopicFilterProps {
  dominantTopics: TopicOption[];
  subtopics: TopicOption[];
  selectedDominantTopics: string[];
  selectedSubtopics: string[];
  onDominantTopicsChange: (topics: string[]) => void;
  onSubtopicsChange: (topics: string[]) => void;
  onClearFilters: () => void;
  className?: string;
}

export default function TopicFilter({
  dominantTopics,
  subtopics,
  selectedDominantTopics,
  selectedSubtopics,
  onDominantTopicsChange,
  onSubtopicsChange,
  onClearFilters,
  className = ''
}: TopicFilterProps) {
  const [isDominantOpen, setIsDominantOpen] = useState(false);
  const [isSubtopicsOpen, setIsSubtopicsOpen] = useState(false);

  // Close subtopics dropdown when dominant topics change
  useEffect(() => {
    if (selectedDominantTopics.length === 0) {
      onSubtopicsChange([]);
    }
  }, [selectedDominantTopics, onSubtopicsChange]);

  const handleDominantTopicToggle = (topicValue: string) => {
    const newSelection = selectedDominantTopics.includes(topicValue)
      ? selectedDominantTopics.filter(t => t !== topicValue)
      : [...selectedDominantTopics, topicValue];
    onDominantTopicsChange(newSelection);
  };

  const handleSubtopicToggle = (topicValue: string) => {
    const newSelection = selectedSubtopics.includes(topicValue)
      ? selectedSubtopics.filter(t => t !== topicValue)
      : [...selectedSubtopics, topicValue];
    onSubtopicsChange(newSelection);
  };

  const getDisplayText = (selected: string[], options: TopicOption[], placeholder: string) => {
    if (selected.length === 0) return placeholder;
    if (selected.length === 1) {
      const option = options.find(opt => opt.value === selected[0]);
      return option?.label || selected[0];
    }
    return `${selected.length} topics selected`;
  };

  return (
    <div className={`bg-app-gray-800 border border-app-gray-700 rounded-2xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center space-x-6">
        {/* Dominant Topics Filter */}
        <div className="flex-1">
          <label className="block text-white text-sm font-semibold mb-3">
            Dominant Topics
          </label>
          <div className="relative">
            <button
              onClick={() => setIsDominantOpen(!isDominantOpen)}
              className={`w-full px-4 py-3 bg-app-gray-900 border-2 rounded-xl text-left text-white placeholder-app-gray-400 focus:outline-none transition-all duration-200 ${
                isDominantOpen 
                  ? 'border-electric-violet' 
                  : 'border-app-gray-600 hover:border-app-gray-500'
              }`}
            >
              <span className={selectedDominantTopics.length === 0 ? 'text-app-gray-400' : 'text-white'}>
                {getDisplayText(selectedDominantTopics, dominantTopics, 'Select topics...')}
              </span>
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white transition-transform duration-200 ${
                isDominantOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {isDominantOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-app-gray-900 border border-app-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                {dominantTopics.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => handleDominantTopicToggle(topic.value)}
                    className={`w-full px-4 py-3 text-left hover:bg-app-gray-700 transition-colors flex items-center justify-between ${
                      selectedDominantTopics.includes(topic.value) 
                        ? 'bg-electric-violet/20 text-electric-violet' 
                        : 'text-white'
                    }`}
                  >
                    <span>{topic.label}</span>
                    {selectedDominantTopics.includes(topic.value) && (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Subtopics Filter */}
        <div className="flex-1">
          <label className="block text-white text-sm font-semibold mb-3">
            Subtopics
          </label>
          <div className="relative">
            <button
              onClick={() => selectedDominantTopics.length > 0 && setIsSubtopicsOpen(!isSubtopicsOpen)}
              disabled={selectedDominantTopics.length === 0}
              className={`w-full px-4 py-3 bg-app-gray-900 border-2 rounded-xl text-left text-white placeholder-app-gray-400 focus:outline-none transition-all duration-200 ${
                selectedDominantTopics.length === 0
                  ? 'border-app-gray-600 opacity-50 cursor-not-allowed'
                  : isSubtopicsOpen 
                    ? 'border-electric-violet' 
                    : 'border-app-gray-600 hover:border-app-gray-500'
              }`}
            >
              <span className={selectedSubtopics.length === 0 ? 'text-app-gray-400' : 'text-white'}>
                {selectedDominantTopics.length === 0 
                  ? 'Select dominant topics first...'
                  : getDisplayText(selectedSubtopics, subtopics, 'Select subtopics...')
                }
              </span>
              <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white transition-transform duration-200 ${
                isSubtopicsOpen ? 'rotate-180' : ''
              }`} />
            </button>
            
            {isSubtopicsOpen && selectedDominantTopics.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-app-gray-900 border border-app-gray-600 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                {subtopics.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => handleSubtopicToggle(topic.value)}
                    className={`w-full px-4 py-3 text-left hover:bg-app-gray-700 transition-colors flex items-center justify-between ${
                      selectedSubtopics.includes(topic.value) 
                        ? 'bg-electric-violet/20 text-electric-violet' 
                        : 'text-white'
                    }`}
                  >
                    <span>{topic.label}</span>
                    {selectedSubtopics.includes(topic.value) && (
                      <X className="w-4 h-4" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="flex-shrink-0">
          <button
            onClick={onClearFilters}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
