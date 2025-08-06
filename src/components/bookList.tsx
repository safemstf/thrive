// src/components/BooksList.tsx

'use client';

import React, { useState } from 'react';
import { useBooks, useApiError } from '@/hooks/useEducationalApi'; // Removed unused mutations
import { BookQueryParams } from '@/types/api.types';
import { MainCategory } from '@/types/portfolio.types'; // Updated import
import { ConnectionStatusIndicator } from './apiConnectionManager';

export function BooksList() {
  const [filters, setFilters] = useState<BookQueryParams>({
    mainCategory: 'math',
    limit: 10,
  });

  // Fetch books with filters
  const { data: books, isLoading, error, refetch } = useBooks(filters);
  
  // Error handling
  const { getErrorMessage, isNotFound } = useApiError();

  // Handle category filter change
  const handleCategoryChange = (category: MainCategory) => {
    setFilters(prev => ({ ...prev, mainCategory: category }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 font-semibold mb-2">
          {isNotFound(error) ? 'No books found' : 'Error loading books'}
        </div>
        <p className="text-gray-600 mb-4">{getErrorMessage(error)}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Connection Status */}
      <div className="mb-4 flex justify-end">
        <ConnectionStatusIndicator />
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          value={filters.mainCategory}
          onChange={(e) => handleCategoryChange(e.target.value as MainCategory)}
          className="px-4 py-2 border rounded"
        >
          <option value="math">Math</option>
          <option value="english">English</option>
          <option value="science">Science</option>
        </select>

        {/* Removed Create Book button */}
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books?.map((book) => (
          <div
            key={book.id}
            className="border rounded-lg p-6 hover:shadow-lg transition-shadow"
            style={{
              borderColor: book.colors.primary,
              backgroundColor: `${book.colors.secondary}10`,
            }}
          >
            <h3 className="text-xl font-semibold mb-2">{book.title}</h3>
            {book.subtitle && (
              <p className="text-gray-600 mb-2">{book.subtitle}</p>
            )}
            <p className="text-gray-600 mb-2">{book.year}</p>
            <p className="text-gray-700 mb-4">{book.excerpt}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {book.subCategory?.toUpperCase()}
              </span>
              {/* Removed Delete button */}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {books?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found</p>
        </div>
      )}
    </div>
  );
}