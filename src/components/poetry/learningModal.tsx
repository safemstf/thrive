// src/components/LearningModal.tsx

'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import type { Book, LearningContent } from '@/types/educational.types';
import { api } from '@/lib/api-client';

export interface LearningModalProps {
  book: Book;
  onClose: () => void;
}

export default function LearningModal({ book, onClose }: LearningModalProps) {
  const [content, setContent] = useState<LearningContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Overview');

  useEffect(() => {
    async function fetchContent() {
      try {
        const mathConcepts = await api.content.getMathConcepts(book.id);
        const scienceConcepts = await api.content.getScienceConcepts(book.id);
        const grammarRules = await api.content.getGrammarRules(book.id);
        setContent({ mathConcepts, scienceConcepts, grammarRules });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [book.id]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (loading) {
    return (
      <ModalOverlay>
        <Spinner>Loading...</Spinner>
      </ModalOverlay>
    );
  }
  if (error || !content) {
    return (
      <ModalOverlay>
        <ModalError>{error || 'Failed to load content'}</ModalError>
      </ModalOverlay>
    );
  }

  const tabs = [
    { key: 'Overview', label: 'Overview' },
    { key: 'Math', label: 'Math Concepts' },
    { key: 'Science', label: 'Science Concepts' },
    { key: 'Grammar', label: 'Grammar Rules' }
  ];

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{book.title} - Learning Guide</ModalTitle>
          <CloseButton onClick={onClose}><X size={24} /></CloseButton>
        </ModalHeader>

        <TabList>
          {tabs.map(tab => (
            <Tab key={tab.key} $active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </Tab>
          ))}
        </TabList>

        <LearningContent>
          {activeTab === 'Overview' && <Description>{book.description}</Description>}
          {activeTab === 'Math' && content.mathConcepts && (
            <ContentList>
              {content.mathConcepts.map(mc => <li key={mc.id}>{mc.topic}</li>)}
            </ContentList>
          )}
          {activeTab === 'Science' && content.scienceConcepts && (
            <ContentList>
              {content.scienceConcepts.map(sc => <li key={sc.id}>{sc.topic}</li>)}
            </ContentList>
          )}
          {activeTab === 'Grammar' && content.grammarRules && (
            <ContentList>
              {content.grammarRules.map(gr => <li key={gr.id}>{gr.topic}</li>)}
            </ContentList>
          )}
        </LearningContent>
      </ModalContent>
    </ModalOverlay>
  );
}

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: var(--border-radius);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
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
  }
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 2px solid #eee;
  margin: 0 2rem;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: ${({ $active }) => ($active ? '3px solid #48304D' : '3px solid transparent')};
  font-weight: ${({ $active }) => ($active ? '600' : '400')};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f8f9fa;
  }
`;

const LearningContent = styled.div`
  padding: 2rem;
  line-height: 1.5;
`;

const Description = styled.div`
  margin-bottom: 1.5rem;
  color: var(--secondary-color);
`;

const ContentList = styled.ul`
  list-style: disc;
  padding-left: 1.5rem;
`;

const Spinner = styled.div`
  color: white;
  font-size: 1.25rem;
`;

const ModalError = styled.div`
  color: white;
  font-size: 1.25rem;
`;

