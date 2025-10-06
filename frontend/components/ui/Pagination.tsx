'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="neu-button p-2 hover:shadow-neu-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        <ChevronLeft className="w-4 h-4 text-white" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center space-x-1">
        {visiblePages.map((page, index) => (
          <div key={index}>
            {page === '...' ? (
              <div className="px-3 py-2">
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </div>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === page
                    ? 'bg-primary text-foreground shadow-glow'
                    : 'neu-button text-muted-foreground hover:shadow-neu-button-hover hover:text-foreground'
                }`}
              >
                {page}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="neu-button p-2 hover:shadow-neu-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        <ChevronRight className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
