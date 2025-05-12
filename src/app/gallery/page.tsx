'use client';

import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import portrait1 from '@/assets/art/portrait1.jpg';
import portrait2 from '@/assets/art/portrait2.jpg';
import portrait3 from '@/assets/art/portrait3.jpg';
import portrait4 from '@/assets/art/portrait4.jpg';
import portrait5 from '@/assets/art/portrait5.jpg';
import portrait6 from '@/assets/art/portrait6.jpg';
import portrait7 from '@/assets/art/portrait7.jpg';
import portrait8 from '@/assets/art/portrait8.jpg';
import portrait9 from '@/assets/art/portrait9.jpg';
import portrait10 from '@/assets/art/portrait10.jpg';

// Golden ratio constant
const GOLDEN_RATIO = 1.618;

// Global museum-inspired fonts & colors
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Work+Sans:wght@300;400;500&display=swap');

  body {
    background-color: #f8f8f8;
    color: #2c2c2c;
    font-family: 'Work Sans', sans-serif;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5 {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 500;
  }
`;

interface Piece {
  src: StaticImageData;
  alt: string;
  title: string;
  description: string;
  size: 'large' | 'medium' | 'small' | 'tiny';
}

// Determine optimal grid areas based on viewport
const getGridTemplate = (windowWidth: number) => {
  if (windowWidth < 768) {
    return `
      "a a" 
      "b c" 
      "d d" 
      "e f" 
      "g g" 
      "h i" 
      "j j"
    `;
  } else if (windowWidth < 1024) {
    return `
      "a a b c" 
      "a a d e" 
      "f g h i" 
      "j j j j"
    `;
  } else {
    return `
      "a a a b c" 
      "a a a d e" 
      "f g h i j"
    `;
  }
};

export default function GalleryPage() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [gridTemplate, setGridTemplate] = useState(getGridTemplate(1200));

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setGridTemplate(getGridTemplate(window.innerWidth));
    };

    // Initialize with current window size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Assign size variants based on golden ratio principles
  const pieces: Piece[] = [
    // { 
    //   src: portrait1, 
    //   alt: 'Portrait I', 
    //   title: 'Portrait I', 
    //   description: 'A modern exploration of human expression through abstraction.',
    //   size: 'large' 
    // },
    // { 
    //   src: portrait2, 
    //   alt: 'Portrait II', 
    //   title: 'Portrait II', 
    //   description: 'Vibrant colors merge with subtle expressions.',
    //   size: 'small' 
    // },
    { 
      src: portrait3, 
      alt: 'Death News II', 
      title: 'Death News II', 
      description: 'A commentary on mortality and media.',
      size: 'small' 
    },
    { 
      src: portrait4, 
      alt: 'Landscape I', 
      title: 'Landscape I', 
      description: 'Beauty of nature captured in elegant minimalism.',
      size: 'medium' 
    },
    { 
      src: portrait5, 
      alt: 'Landscape III', 
      title: 'Landscape III', 
      description: 'Abstract views of natural formations.',
      size: 'medium' 
    },
    { 
      src: portrait6, 
      alt: 'Portrait III', 
      title: 'Portrait III', 
      description: 'Exploring identity through contemporary portraiture.',
      size: 'medium' 
    },
    { 
      src: portrait7, 
      alt: 'Death News I', 
      title: 'Death News I', 
      description: 'First in a series ',
      size: 'medium' 
    },
    { 
      src: portrait8, 
      alt: 'Landscape II', 
      title: 'Landscape II', 
      description: 'Serene vistas captured with emotional depth.',
      size: 'small' 
    },
    { 
      src: portrait9, 
      alt: 'Genesis', 
      title: 'Genesis', 
      description: 'An exploration of beginnings and creation.',
      size: 'small' 
    },
    { 
      src: portrait10, 
      alt: 'Landscape IV', 
      title: 'Landscape IV', 
      description: 'The culmination of a series examining natural harmony.',
      size: 'large' 
    },
  ];

  const openModal = (piece: Piece) => {
    setSelectedPiece(piece);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Determine the areas for grid items
  const gridAreas = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];

  return (
    <>
      <GlobalStyle />
      <MuseumWrapper>
        <Header>
          <Title>Artistic Journeys</Title>
          <Subtitle>A curated collection exploring form, color, and emotion</Subtitle>
        </Header>

        <GalleryGrid template={gridTemplate}>
          {pieces.map((piece, idx) => (
            <GalleryItem 
              key={idx}
              onClick={() => openModal(piece)}
              area={gridAreas[idx]}
              size={piece.size}
            >
              <ImageContainer>
                <Image
                  src={piece.src}
                  alt={piece.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={idx < 4}
                />
              </ImageContainer>
              <ItemOverlay>
                <ItemTitle>{piece.title}</ItemTitle>
              </ItemOverlay>
            </GalleryItem>
          ))}
        </GalleryGrid>

        <InfoSection>
          <BackButton onClick={() => router.push('/')}>Return to Main Hall</BackButton>
        </InfoSection>

        {modalOpen && selectedPiece && (
          <Modal onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={closeModal}>
                <X size={24} />
              </CloseButton>
              <ModalImageContainer>
                <Image
                  src={selectedPiece.src}
                  alt={selectedPiece.alt}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="100vw"
                  priority
                />
              </ModalImageContainer>
              <ModalInfo>
                <ModalTitle>{selectedPiece.title}</ModalTitle>
                <ModalDescription>{selectedPiece.description}</ModalDescription>
              </ModalInfo>
            </ModalContent>
          </Modal>
        )}
      </MuseumWrapper>
    </>
  );
}

const MuseumWrapper = styled.main`
  min-height: 100vh;
  padding: 2rem;
  background-color: #f8f8f8;
  background-image: linear-gradient(to right, rgba(248, 248, 248, 0.9) 0%, rgba(240, 240, 240, 0.9) 100%);

  @media (min-width: 768px) {
    padding: 3rem;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 4rem;
  padding-bottom: 2rem;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 1px;
    background: #2c2c2c;
    opacity: 0.3;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
  font-weight: 400;
  letter-spacing: 1.5px;
  
  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #555;
  max-width: 600px;
  margin: 0 auto;
  font-weight: 300;
  letter-spacing: 0.5px;
`;

interface GalleryGridProps {
  template: string;
}

const GalleryGrid = styled.section<GalleryGridProps>`
  display: grid;
  grid-template-areas: ${props => props.template};
  gap: 1rem;
  margin-bottom: 4rem;
  max-width: 1800px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    gap: 1.5rem;
  }
`;

interface GalleryItemProps {
  area: string;
  size: string;
}

const GalleryItem = styled.div<GalleryItemProps>`
  grid-area: ${props => props.area};
  aspect-ratio: ${props => {
    switch(props.size) {
      case 'large': return '1.2';
      case 'medium': return '1';
      case 'small': return '0.8';
      case 'tiny': return '0.75';
      default: return '1';
    }
  }};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.5s ease;
  border-radius: 2px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  
  &:hover {
    transform: translateY(-5px);
    
    img {
      transform: scale(1.05);
    }
    
    > div:last-child {
      opacity: 1;
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  
  img {
    transition: transform 0.7s ease;
  }
`;

const ItemOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  opacity: 0.8;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  height: 100%;
`;

const ItemTitle = styled.h3`
  color: white;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 400;
`;

const InfoSection = styled.div`
  text-align: center;
  margin: 4rem 0 2rem;
  color: #555;
  
  p {
    margin-bottom: 2rem;
    font-style: italic;
  }
`;

const BackButton = styled.button`
  background: none;
  border: 1px solid #2c2c2c;
  color: #2c2c2c;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  
  &:hover {
    background: #2c2c2c;
    color: #f8f8f8;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(30, 30, 30, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  position: relative;
  width: 100%;
  height: 90vh;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: rgba(0,0,0,0.3);
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: rgba(0,0,0,0.5);
  }
`;

const ModalImageContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;
`;

const ModalInfo = styled.div`
  padding: 1.5rem;
  background-color: #f8f8f8;
  color: #2c2c2c;
`;

const ModalTitle = styled.h2`
  margin: 0 0 0.5rem;
  font-size: 1.8rem;
  font-weight: 400;
`;

const ModalDescription = styled.p`
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
`;