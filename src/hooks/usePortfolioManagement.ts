// hooks/usePortfolioManagement.tsx - Mock Implementation using Real Types
'use client';

import { useState, useEffect } from 'react';
import { DEV_CONFIG } from '@/config/dev';
import type { 
  Portfolio, 
  PortfolioKind, 
  PortfolioStats, 
  PortfolioSettings, 
  ConceptProgress,
  CreatePortfolioInput 
} from '@/types/portfolio.types';
import type { GalleryPiece } from '@/types/gallery.types';
import { createMockGalleryPieces, createMockPortfolio } from '@/data/mockData';


export function usePortfolioManagement() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [galleryPieces, setGalleryPieces] = useState<GalleryPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
        // Provide comprehensive mock data
        setPortfolio(createMockPortfolio('hybrid'));
        setGalleryPieces(createMockGalleryPieces());
        console.log('[DEV MODE - usePortfolioManagement] Using comprehensive mock data');
      } else {
        // No portfolio in non-dev mode
        setPortfolio(null);
        setGalleryPieces([]);
      }
      setLoading(false);
    }, 800); // Realistic loading time

    return () => clearTimeout(timer);
  }, []);

  const hasPortfolio = !!portfolio;

  // Mock implementation of portfolio operations
  const createPortfolio = async (data: CreatePortfolioInput): Promise<Portfolio> => {
    setIsCreating(true);
    setError(null);
    
    console.log('[DEV MODE] Mock createPortfolio:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newPortfolio = createMockPortfolio(data.kind || 'professional');
    newPortfolio.title = data.title;
    newPortfolio.bio = data.bio || '';
    newPortfolio.visibility = data.visibility || 'public';
    newPortfolio.specializations = data.specializations || [];
    newPortfolio.tags = data.tags || [];
    newPortfolio.location = data.location;
    newPortfolio.tagline = data.tagline;
    
    setPortfolio(newPortfolio);
    setIsCreating(false);
    
    return newPortfolio;
  };

  const updatePortfolio = async (updates: Partial<Portfolio>): Promise<Portfolio> => {
    setIsUpdating(true);
    setError(null);
    
    console.log('[DEV MODE] Mock updatePortfolio:', updates);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (portfolio) {
      const updatedPortfolio = { ...portfolio, ...updates, updatedAt: new Date() };
      setPortfolio(updatedPortfolio);
      setIsUpdating(false);
      return updatedPortfolio;
    }
    
    setIsUpdating(false);
    throw new Error('No portfolio to update');
  };

  const deletePortfolio = async (deleteGalleryPieces: boolean = false): Promise<void> => {
    setIsDeleting(true);
    setError(null);
    
    console.log('[DEV MODE] Mock deletePortfolio, deleteGalleryPieces:', deleteGalleryPieces);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPortfolio(null);
    if (deleteGalleryPieces) {
      setGalleryPieces([]);
    }
    setIsDeleting(false);
  };

  const refreshPortfolio = async (): Promise<void> => {
    console.log('[DEV MODE] Mock refreshPortfolio');
    // In dev mode, just refresh the current data
    if (DEV_CONFIG.ENABLE_AUTH_BYPASS && portfolio) {
      setPortfolio({ ...portfolio, updatedAt: new Date() });
    }
  };

  const refreshGallery = async (): Promise<void> => {
    console.log('[DEV MODE] Mock refreshGallery');
    setGalleryLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (DEV_CONFIG.ENABLE_AUTH_BYPASS) {
      setGalleryPieces(createMockGalleryPieces());
    }
    setGalleryLoading(false);
  };

  return {
    // Portfolio state
    portfolio,
    loading,
    error,
    hasPortfolio,

    // Portfolio operations
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    refreshPortfolio,

    // Mutation states
    isCreating,
    isUpdating,
    isDeleting,

    // Gallery data
    galleryPieces,
    galleryLoading,
    refreshGallery,

    // Mock API object
    api: {
      get: () => Promise.resolve(portfolio),
      create: createPortfolio,
      update: updatePortfolio,
      delete: deletePortfolio
    }
  };
}