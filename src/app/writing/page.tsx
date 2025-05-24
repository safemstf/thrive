'use client';

import React, { useState, useEffect, JSX } from 'react';
import styled from 'styled-components';
import { X, BookOpen, PenTool, Bookmark, Calculator, Brain, Globe, Book as BookIcon } from 'lucide-react';
import { books, Book, Category } from '@/data/books';

// Define section configuration with proper typing
interface SectionConfig {
  key: string;
  title: string;
  categories: Category[];
}

const sections: SectionConfig[] = [
  { 
    key: 'sat', 
    title: 'SAT Guides', 
    categories: ['math', 'english'] 
  },
  { 
    key: 'workbooks', 
    title: 'Writing Workbooks', 
    categories: ['english-workbook'] // Fixed: using proper category type
  },
  { 
    key: 'ms-science', 
    title: 'MS Science', 
    categories: ['life-science', 'physical-science', 'earth-science'] 
  },
  { 
    key: 'ap-science', 
    title: 'AP Science', 
    categories: ['ap-physics', 'ap-biology', 'ap-chemistry'] 
  },
  { 
    key: 'ap-calc', 
    title: 'AP Calculus', 
    categories: ['calculus-ab', 'calculus-bc'] 
  },
];

// Improved icon mapping with fallback
const getBookIcon = (category: Category): JSX.Element => {
  const iconSize = 36;
  const iconProps = { size: iconSize, color: 'var(--icon-color, #666)' };
  
  const iconMap: Record<Category, JSX.Element> = {
    'math': <Calculator {...iconProps} />,
    'math-workbook': <Calculator {...iconProps} />,
    'calculus-ab': <Calculator {...iconProps} />,
    'calculus-bc': <Calculator {...iconProps} />,
    'english': <PenTool {...iconProps} />,
    'english-workbook': <Bookmark {...iconProps} />,
    'life-science': <Brain {...iconProps} />,
    'physical-science': <Brain {...iconProps} />,
    'earth-science': <Globe {...iconProps} />,
    'ap-physics': <Brain {...iconProps} />,
    'ap-biology': <Brain {...iconProps} />,
    'ap-chemistry': <Brain {...iconProps} />,
  };
  
  return iconMap[category] || <BookOpen {...iconProps} />;
};

type SectionKey = string;

export default function WritingPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>(sections[0].key);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  // Update filtered books when active section changes
  useEffect(() => {
    const currentSection = sections.find(sec => sec.key === activeSection);
    if (currentSection) {
      const filtered = books.filter(book => 
        currentSection.categories.includes(book.category)
      );
      setFilteredBooks(filtered);
    }
  }, [activeSection]);

  // Handle body scroll lock for modal
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [isModalOpen]);

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBook(null);
  };

  const handleModalOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const currentSection = sections.find(sec => sec.key === activeSection);

  return (
    <PageContainer>
      <Header>
        <Title>Educational Resources</Title>
        <Subtitle>Explore our collection of study guides and workbooks</Subtitle>
      </Header>

      <NavigationTabs>
        {sections.map(section => (
          <TabButton
            key={section.key}
            $isActive={activeSection === section.key}
            onClick={() => setActiveSection(section.key)}
            aria-pressed={activeSection === section.key}
          >
            {section.title}
          </TabButton>
        ))}
      </NavigationTabs>

      <SectionHeader>
        <SectionTitle>{currentSection?.title}</SectionTitle>
        <BookCount>{filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} available</BookCount>
      </SectionHeader>

      <BooksGrid>
        {filteredBooks.length > 0 ? (
          filteredBooks.map(book => (
            <BookCard
              key={book.id}
              onClick={() => handleBookClick(book)}
              $primaryColor={book.colors?.primary || '#2c2c2c'}
              $secondaryColor={book.colors?.secondary || '#f0f0f0'}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleBookClick(book);
                }
              }}
            >
              <IconContainer>
                {getBookIcon(book.category)}
              </IconContainer>
              <BookTitle>{book.title}</BookTitle>
              <BookYear>Edition {book.year}</BookYear>
              <CategoryBadge>{book.category.replace('-', ' ').toUpperCase()}</CategoryBadge>
            </BookCard>
          ))
        ) : (
          <EmptyState>
            <BookIcon size={48} color="#ccc" />
            <EmptyMessage>No books available in this category</EmptyMessage>
          </EmptyState>
        )}
      </BooksGrid>

      {isModalOpen && selectedBook && (
        <ModalOverlay onClick={handleModalOverlayClick}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedBook.title}</ModalTitle>
              <CloseButton 
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <X size={24} />
              </CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <BookDetails>
                <DetailRow>
                  <DetailLabel>Category:</DetailLabel>
                  <DetailValue>{selectedBook.category.replace('-', ' ').toUpperCase()}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>Year:</DetailLabel>
                  <DetailValue>{selectedBook.year}</DetailValue>
                </DetailRow>
              </BookDetails>
              
              {selectedBook.description && (
                <Description>{selectedBook.description}</Description>
              )}
              
              <ActionSection>
                {selectedBook.link ? (
                  <PrimaryLink 
                    href={selectedBook.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    View Online
                  </PrimaryLink>
                ) : (
                  <ComingSoon>Preview coming soon</ComingSoon>
                )}
              </ActionSection>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
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
  font-family: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--primary-color);
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--secondary-color);
  margin: 0;
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

const TabButton = styled.button<{ $isActive?: boolean }>`
  padding: 1rem 1.5rem;
  font-family: inherit;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 2px solid ${({ $isActive }) => $isActive ? 'var(--accent-color)' : 'var(--primary-color)'};
  border-radius: var(--border-radius);
  background: ${({ $isActive }) => $isActive ? 'var(--accent-color)' : 'transparent'};
  color: ${({ $isActive }) => $isActive ? 'white' : 'var(--primary-color)'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: ${({ $isActive }) => $isActive ? 'var(--accent-color)' : 'var(--primary-color)'};
    color: white;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const BookCount = styled.span`
  color: var(--secondary-color);
  font-size: 0.9rem;
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const BookCard = styled.div<{ $primaryColor: string; $secondaryColor: string }>`
  --icon-color: ${({ $primaryColor }) => $primaryColor};
  
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${({ $primaryColor }) => $primaryColor}, ${({ $secondaryColor }) => $secondaryColor});
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
  
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
`;

const IconContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
`;

const BookTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
`;

const BookYear = styled.span`
  font-size: 0.875rem;
  color: var(--secondary-color);
  display: block;
  margin-bottom: 0.75rem;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #f1f5f9;
  color: var(--secondary-color);
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  color: var(--secondary-color);
`;

const EmptyMessage = styled.p`
  margin: 1rem 0 0 0;
  font-size: 1.1rem;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: var(--border-radius);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  padding-right: 1rem;
  line-height: 1.3;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  color: var(--secondary-color);
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: var(--primary-color);
  }
  
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
`;

const ModalBody = styled.div`
  padding: 1rem 2rem 2rem 2rem;
`;

const BookDetails = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
`;

const DetailLabel = styled.span`
  font-weight: 600;
  color: var(--secondary-color);
  min-width: 80px;
`;

const DetailValue = styled.span`
  color: var(--primary-color);
`;

const Description = styled.div`
  margin-bottom: 1.5rem;
  line-height: 1.6;
  color: var(--secondary-color);
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: center;
`;

const PrimaryLink = styled.a`
  display: inline-block;
  padding: 0.75rem 2rem;
  background: var(--accent-color);
  color: white;
  text-decoration: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #0000;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:focus {
    outline: 2px solid var(--accent-color);
    outline-offset: 2px;
  }
`;

const ComingSoon = styled.em`
  color: var(--secondary-color);
  font-style: italic;
`;