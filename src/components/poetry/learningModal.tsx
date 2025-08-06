// src/components/LearningModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import type { Book } from '@/types/educational.types';
import type { ConceptProgress } from '@/types/portfolio.types';
import { api } from '@/lib/api-client';

export interface LearningModalProps {
  book: Book;
  onClose: () => void;
}

export default function LearningModal({ book, onClose }: LearningModalProps) {
  const [concepts, setConcepts] = useState<ConceptProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Overview');

  useEffect(() => {
    async function fetchConcepts() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch concepts using portfolio API
        const response = await api.portfolio.concepts.get();
        setConcepts(response.concepts || []);
      } catch (err) {
        console.error('Failed to fetch concepts:', err);
        setError('Failed to load learning content');
      } finally {
        setLoading(false);
      }
    }
    
    fetchConcepts();
  }, [book.id]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (loading) {
    return (
      <ModalOverlay>
        <Spinner>Loading learning content...</Spinner>
      </ModalOverlay>
    );
  }
  
  if (error) {
    return (
      <ModalOverlay>
        <ModalError>{error}</ModalError>
      </ModalOverlay>
    );
  }

  // Group concepts by subject using conceptId prefix
  const mathConcepts = concepts.filter(c => c.conceptId.startsWith('math-'));
  const scienceConcepts = concepts.filter(c => c.conceptId.startsWith('science-'));
  const grammarConcepts = concepts.filter(c => c.conceptId.startsWith('grammar-'));

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
          
          {activeTab === 'Math' && (
            <ContentList>
              {mathConcepts.map(concept => (
                <ConceptItem key={concept.conceptId}>
                  <ConceptTitle>{concept.conceptId.replace('math-', 'Math: ')}</ConceptTitle>
                  <ConceptStatus $status={concept.status}>
                    Status: {concept.status}
                  </ConceptStatus>
                  {concept.score && <ConceptScore>Score: {concept.score}/100</ConceptScore>}
                  {concept.notes && <ConceptNotes>{concept.notes}</ConceptNotes>}
                </ConceptItem>
              ))}
              
              {mathConcepts.length === 0 && (
                <EmptyMessage>No math concepts found</EmptyMessage>
              )}
            </ContentList>
          )}
          
          {activeTab === 'Science' && (
            <ContentList>
              {scienceConcepts.map(concept => (
                <ConceptItem key={concept.conceptId}>
                  <ConceptTitle>{concept.conceptId.replace('science-', 'Science: ')}</ConceptTitle>
                  <ConceptStatus $status={concept.status}>
                    Status: {concept.status}
                  </ConceptStatus>
                  {concept.score && <ConceptScore>Score: {concept.score}/100</ConceptScore>}
                  {concept.notes && <ConceptNotes>{concept.notes}</ConceptNotes>}
                </ConceptItem>
              ))}
              
              {scienceConcepts.length === 0 && (
                <EmptyMessage>No science concepts found</EmptyMessage>
              )}
            </ContentList>
          )}
          
          {activeTab === 'Grammar' && (
            <ContentList>
              {grammarConcepts.map(concept => (
                <ConceptItem key={concept.conceptId}>
                  <ConceptTitle>{concept.conceptId.replace('grammar-', 'Grammar: ')}</ConceptTitle>
                  <ConceptStatus $status={concept.status}>
                    Status: {concept.status}
                  </ConceptStatus>
                  {concept.score && <ConceptScore>Score: {concept.score}/100</ConceptScore>}
                  {concept.notes && <ConceptNotes>{concept.notes}</ConceptNotes>}
                </ConceptItem>
              ))}
              
              {grammarConcepts.length === 0 && (
                <EmptyMessage>No grammar rules found</EmptyMessage>
              )}
            </ContentList>
          )}
        </LearningContent>
      </ModalContent>
    </ModalOverlay>
  );
}

// Styled Components remain the same
// Styled Components (same as before)
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

const ContentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ConceptItem = styled.div`
  padding: 1.5rem;
  border-radius: 8px;
  background: #f9fafb;
  border-left: 4px solid #4f46e5;
`;

const ConceptTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
`;

const ConceptStatus = styled.div<{ $status?: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${({ $status }) => 
    $status === 'completed' ? '#dcfce7' : 
    $status === 'in-progress' ? '#fffbeb' : 
    '#f3f4f6'};
  color: ${({ $status }) => 
    $status === 'completed' ? '#166534' : 
    $status === 'in-progress' ? '#854d0e' : 
    '#4b5563'};
`;

const ConceptScore = styled.div`
  margin-top: 0.5rem;
  font-weight: 500;
  color: #4338ca;
`;

const ConceptNotes = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  color: #4b5563;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  font-style: italic;
`;

const Spinner = styled.div`
  color: white;
  font-size: 1.25rem;
`;

const ModalError = styled.div`
  color: white;
  font-size: 1.25rem;
`;