'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { X, BookOpen, Calculator, PenTool, Brain, BookMarked, Bookmark } from 'lucide-react';

// Define Book interface for strong typing
interface Book {
  id: string;
  title: string;
  colors: { primary: string; secondary: string; text: string };
  description: string;
  excerpt: string;
  category: 'math' | 'english' | 'math-workbook' | 'english-workbook';
  year: string;
}

export default function SATMaterialsPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  
  // Function to get icon based on book category
  const getBookIcon = (category: string) => {
    const icons = {
      'math': <Calculator size={36} />,
      'english': <PenTool size={36} />,
      'math-workbook': <BookMarked size={36} />,
      'english-workbook': <Bookmark size={36} />
    };
    return icons[category as keyof typeof icons] || <BookOpen size={36} />;
  };

  // Sample books data with professional color schemes
  const books: Book[] = [
    {
      id: 'sat-math-foundations',
      title: 'SAT Math Success Guide',
      colors: {
        primary: '#1C3E6E',
        secondary: '#2A5CA5',
        text: '#FFFFFF'
      },
      description: 'Core concepts and principles for SAT Math success',
      excerpt: 'Master the fundamental concepts of algebra, geometry, and data analysis essential for SAT success. This comprehensive guide breaks down complex mathematical concepts into clear, step-by-step explanations with practical examples.',
      category: 'math',
      year: '2025'
    },
    {
      id: 'sat-reading-writing',
      title: 'SAT Reading & Writing Success Guide',
      colors: {
        primary: '#4B2D83',
        secondary: '#6B4199',
        text: '#FFFFFF'
      },
      description: 'The composite of all 4 success guides for reading. Comprehensive strategies for SAT verbal sections',
      excerpt: 'Learn proven techniques for reading comprehension, grammar rules, and effective writing on the SAT. This guide provides systematic approaches to tackle complex passages and optimize your performance on the evidence-based reading and writing sections.',
      category: 'english',
      year: '2025'
    },
    {
      id: 'sat-math-workbook',
      title: 'SAT Math Practice Workbook',
      colors: {
        primary: '#00496F',
        secondary: '#006699',
        text: '#FFFFFF'
      },
      description: 'Practice problems and worked solutions',
      excerpt: 'Over 500 practice problems with detailed solutions covering all SAT Math topics. Each section includes concept review, worked examples, and progressively challenging exercises to develop mastery.',
      category: 'math-workbook',
      year: '2025'
    },
    {
      id: 'sat-english-workbook',
      title: 'SAT Reading & Writing Workbook',
      colors: {
        primary: '#48304D',
        secondary: '#5F4668',
        text: '#FFFFFF'
      },
      description: 'Extensive practice for verbal sections',
      excerpt: 'Comprehensive practice with passages, questions, and detailed explanations for the Reading and Writing sections. Includes authentic practice materials organized by question type and difficulty level.',
      category: 'english-workbook',
      year: '2025'
    },
    {
      id: 'sat-geometry',
      title: 'SAT Geometry Success Guide',
      colors: {
        primary: '#2D5F5D',
        secondary: '#3A7A75',
        text: '#FFFFFF'
      },
      description: 'Focused geometry preparation for the SAT math section',
      excerpt: 'Explore key geometry concepts such as angles, triangles, circles, and coordinate geometry. This guide is tailored to help students master the geometry-based questions on the SAT with clear explanations and targeted practice.',
      category: 'math',
      year: '2025'
    },
    {
      id: 'sat-algebra',
      title: 'SAT Algebra Success Guide',
      colors: {
        primary: '#1E3D59',
        secondary: '#3B5B7B',
        text: '#FFFFFF'
      },
      description: 'Comprehensive guide to mastering algebra on the SAT',
      excerpt: 'Focuses on linear equations, inequalities, and systems of equations. Offers concept breakdowns and targeted strategies to build a strong algebra foundation for the SAT.',
      category: 'math',
      year: '2025'
    },
    {
      id: 'sat-data-analysis',
      title: 'SAT Data Analysis Success Guide',
      colors: {
        primary: '#0C3B2E',
        secondary: '#136F63',
        text: '#FFFFFF'
      },
      description: 'Develop quantitative reasoning and data literacy for SAT success',
      excerpt: 'Covers interpreting data from charts, tables, and graphs. Learn to evaluate statistics, ratios, and probabilities with clarity and precision.',
      category: 'math',
      year: '2025'
    },
    {
      id: 'sat-standard-english',
      title: 'SAT Standard English Conventions Guide',
      colors: {
        primary: '#37474F',
        secondary: '#546E7A',
        text: '#FFFFFF'
      },
      description: 'Grammar, punctuation, and sentence structure essentials',
      excerpt: 'Master the rules of English grammar and usage tested on the SAT. Learn to identify and correct sentence-level errors using targeted drills and explanations.',
      category: 'english',
      year: '2025'
    },
    {
      id: 'sat-expression-ideas',
      title: 'SAT Expression of Ideas Guide',
      colors: {
        primary: '#6A1B9A',
        secondary: '#8E24AA',
        text: '#FFFFFF'
      },
      description: 'Develop clarity, style, and logic in writing',
      excerpt: 'Refine your ability to revise texts for effectiveness, clarity, and cohesion. Learn strategies to strengthen arguments and organize ideas within SAT writing tasks.',
      category: 'english',
      year: '2025'
    },
    {
      id: 'sat-advanced-math',
      title: 'SAT Advanced Mathematics Success Guide',
      colors: {
        primary: '#7D1935',
        secondary: '#9C2542',
        text: '#FFFFFF'
      },
      description: 'Complex math concepts for high-scoring students',
      excerpt: 'Take your SAT math preparation to the next level with advanced concepts and challenging problem sets. Designed for students aiming for top scores, this guide explores the most complex SAT math problems with sophisticated solution strategies.',
      category: 'math',
      year: '2025'
    },
    {
      id: 'ap-chem-success',
      title: 'AP Chemistry Success Guide',
      colors: {
        primary: '#1565C0',
        secondary: '#1E88E5',
        text: '#FFFFFF'
      },
      description: 'In-depth content review and strategies for AP Chemistry',
      excerpt: 'Covers all AP Chemistry topics including stoichiometry, thermodynamics, equilibrium, and kinetics. Features conceptual breakdowns, practice questions, and lab insights to ensure comprehensive exam readiness.',
      category: 'math',
      year: '2025'
    },
    {
      id: 'ap-bio-success',
      title: 'AP Biology Success Guide',
      colors: {
        primary: '#2E7D32',
        secondary: '#43A047',
        text: '#FFFFFF'
      },
      description: 'Master the essential content and thinking skills for AP Biology',
      excerpt: 'Dive into molecular biology, genetics, evolution, and ecology. This guide includes high-yield summaries, practice questions, and exam-focused strategies.',
      category: 'math',
      year: '2025'
    },
    {
      id: 'ap-physics-success',
      title: 'AP Physics Success Guide',
      colors: {
        primary: '#37474F',
        secondary: '#546E7A',
        text: '#FFFFFF'
      },
      description: 'Conceptual and quantitative prep for AP Physics exams',
      excerpt: 'Covers AP Physics 1 and 2 topics including kinematics, Newton’s laws, waves, electricity, and magnetism. Includes worked problems, conceptual explanations, and visual breakdowns.',
      category: 'math',
      year: '2025'
    }
  ];


  const openModal = (book: Book) => {
    setSelectedBook(book);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <PageContainer>
      <BackgroundGradient />

      <Header>
        <Logo>
          <BookOpen size={32} />
          <span>EXCEL PREP</span>
        </Logo>
        <Title>SAT Preparation Materials</Title>
        <Subtitle>Professional resources to help students achieve their target scores</Subtitle>
      </Header>

      <ContentSection>
        <SectionTitle>
          <Brain size={20} style={{ marginRight: '12px' }} />
          Core Study Materials
        </SectionTitle>
        <BooksGrid>
          {books
            .filter(book => book.category === 'math' || book.category === 'english')
            .map(book => (
              <BookCard key={book.id} onClick={() => openModal(book)}>
                <BookCover style={{
                  background: `linear-gradient(135deg, ${book.colors.primary} 0%, ${book.colors.secondary} 100%)`
                }}>
                  <BookIcon>{getBookIcon(book.category)}</BookIcon>
                  <BookTitle>{book.title}</BookTitle>
                  <BookMeta>
                    <BookEdition>Edition {book.year}</BookEdition>
                  </BookMeta>
                </BookCover>
              </BookCard>
            ))}
        </BooksGrid>

        <SectionTitle>
          <BookOpen size={20} style={{ marginRight: '12px' }} />
          Practice & Application
        </SectionTitle>
        <BooksGrid>
          {books
            .filter(book => book.category === 'math-workbook' || book.category === 'english-workbook')
            .map(book => (
              <BookCard key={book.id} onClick={() => openModal(book)}>
                <BookCover style={{
                  background: `linear-gradient(135deg, ${book.colors.primary} 0%, ${book.colors.secondary} 100%)`
                }}>
                  <BookIcon>{getBookIcon(book.category)}</BookIcon>
                  <BookTitle>{book.title}</BookTitle>
                  <BookMeta>
                    <BookEdition>Edition {book.year}</BookEdition>
                  </BookMeta>
                </BookCover>
              </BookCard>
            ))}
        </BooksGrid>
      </ContentSection>

      <Footer>
        <BackButton onClick={() => router.push('/')}>Return to Home</BackButton>
        <FooterText>© 2025 Excel Prep. All rights reserved.</FooterText>
      </Footer>

      {modalOpen && selectedBook && (
        <Modal>
          <ModalContent>
            <CloseButton onClick={closeModal}>
              <X size={20} />
            </CloseButton>
            <ModalGrid>
              <ModalImageContainer>
                <ModalBookCover style={{
                  background: `linear-gradient(135deg, ${selectedBook.colors.primary} 0%, ${selectedBook.colors.secondary} 100%)`
                }}>
                  <ModalBookIcon>{getBookIcon(selectedBook.category)}</ModalBookIcon>
                  <ModalBookTitle>{selectedBook.title}</ModalBookTitle>
                  <ModalBookEdition>Edition {selectedBook.year}</ModalBookEdition>
                </ModalBookCover>
              </ModalImageContainer>
              <ModalInfo>
                <ModalTitle>{selectedBook.title}</ModalTitle>
                <ModalDescription>{selectedBook.description}</ModalDescription>
                <ExcerptContainer>
                  <ExcerptTitle>About this resource</ExcerptTitle>
                  <Excerpt>{selectedBook.excerpt}</Excerpt>
                </ExcerptContainer>
                <ButtonsContainer>
                  <PrimaryButton>Request Sample</PrimaryButton>
                  <SecondaryButton>View Details</SecondaryButton>
                </ButtonsContainer>
              </ModalInfo>
            </ModalGrid>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
}

// Styled components for the page layout
const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 0;
  color: #212121;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #F5F7FA;
  overflow-x: hidden;
`;

const BackgroundGradient = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #F5F7FA;
  z-index: -1;
`;

const Header = styled.header`
  text-align: center;
  padding: 3rem 2rem 4rem;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E0E6ED;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #1C3E6E;
  
  span {
    margin-left: 0.75rem;
    font-weight: 700;
    font-size: 1.25rem;
    letter-spacing: 0.1rem;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1C3E6E;
  font-weight: 800;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6B7280;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ContentSection = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 2rem;
  color: #1C3E6E;
  font-weight: 700;
  display: flex;
  align-items: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #E0E6ED;
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1.5rem;
  }
`;

const BookCard = styled.div`
  position: relative;
  height: 320px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  background-color: #FFFFFF;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    height: 280px;
  }
`;

const BookCover = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  text-align: center;
`;

const BookIcon = styled.div`
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
`;

const BookTitle = styled.h3`
  font-size: 1.25rem;
  color: #FFFFFF;
  margin-bottom: 1.5rem;
  line-height: 1.3;
  font-weight: 600;
`;

const BookMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BookEdition = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
`;

const Footer = styled.footer`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: #FFFFFF;
  border-top: 1px solid #E0E6ED;
`;

const BackButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #F5F7FA;
  border: 1px solid #D1D5DB;
  color: #1C3E6E;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #E5E7EB;
  }
`;

const FooterText = styled.p`
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #6B7280;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(17, 24, 39, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: #FFFFFF;
  border-radius: 8px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #F3F4F6;
  color: #4B5563;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.2s ease;
  
  &:hover {
    background: #E5E7EB;
    color: #111827;
  }
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 40% 60%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ModalImageContainer = styled.div`
  position: relative;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #F9FAFB;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const ModalBookCover = styled.div`
  width: 100%;
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  text-align: center;
  padding: 2rem;
`;

const ModalBookIcon = styled.div`
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.95);
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.2));
`;

const ModalBookTitle = styled.h3`
  font-size: 1.5rem;
  color: #FFFFFF;
  text-align: center;
  margin: 0 0 1rem;
  padding: 0 1rem;
  font-weight: 600;
`;

const ModalBookEdition = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  background-color: rgba(0, 0, 0, 0.15);
  border-radius: 4px;
`;

const ModalInfo = styled.div`
  padding: 2.5rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 0.75rem;
  color: #1C3E6E;
  line-height: 1.2;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const ModalDescription = styled.p`
  font-size: 1rem;
  color: #4B5563;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const ExcerptContainer = styled.div`
  background: #F9FAFB;
  padding: 1.5rem;
  border-radius: 6px;
  margin-bottom: 2rem;
  border-left: 4px solid #1C3E6E;
`;

const ExcerptTitle = styled.h4`
  font-size: 1rem;
  color: #1C3E6E;
  margin-bottom: 0.75rem;
  font-weight: 600;
`;

const Excerpt = styled.p`
  font-size: 1rem;
  color: #4B5563;
  line-height: 1.6;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const PrimaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #1C3E6E 0%, #2A5CA5 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(28, 62, 110, 0.3);
  }
`;

const SecondaryButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  border: 1px solid #1C3E6E;
  color: #1C3E6E;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(28, 62, 110, 0.05);
  }
`;