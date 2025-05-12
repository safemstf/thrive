'use client';

import React, { useState, useEffect, ReactElement } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { X, BookOpen, Coffee, Sun, Cloud, Heart, Moon, Feather } from 'lucide-react';

// Define Book interface for strong typing
interface Book {
  id: string;
  title: string;
  colors: { primary: string; secondary: string };
  description: string;
  excerpt: string;
  year: string;
  pages: any[];
}

export default function WritingPortfolioPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Function to get emoji based on book ID
  const getBookEmoji = (id: string): ReactElement => {
    const emojis: Record<string, ReactElement> = {
      'hoarding-instancy': <BookOpen size={48} />,
      'illusions-doubt': <Cloud size={48} />,
      'self-cruelty': <Heart size={48} />,
      'tyranny-chaos': <Coffee size={48} />,
      coverpage: <Sun size={48} />,
      glittering: <Moon size={48} />,
      intothedeep1: <Feather size={48} />,
    };
    return emojis[id] ?? <BookOpen size={48} />;
  };

  // Books data with colors used for gradients instead of images
  const books: Book[] = [/* ... your book array ... */];

  const openModal = (book: Book): void => {
    setSelectedBook(book);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (): void => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  return (
    <PageContainer>
      <BackgroundGradient />

      <Header>
        <Title>Writing Portfolio</Title>
        <Subtitle>I think, so I write! You should write too.</Subtitle>
      </Header>

      <SectionTitle>Poetry Collections</SectionTitle>

      <BooksGrid>
        {books.map((book: Book) => (
          <BookCard key={book.id} onClick={() => openModal(book)}>
            {/* ... book card markup ... */}
          </BookCard>
        ))}
      </BooksGrid>

      {/* ...rest of component and styled components... */}
    </PageContainer>
  );
}


// Styled components for the page layout
const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 4rem 2rem;
  color: #e8eaf6;
  max-width: 1400px;
  margin: 0 auto;
  overflow-x: hidden;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const BackgroundGradient = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a237e 0%, #1e6123 100%);
  z-index: -1;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -1.5rem;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #9fa8da 0%, #1e6123 100%);
    border-radius: 3px;
  }
`;

const Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(45deg, #c5cae9, #e8eaf6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #9fa8da;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #e8eaf6;
  position: relative;
  padding-left: 1rem;
  
  &:before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.5rem;
    bottom: 0.5rem;
    width: 4px;
    background: linear-gradient(180deg, #9fa8da 0%, #1e6123 100%);
    border-radius: 2px;
  }
`;

const BooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2.5rem;
  margin-bottom: 5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 2rem;
  }
`;

const BookCard = styled.div`
  position: relative;
  height: 400px;
  perspective: 1500px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    height: 320px;
  }
`;

const BookInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.8s;
  
  &:hover {
    transform: rotateY(180deg);
  }
`;

const BookFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`;

const BookCover = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  z-index: 1;
`;

const BookEmoji = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
`;

const ModalBookCover = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ModalBookEmoji = styled.div`
  font-size: 5rem;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
`;

const ModalBookTitle = styled.h3`
  font-size: 2rem;
  color: #ffffff;
  text-align: center;
  margin: 0;
  padding: 0 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const BookBack = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  transform: rotateY(180deg);
  background: linear-gradient(135deg, #3949ab 0%, #1e6123 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const BookBackContent = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const BookInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  z-index: 2;
`;

const BookYear = styled.div`
  font-size: 0.9rem;
  color: #9fa8da;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const BookTitle = styled.h3`
  font-size: 1.5rem;
  color: #e8eaf6;
  margin-bottom: 1rem;
  line-height: 1.3;
`;

const BookDescription = styled.p`
  font-size: 1rem;
  color: #c5cae9;
  line-height: 1.6;
  margin-bottom: 1rem;
`;

const ViewButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: linear-gradient(45deg, #5c6bc0, #1e6123);
  color: #e8eaf6;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const OtherWritings = styled.section`
  margin-bottom: 5rem;
`;

const WritingCategories = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const CategoryCard = styled.div`
  background: rgba(92, 107, 192, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(92, 107, 192, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }
`;

const CategoryIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const CategoryTitle = styled.h3`
  font-size: 1.5rem;
  color: #e8eaf6;
  margin-bottom: 1rem;
`;

const CategoryDescription = styled.p`
  font-size: 1rem;
  color: #c5cae9;
  line-height: 1.6;
`;

const Footer = styled.footer`
  display: flex;
  justify-content: center;
  margin-top: 3rem;
`;

const BackButton = styled.button`
  padding: 0.75rem 2rem;
  background: none;
  border: 1px solid #9fa8da;
  color: #e8eaf6;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    background: rgba(92, 107, 192, 0.2);
    border-color: #c5cae9;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(26, 35, 126, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, rgba(92, 107, 192, 0.2) 0%, rgba(30, 97, 35, 0.2) 100%);
  border-radius: 12px;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(197, 202, 233, 0.2);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(26, 35, 126, 0.3);
  color: #e8eaf6;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s ease;
  
  &:hover {
    background: rgba(92, 107, 192, 0.5);
  }
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 45% 55%;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ModalImageContainer = styled.div`
  position: relative;
  height: 600px;
  
  @media (max-width: 768px) {
    height: 400px;
  }
`;

const ModalInfo = styled.div`
  padding: 3rem 2rem;
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
  }
`;

const ModalTitle = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #e8eaf6;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ModalDescription = styled.p`
  font-size: 1.1rem;
  color: #c5cae9;
  line-height: 1.8;
  margin-bottom: 2rem;
`;

const ExcerptContainer = styled.div`
  background: rgba(26, 35, 126, 0.3);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  border-left: 3px solid #5c6bc0;
`;

const ExcerptTitle = styled.h4`
  font-size: 1.2rem;
  color: #9fa8da;
  margin-bottom: 1rem;
`;

const Excerpt = styled.p`
  font-size: 1.1rem;
  color: #e8eaf6;
  line-height: 1.8;
  font-style: italic;
  white-space: pre-line;
`;

const RequestButton = styled.button`
  padding: 0.8rem 1.8rem;
  background: linear-gradient(45deg, #5c6bc0, #1e6123);
  color: #e8eaf6;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

