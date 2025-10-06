'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  checked?: boolean;
  subOptions?: DropdownOption[];
}

interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  multiple?: boolean;
  onSelectionChange?: (selectedValues: string[]) => void;
  className?: string;
}

export default function Dropdown({
  options,
  placeholder = "Select an option",
  multiple = false,
  onSelectionChange,
  className = ""
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSubIndex, setHoveredSubIndex] = useState<number | null>(null);
  const [showSubMenu, setShowSubMenu] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSubMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option: DropdownOption, parentIndex?: number) => {
    if (option.subOptions) {
      setShowSubMenu(showSubMenu === parentIndex ? null : (parentIndex ?? null));
      return;
    }

    if (multiple) {
      const newSelectedValues = selectedValues.includes(option.value)
        ? selectedValues.filter(val => val !== option.value)
        : [...selectedValues, option.value];
      
      setSelectedValues(newSelectedValues);
      onSelectionChange?.(newSelectedValues);
    } else {
      setSelectedValues([option.value]);
      onSelectionChange?.([option.value]);
      setIsOpen(false);
    }
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (multiple) {
      return selectedValues.length === 1 
        ? options.find(opt => opt.value === selectedValues[0])?.label || placeholder
        : `${selectedValues.length} selected`;
    }
    return options.find(opt => opt.value === selectedValues[0])?.label || placeholder;
  };

  const isOptionSelected = (value: string) => {
    return selectedValues.includes(value);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full neu-button px-4 py-3 text-left flex items-center justify-between hover:shadow-neu-button-hover transition-all duration-300"
      >
        <span className="text-white font-medium">{getDisplayText()}</span>
        <ChevronDown 
          className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 neu-raised rounded-xl shadow-neu animate-scale-in z-50">
          <div className="p-2">
            {options.map((option, index) => (
              <div key={option.value} className="relative">
                <button
                  onClick={() => handleOptionClick(option, index)}
                  onMouseEnter={() => {
                    setHoveredIndex(index);
                    if (option.subOptions) {
                      setShowSubMenu(index);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    if (!option.subOptions) {
                      setShowSubMenu(null);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center justify-between ${
                    hoveredIndex === index
                      ? 'bg-white/10 text-white'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {multiple && (
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isOptionSelected(option.value)
                          ? 'bg-primary border-primary'
                          : 'border-app-gray-400'
                      }`}>
                        {isOptionSelected(option.value) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    )}
                    <span>{option.label}</span>
                  </span>
                  {option.subOptions && (
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  )}
                </button>

                {/* Sub-menu */}
                {option.subOptions && showSubMenu === index && (
                  <div className="absolute left-full top-0 ml-2 neu-raised rounded-xl shadow-neu animate-scale-in z-50 min-w-[200px]">
                    <div className="p-2">
                      {option.subOptions.map((subOption, subIndex) => (
                        <button
                          key={subOption.value}
                          onClick={() => handleOptionClick(subOption)}
                          onMouseEnter={() => setHoveredSubIndex(subIndex)}
                          onMouseLeave={() => setHoveredSubIndex(null)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                            hoveredSubIndex === subIndex
                              ? 'bg-white/10 text-white'
                              : isOptionSelected(subOption.value)
                              ? 'bg-primary/20 text-foreground'
                              : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            isOptionSelected(subOption.value)
                              ? 'bg-primary border-primary'
                              : 'border-app-gray-400'
                          }`}>
                            {isOptionSelected(subOption.value) && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <span>{subOption.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
