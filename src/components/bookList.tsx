// src/components/BooksList.tsx

'use client';

import React, { useState } from 'react';
import { useBooks, useCreateBook, useDeleteBook, useApiError } from '@/hooks/useEducationalApi';
import { BookQueryParams } from '@/types/api.types';
import { MainCategory, SubCategory } from '@/types/educational.types';
import { ConnectionStatusIndicator } from './apiConnectionManager';

export function BooksList() {
  const [filters, setFilters] = useState<BookQueryParams>({
    mainCategory: 'math',
    limit: 10,
  });

  // Fetch books with filters
  const { data: books, isLoading, error, refetch } = useBooks(filters);
  
  // Mutations
  const createBookMutation = useCreateBook();
  const deleteBookMutation = useDeleteBook();
  
  // Error handling
  const { getErrorMessage, isNotFound } = useApiError();

  // Handle category filter change
  const handleCategoryChange = (category: MainCategory) => {
    setFilters(prev => ({ ...prev, mainCategory: category }));
  };

  // Handle book creation
  const handleCreateBook = async () => {
    try {
      await createBookMutation.mutateAsync({
        title: 'New Math Book',
        year: '2025',
        mainCategory: 'math',
        subCategory: 'sat',
        colors: {
          primary: '#3B82F6',
          secondary: '#1E40AF',
        },
        excerpt: 'A comprehensive guide to SAT Math',
        description: 'Master SAT Math with practice problems and strategies',
        learningContent: {
          mathConcepts: [],
        },
      });
    } catch (error) {
      console.error('Failed to create book:', getErrorMessage(error));
    }
  };

  // Handle book deletion
  const handleDeleteBook = async (bookId: string) => {
    if (confirm('Are you sure you want to delete this book?')) {
      try {
        await deleteBookMutation.mutateAsync(bookId);
      } catch (error) {
        console.error('Failed to delete book:', getErrorMessage(error));
      }
    }
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

        <button
          onClick={handleCreateBook}
          disabled={createBookMutation.isPending}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {createBookMutation.isPending ? 'Creating...' : 'Create Book'}
        </button>
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
                {book.subCategory.toUpperCase()}
              </span>
              <button
                onClick={() => handleDeleteBook(book.id)}
                disabled={deleteBookMutation.isPending}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
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