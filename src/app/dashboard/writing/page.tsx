// src/app/writing/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  BookOpen,
  PenTool,
  Calculator,
  Brain,
  Loader2,
  AlertCircle,
  RefreshCw,
  WifiOff
} from 'lucide-react';
import type { Book } from '@/types/educational.types';
import { CategoryIcon, defaultSections as sections } from '@/types/educational.types';
import LearningModal from '@/components/poetry/learningModal';
import { useApiClient } from '@/lib/api-client';
import { APIError } from '@/lib/api-client';

const getBookIcon = (category: CategoryIcon) => {
  const props = { size: 36, color: 'var(--icon-color, #666)' };
  switch (category) {
    case 'math':
    case 'sat':
    case 'ap':
      return <Calculator {...props} />;
    case 'english':
    case 'foundations':
      return <PenTool {...props} />;
    case 'science':
      return <Brain {...props} />;
    default:
      return <BookOpen {...props} />;
  }
};

type LoadingState = 'idle' | 'loading' | 'error' | 'success';

interface ErrorInfo {
  message: string;
  code?: string;
  canRetry: boolean;
}

export default function WritingPage() {
  const [activeSection, setActiveSection] = useState(sections[0].key);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const apiClient = useApiClient();

  // Fetch books from API
  const fetchBooks = async (isRetry = false) => {
    try {
      setLoadingState('loading');
      setError(null);

      // Get books from API - Fixed: use apiClient.educational.getBooks()
      const fetchedBooks = await apiClient.educational.getBooks();
      
      setBooks(fetchedBooks);
      setLoadingState('success');
      
      // Reset retry count on success
      if (isRetry) {
        setRetryCount(0);
      }
    } catch (err) {
      console.error('Error fetching books:', err);
      
      let errorInfo: ErrorInfo = {
        message: 'Unable to load books. Please try again.',
        canRetry: true
      };

      if (err instanceof APIError) {
        if (err.status === 404) {
          errorInfo = {
            message: 'No books found on the server.',
            code: 'NOT_FOUND',
            canRetry: false
          };
        } else if (err.status === 500) {
          errorInfo = {
            message: 'Server error. Our team has been notified.',
            code: 'SERVER_ERROR',
            canRetry: true
          };
        } else if (err.status === 408 || err.message.includes('timeout')) {
          errorInfo = {
            message: 'Request timed out. The server might be slow.',
            code: 'TIMEOUT',
            canRetry: true
          };
        } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
          errorInfo = {
            message: 'Cannot connect to server. Please check your connection.',
            code: 'NETWORK_ERROR',
            canRetry: true
          };
        }
      }

      setError(errorInfo);
      setLoadingState('error');
      
      // Increment retry count
      if (isRetry) {
        setRetryCount(prev => prev + 1);
      }
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books when section changes or books are updated
  useEffect(() => {
    const section = sections.find(s => s.key === activeSection);
    if (section && books.length > 0) {
      const filtered = books.filter(
        b => b.mainCategory === section.mainCategory && b.subCategory === section.subCategory
      );
      setFilteredBooks(filtered);
    } else {
      setFilteredBooks([]);
    }
  }, [activeSection, books]);

  // Auto-retry logic for certain errors
  useEffect(() => {
    if (loadingState === 'error' && error?.canRetry && retryCount < 3) {
      const timer = setTimeout(() => {
        fetchBooks(true);
      }, 5000 * (retryCount + 1)); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [loadingState, error, retryCount]);

  const openModal = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleRetry = () => {
    setRetryCount(0);
    fetchBooks(true);
  };

  // Render error state
  const renderError = () => {
    if (!error) return null;

    return (
      <ErrorContainer>
        <ErrorIcon>
          {error.code === 'NETWORK_ERROR' ? (
            <WifiOff size={48} />
          ) : (
            <AlertCircle size={48} />
          )}
        </ErrorIcon>
        <ErrorTitle>
          {error.code === 'NETWORK_ERROR' ? 'Connection Problem' : 'Something went wrong'}
        </ErrorTitle>
        <ErrorMessage>{error.message}</ErrorMessage>
        {error.canRetry && (
          <>
            <RetryButton onClick={handleRetry}>
              <RefreshCw size={16} />
              Try Again
            </RetryButton>
            {retryCount > 0 && (
              <RetryInfo>
                Retry attempt {retryCount} of 3
                {retryCount < 3 && ' - Will retry automatically...'}
              </RetryInfo>
            )}
          </>
        )}
      </ErrorContainer>
    );
  };

  // Render loading state
  const renderLoading = () => (
    <LoadingContainer>
      <Loader2 className="animate-spin" size={48} />
      <LoadingText>Loading books...</LoadingText>
    </LoadingContainer>
  );

  // Render empty state
  const renderEmpty = () => (
    <EmptyState>
      <EmptyMessage>
        {loadingState === 'success' && filteredBooks.length === 0
          ? 'No books available in this section.'
          : 'No books found.'}
      </EmptyMessage>
      {loadingState === 'success' && books.length === 0 && (
        <EmptySubMessage>
          The server returned no books. This might be a configuration issue.
        </EmptySubMessage>
      )}
    </EmptyState>
  );

  return (
    <PageContainer>
      <NavigationTabs>
        {sections.map(section => (
          <TabButton
            key={section.key}
            $isActive={activeSection === section.key}
            onClick={() => setActiveSection(section.key)}
            disabled={loadingState === 'loading'}
          >
            {getBookIcon(section.subCategory)}
            {section.title}
          </TabButton>
        ))}
      </NavigationTabs>

      {loadingState === 'loading' && renderLoading()}
      {loadingState === 'error' && renderError()}
      
      {loadingState === 'success' && (
        <BooksGrid>
          {filteredBooks.length > 0 ? (
            filteredBooks.map(book => (
              <BookCard
                key={book.id}
                $primaryColor={book.colors.primary}
                $secondaryColor={book.colors.secondary}
                onClick={() => openModal(book)}
              >
                <IconContainer>{getBookIcon(book.mainCategory)}</IconContainer>
                <BookTitle>{book.title}</BookTitle>
                <BookYear>Edition {book.year}</BookYear>
                <CategoryBadge>{book.subCategory.toUpperCase()}</CategoryBadge>
              </BookCard>
            ))
          ) : (
            renderEmpty()
          )}
        </BooksGrid>
      )}

      {isModalOpen && selectedBook && (
        <LearningModal book={selectedBook} onClose={closeModal} />
      )}
    </PageContainer>
  );
}

// --- Styled Components ---
const PageContainer = styled.div`
  --bg-start: #f8fafc;
  --bg-end: #e2e8f0;
  --primary-color: #2c2c2c;
  --secondary-color: #64748b;
  --accent-color: #2c2c2c;
  --border-radius: 12px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  background: linear-gradient(135deg, var(--bg-start), var(--bg-end));
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Work Sans', sans-serif;
  color: var(--primary-color);
`;

const NavigationTabs = styled.nav`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  border: 2px solid ${({ $isActive }) => ($isActive ? 'var(--accent-color)' : 'var(--primary-color)')};
  border-radius: var(--border-radius);
  background: ${({ $isActive }) => ($isActive ? 'var(--accent-color)' : 'transparent')};
  color: ${({ $isActive }) => ($isActive ? 'white' : 'var(--primary-color)')};
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? 0.6 : 1)};

  &:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
`;

const BookCard = styled.div<{ $primaryColor: string; $secondaryColor: string }>`
  --icon-color: ${({ $primaryColor }) => $primaryColor};
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid #e2e8f0;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
`;

const IconContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

const BookTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0.5rem 0;
`;

const BookYear = styled.span`
  font-size: 0.875rem;
  color: var(--secondary-color);
`;

const CategoryBadge = styled.span`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: var(--secondary-color);
  border-radius: 999px;
  font-size: 0.75rem;
`;

// Loading and Error States
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: var(--secondary-color);

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  font-size: 1.125rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
`;

const ErrorIcon = styled.div`
  color: #ef4444;
`;

const ErrorTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
`;

const ErrorMessage = styled.p`
  color: var(--secondary-color);
  max-width: 400px;
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  margin-top: 1rem;

  &:hover {
    opacity: 0.9;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const RetryInfo = styled.p`
  font-size: 0.875rem;
  color: var(--secondary-color);
  margin-top: 0.5rem;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem;
`;

const EmptyMessage = styled.p`
  color: var(--secondary-color);
  font-size: 1.125rem;
`;

const EmptySubMessage = styled.p`
  color: var(--secondary-color);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;