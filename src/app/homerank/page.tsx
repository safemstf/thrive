'use client';
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  MapPin, DollarSign, Bed, Bath, Maximize, 
  Filter, Search, Star, TrendingUp, Home,
  X, ChevronDown, SlidersHorizontal, Navigation,
  Sparkles, Target, BarChart3, Zap, ZoomIn, ZoomOut,
  Calendar, TrendingDown, Info, ExternalLink, Heart, Loader2
} from 'lucide-react';
import { loadPropertyData, Property, PriceHistory } from './propertyLoader';

/* ---------- GOLDEN RATIO + ANIMATIONS ---------- */
const PHI = 1.618033988749;
const GOLDEN_SPACING = {
  xs: `${0.618}rem`,
  sm: `${1}rem`,
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
  xl: `${4.236}rem`,
  xxl: `${6.854}rem`,
};

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.9; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const scaleIn = keyframes`
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
`;

const modalFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const modalSlideUp = keyframes`
  from { opacity: 0; transform: translateY(40px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

/* ---------- LAYOUT ---------- */
const Page = styled.main`
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  position: relative;
  overflow-x: hidden;
`;

const BackgroundPattern = styled.div`
  position: fixed;
  inset: 0;
  background-image: 
    radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
  z-index: 0;
`;

const FloatingOrb = styled.div<{ $delay: number; $size: number; $top: string; $left: string; $color: string }>`
  position: fixed;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border-radius: 50%;
  background: radial-gradient(circle, ${p => p.$color}40, transparent);
  top: ${p => p.$top};
  left: ${p => p.$left};
  animation: ${float} ${p => 4 + p.$delay}s ease-in-out infinite;
  animation-delay: ${p => p.$delay}s;
  pointer-events: none;
  z-index: 0;
  filter: blur(40px);
`;

const Hero = styled.header`
  width: 100%;
  background: linear-gradient(135deg, rgba(30,41,59,0.97), rgba(59,130,246,0.93));
  padding: ${GOLDEN_SPACING.xl} ${GOLDEN_SPACING.md};
  color: white;
  position: relative;
  overflow: hidden;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    opacity: 0.3;
    animation: ${rotate} 60s linear infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
    animation: ${shimmer} 3s infinite;
  }
`;

const HeroInner = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${GOLDEN_SPACING.md};
  position: relative;
  z-index: 1;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const HeroIconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255,255,255,0.2);
  transition: all 0.3s ease;
  
  svg {
    animation: ${float} 3s ease-in-out infinite;
  }
  
  &:hover {
    transform: scale(1.05) rotate(5deg);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }
`;

const HeroText = styled.div`
  max-width: 800px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 800;
  line-height: 1.1;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
  
  span {
    background: linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
  }
`;

const HeroSubtitle = styled.p`
  margin: ${GOLDEN_SPACING.sm} auto 0;
  font-size: clamp(1rem, 2vw, 1.15rem);
  opacity: 0.95;
  line-height: 1.6;
  max-width: 600px;
`;

const HeroStats = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.xl};
  margin-top: ${GOLDEN_SPACING.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const HeroStat = styled.div`
  text-align: center;
  animation: ${slideInLeft} 0.6s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
`;

const HeroStatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  line-height: 1;
`;

const HeroStatLabel = styled.div`
  font-size: 0.85rem;
  opacity: 0.85;
  margin-top: 0.25rem;
`;

const Container = styled.div`
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: ${GOLDEN_SPACING.lg} ${GOLDEN_SPACING.md};
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: ${GOLDEN_SPACING.lg};
  position: relative;
  z-index: 1;
  
  @media (max-width: 1200px) {
    grid-template-columns: 300px 1fr;
    gap: ${GOLDEN_SPACING.md};
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

/* ---------- LOADING STATE ---------- */
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: ${GOLDEN_SPACING.md};
  animation: ${fadeInUp} 0.5s ease-out;
`;

const LoadingSpinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
  color: #667eea;
`;

const LoadingText = styled.div`
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 600;
`;

const ErrorContainer = styled.div`
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 2px solid #ef4444;
  border-radius: 16px;
  padding: ${GOLDEN_SPACING.lg};
  color: #991b1b;
  font-weight: 600;
  text-align: center;
  animation: ${scaleIn} 0.4s ease-out;
`;

/* ---------- SIDEBAR (FILTERS) ---------- */
const Sidebar = styled.aside`
  background: white;
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: ${GOLDEN_SPACING.lg};
  border: 1px solid rgba(2,6,23,0.06);
  height: fit-content;
  position: sticky;
  top: ${GOLDEN_SPACING.md};
  animation: ${slideInLeft} 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
  
  @media (max-width: 1024px) {
    position: relative;
    top: 0;
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.sm};
  margin-bottom: ${GOLDEN_SPACING.lg};
  padding-bottom: ${GOLDEN_SPACING.md};
  border-bottom: 2px solid rgba(2,6,23,0.06);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }
`;

const SidebarIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea15, #764ba215);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  flex-shrink: 0;
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  flex: 1;
`;

const FilterGroup = styled.div`
  margin-bottom: ${GOLDEN_SPACING.md};
  animation: ${fadeInUp} 0.4s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(2) { animation-delay: 0.05s; }
  &:nth-child(3) { animation-delay: 0.1s; }
  &:nth-child(4) { animation-delay: 0.15s; }
  &:nth-child(5) { animation-delay: 0.2s; }
  &:nth-child(6) { animation-delay: 0.25s; }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  margin-bottom: ${GOLDEN_SPACING.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem ${GOLDEN_SPACING.sm};
  border: 2px solid rgba(2,6,23,0.08);
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  color: #0f172a;
  transition: all 0.2s ease;
  box-sizing: border-box;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem ${GOLDEN_SPACING.sm};
  border: 2px solid rgba(2,6,23,0.08);
  border-radius: 10px;
  font-size: 0.95rem;
  background: white;
  color: #0f172a;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
`;

const RangeGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${GOLDEN_SPACING.sm};
`;

const ApplyButton = styled.button`
  width: 100%;
  padding: ${GOLDEN_SPACING.sm} ${GOLDEN_SPACING.md};
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: ${GOLDEN_SPACING.md};
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  &:hover::before {
    width: 300px;
    height: 300px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.35);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ClearButton = styled.button`
  width: 100%;
  padding: 0.65rem ${GOLDEN_SPACING.sm};
  background: transparent;
  color: #64748b;
  border: 2px solid rgba(2,6,23,0.08);
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: ${GOLDEN_SPACING.xs};
  
  &:hover {
    border-color: #ef4444;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.05);
    transform: translateY(-1px);
  }
`;

/* ---------- MAIN CONTENT ---------- */
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${GOLDEN_SPACING.lg};
`;

/* ---------- INTERACTIVE MAP ---------- */
const MapContainer = styled.div`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(2,6,23,0.06);
  height: 550px;
  position: relative;
  animation: ${scaleIn} 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.12);
  }
`;

const MapCanvas = styled.div<{ $isDragging?: boolean }>`
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 50%, #e0e7ff 100%);
  overflow: hidden;
  cursor: ${p => p.$isDragging ? 'grabbing' : 'grab'};
  user-select: none;
`;

const MapContent = styled.div<{ $zoom: number; $offsetX: number; $offsetY: number }>`
  position: absolute;
  inset: 0;
  transform: scale(${p => p.$zoom}) translate(${p => p.$offsetX}px, ${p => p.$offsetY}px);
  transform-origin: center;
  transition: transform 0.1s ease-out;
  will-change: transform;
`;

const MapGrid = styled.div`
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.6;
`;

const MapControls = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: ${GOLDEN_SPACING.xs};
  z-index: 20;
`;

const MapControlButton = styled.button`
  width: 44px;
  height: 44px;
  background: white;
  border: 1px solid rgba(2,6,23,0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #475569;
  
  &:hover {
    background: #667eea;
    color: white;
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const MapDecoration = styled.div`
  position: absolute;
  pointer-events: none;
  transition: opacity 0.3s ease;
`;

const Street = styled(MapDecoration)`
  background: rgba(203, 213, 225, 0.6);
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const Park = styled(MapDecoration)`
  background: rgba(134, 239, 172, 0.25);
  border: 2px solid rgba(134, 239, 172, 0.5);
  border-radius: 12px;
  backdrop-filter: blur(4px);
`;

const Building = styled(MapDecoration)`
  background: rgba(148, 163, 184, 0.2);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 4px;
`;

const MapLegend = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  padding: ${GOLDEN_SPACING.md};
  border-radius: 12px;
  font-size: 0.85rem;
  color: #475569;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
  border: 1px solid rgba(2,6,23,0.06);
  animation: ${slideInLeft} 0.5s ease-out;
`;

const LegendTitle = styled.div`
  font-weight: 700;
  color: #0f172a;
  margin-bottom: ${GOLDEN_SPACING.sm};
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.xs};
  font-size: 0.95rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.sm};
  margin-bottom: ${GOLDEN_SPACING.xs};
  transition: all 0.2s ease;
  padding: 0.25rem;
  border-radius: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
    transform: translateX(4px);
  }
`;

const LegendDot = styled.div<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: ${p => p.$color};
  box-shadow: 0 2px 6px ${p => p.$color}40;
  flex-shrink: 0;
`;

const PropertyMarker = styled.div<{ $x: number; $y: number; $status: string; $active: boolean }>`
  position: absolute;
  left: ${p => p.$x}%;
  top: ${p => p.$y}%;
  transform: translate(-50%, -100%);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: ${p => p.$active ? 100 : 1};
  animation: ${p => p.$active ? pulse : 'none'} 1.5s ease infinite;
  
  &:hover {
    z-index: 101;
    transform: translate(-50%, -100%) scale(1.15);
  }
`;

const MarkerPin = styled.div<{ $status: string }>`
  position: relative;
  width: 36px;
  height: 36px;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2));
  
  &::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 14px solid ${p => {
      if (p.$status === 'active') return '#10b981';
      if (p.$status === 'pending') return '#f59e0b';
      return '#64748b';
    }};
  }
`;

const MarkerDot = styled.div<{ $status: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${p => {
    if (p.$status === 'active') return 'linear-gradient(135deg, #10b981, #059669)';
    if (p.$status === 'pending') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #64748b, #475569)';
  }};
  border: 3px solid white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.3s ease;
  
  ${PropertyMarker}:hover & {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
  }
`;

const MarkerPopup = styled.div`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  background: white;
  border-radius: 12px;
  padding: ${GOLDEN_SPACING.md};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  min-width: 240px;
  white-space: nowrap;
  pointer-events: none;
  animation: ${scaleIn} 0.2s ease-out;
  border: 1px solid rgba(2,6,23,0.06);
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid white;
  }
`;

const PopupPrice = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.4rem;
`;

const PopupAddress = styled.div`
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: ${GOLDEN_SPACING.sm};
  font-weight: 500;
`;

const PopupFeatures = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.sm};
  font-size: 0.85rem;
  color: #475569;
  padding-top: ${GOLDEN_SPACING.xs};
  border-top: 1px solid rgba(2,6,23,0.06);
  font-weight: 500;
`;

/* ---------- MODAL ---------- */
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
  animation: ${modalFadeIn} 0.3s ease-out;
  overflow-y: auto;
`;

const Modal = styled.div`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  animation: ${modalSlideUp} 0.4s ease-out;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: ${GOLDEN_SPACING.lg};
  border-bottom: 1px solid rgba(2,6,23,0.06);
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 20px 20px 0 0;
`;

const ModalClose = styled.button`
  position: absolute;
  top: ${GOLDEN_SPACING.md};
  right: ${GOLDEN_SPACING.md};
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #ef4444;
    color: white;
    transform: scale(1.05);
  }
`;

const ModalImageContainer = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: ${GOLDEN_SPACING.md};
`;

const ModalImage = styled.div<{ $url: string }>`
  width: 100%;
  height: 100%;
  background: url(${p => p.$url}) center/cover;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 1.8rem;
  font-weight: 800;
  color: #0f172a;
`;

const ModalPrice = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #667eea;
  margin-top: ${GOLDEN_SPACING.xs};
`;

const ModalBody = styled.div`
  padding: ${GOLDEN_SPACING.lg};
`;

const Section = styled.div`
  margin-bottom: ${GOLDEN_SPACING.xl};
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 ${GOLDEN_SPACING.md} 0;
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.sm};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${GOLDEN_SPACING.md};
`;

const DetailCard = styled.div`
  padding: ${GOLDEN_SPACING.md};
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid rgba(2,6,23,0.06);
`;

const DetailLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${GOLDEN_SPACING.xs};
`;

const DetailValue = styled.div`
  font-size: 1.3rem;
  font-weight: 700;
  color: #0f172a;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  background: #f8fafc;
  border-radius: 12px;
  padding: ${GOLDEN_SPACING.md};
  position: relative;
  border: 1px solid rgba(2,6,23,0.06);
`;

const ChartSVG = styled.svg`
  width: 100%;
  height: 100%;
`;

const ChartLegend = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.md};
  margin-top: ${GOLDEN_SPACING.md};
  justify-content: center;
  flex-wrap: wrap;
`;

const ChartLegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.xs};
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
`;

const ChartLegendDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${p => p.$color};
`;

const ProjectionCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${GOLDEN_SPACING.md};
  margin-top: ${GOLDEN_SPACING.md};
`;

const ProjectionCard = styled.div<{ $trend: 'up' | 'down' | 'stable' }>`
  padding: ${GOLDEN_SPACING.md};
  background: ${p => {
    if (p.$trend === 'up') return 'linear-gradient(135deg, #10b98110, #05966910)';
    if (p.$trend === 'down') return 'linear-gradient(135deg, #ef444410, #dc262610)';
    return 'linear-gradient(135deg, #64748b10, #47556910)';
  }};
  border-radius: 12px;
  border: 1px solid ${p => {
    if (p.$trend === 'up') return '#10b98130';
    if (p.$trend === 'down') return '#ef444430';
    return '#64748b30';
  }};
`;

const ProjectionYear = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: ${GOLDEN_SPACING.xs};
`;

const ProjectionPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: ${GOLDEN_SPACING.xs};
`;

const ProjectionChange = styled.div<{ $positive: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${p => p.$positive ? '#10b981' : '#ef4444'};
  display: flex;
  align-items: center;
  gap: 0.3rem;
`;

/* ---------- STATS ---------- */
const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: ${GOLDEN_SPACING.md};
  animation: ${slideInRight} 0.5s ease-out;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 14px;
  padding: ${GOLDEN_SPACING.md};
  border: 1px solid rgba(2,6,23,0.06);
  display: flex;
  align-items: center;
  gap: ${GOLDEN_SPACING.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.5s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
    border-color: rgba(102, 126, 234, 0.2);
  }
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: ${p => p.$color}12;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$color};
  flex-shrink: 0;
  transition: all 0.3s ease;
  
  ${StatCard}:hover & {
    transform: scale(1.1) rotate(5deg);
    box-shadow: 0 4px 12px ${p => p.$color}25;
  }
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.35rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
`;

/* ---------- LISTINGS ---------- */
const ListingsSection = styled.div`
  animation: ${fadeInUp} 0.6s ease-out 0.3s;
  animation-fill-mode: both;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${GOLDEN_SPACING.lg};
  padding-bottom: ${GOLDEN_SPACING.md};
  border-bottom: 2px solid rgba(2,6,23,0.06);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 2px;
    background: linear-gradient(90deg, #667eea, #764ba2);
    border-radius: 2px;
  }
`;

const SectionTitleMain = styled.h2`
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: #0f172a;
`;

const ResultCount = styled.span`
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 600;
  padding: 0.5rem ${GOLDEN_SPACING.sm};
  background: rgba(102, 126, 234, 0.08);
  border-radius: 8px;
`;

const PropertyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${GOLDEN_SPACING.lg};
`;

const PropertyCard = styled.div<{ $active?: boolean }>`
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid ${p => p.$active ? '#667eea' : 'rgba(2,6,23,0.06)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: ${p => p.$active 
    ? '0 16px 40px rgba(102, 126, 234, 0.25)' 
    : '0 4px 12px rgba(0, 0, 0, 0.04)'
  };
  animation: ${scaleIn} 0.4s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.05s; }
  &:nth-child(3) { animation-delay: 0.1s; }
  &:nth-child(4) { animation-delay: 0.15s; }
  &:nth-child(5) { animation-delay: 0.2s; }
  &:nth-child(6) { animation-delay: 0.25s; }
  
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12);
    border-color: ${p => p.$active ? '#667eea' : 'rgba(102, 126, 234, 0.3)'};
  }
`;

const PropertyImage = styled.div<{ $url: string }>`
  width: 100%;
  height: 220px;
  background: url(${p => p.$url}) center/cover;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.05));
    pointer-events: none;
  }
  
  ${PropertyCard}:hover & {
    &::before {
      background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.1));
    }
  }
`;

const PropertyBadge = styled.div<{ $status: string }>`
  position: absolute;
  top: 14px;
  right: 14px;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${p => {
    if (p.$status === 'active') return 'linear-gradient(135deg, #10b981, #059669)';
    if (p.$status === 'pending') return 'linear-gradient(135deg, #f59e0b, #d97706)';
    return 'linear-gradient(135deg, #64748b, #475569)';
  }};
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  animation: ${scaleIn} 0.3s ease-out 0.2s;
  animation-fill-mode: both;
`;

const PropertyInfo = styled.div`
  padding: ${GOLDEN_SPACING.lg};
`;

const PropertyPrice = styled.div`
  font-size: 1.7rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: ${GOLDEN_SPACING.xs};
  line-height: 1;
`;

const PropertyAddress = styled.div`
  font-size: 1rem;
  color: #475569;
  margin-bottom: ${GOLDEN_SPACING.md};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 500;
  
  svg {
    flex-shrink: 0;
    color: #667eea;
  }
`;

const PropertyFeatures = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.md};
  padding-top: ${GOLDEN_SPACING.md};
  border-top: 1px solid rgba(2,6,23,0.06);
`;

const Feature = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 600;
  
  svg {
    color: #667eea;
    flex-shrink: 0;
  }
`;

const PropertyActions = styled.div`
  display: flex;
  gap: ${GOLDEN_SPACING.sm};
  padding: 0 ${GOLDEN_SPACING.lg} ${GOLDEN_SPACING.lg};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 0.65rem ${GOLDEN_SPACING.sm};
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  ${p => p.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: transparent;
    color: #667eea;
    border: 2px solid rgba(102, 126, 234, 0.2);
    
    &:hover {
      background: rgba(102, 126, 234, 0.05);
      border-color: #667eea;
    }
  `}
`;

/* ---------- COMPONENT ---------- */
export default function HomeRankPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProperty, setActiveProperty] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    minSqft: '',
    status: 'all'
  });

  // Map interaction state
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // Load property data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await loadPropertyData(500); // Load 500 properties
        setProperties(data);
      } catch (err) {
        console.error('Failed to load property data:', err);
        setError('Failed to load property data. Please check that the CSV file is in the public/data directory.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProperties = properties.filter(prop => {
    if (filters.minPrice && prop.price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && prop.price > Number(filters.maxPrice)) return false;
    if (filters.bedrooms && prop.bedrooms < Number(filters.bedrooms)) return false;
    if (filters.bathrooms && prop.bathrooms < Number(filters.bathrooms)) return false;
    if (filters.minSqft && prop.sqft < Number(filters.minSqft)) return false;
    if (filters.status !== 'all' && prop.status !== filters.status) return false;
    return true;
  });

  const avgPrice = filteredProperties.length > 0
    ? Math.round(filteredProperties.reduce((sum, p) => sum + p.price, 0) / filteredProperties.length)
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      minSqft: '',
      status: 'all'
    });
  };

  // Convert lat/lng to x/y percentages for map display
  const latLngToPercent = (lat: number, lng: number) => {
    // Find min/max bounds from all properties
    const lats = properties.map(p => p.lat);
    const lngs = properties.map(p => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 100;
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) };
  };

  // Map interaction handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // Price projection chart component
  const PriceChart = ({ property }: { property: Property }) => {
    const width = 800;
    const height = 250;
    const padding = 40;
    
    const prices = property.priceHistory.map(h => h.price);
    const minPrice = Math.min(...prices) * 0.9;
    const maxPrice = Math.max(...prices) * 1.1;
    
    const xScale = (index: number) => {
      return padding + (index / (property.priceHistory.length - 1)) * (width - 2 * padding);
    };
    
    const yScale = (price: number) => {
      return height - padding - ((price - minPrice) / (maxPrice - minPrice)) * (height - 2 * padding);
    };
    
    const currentIndex = property.priceHistory.findIndex(h => h.type === 'current');
    
    return (
      <ChartContainer>
        <ChartSVG viewBox={`0 0 ${width} ${height}`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + ratio * (height - 2 * padding)}
              x2={width - padding}
              y2={padding + ratio * (height - 2 * padding)}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Historical line */}
          <path
            d={property.priceHistory.slice(0, currentIndex + 1).map((h, i) => {
              const x = xScale(i);
              const y = yScale(h.price);
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#667eea"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Projected line */}
          <path
            d={property.priceHistory.slice(currentIndex).map((h, i) => {
              const x = xScale(currentIndex + i);
              const y = yScale(h.price);
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray="8,4"
            strokeLinecap="round"
          />
          
          {/* Data points */}
          {property.priceHistory.map((h, i) => (
            <g key={i}>
              <circle
                cx={xScale(i)}
                cy={yScale(h.price)}
                r="5"
                fill={h.type === 'projected' ? '#10b981' : '#667eea'}
                stroke="white"
                strokeWidth="2"
              />
              {i % 2 === 0 && (
                <text
                  x={xScale(i)}
                  y={height - 10}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#64748b"
                >
                  {h.date}
                </text>
              )}
            </g>
          ))}
          
          {/* Current price marker */}
          <line
            x1={xScale(currentIndex)}
            y1={padding}
            x2={xScale(currentIndex)}
            y2={height - padding}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4,4"
          />
        </ChartSVG>
        
        <ChartLegend>
          <ChartLegendItem>
            <ChartLegendDot $color="#667eea" />
            Historical Price
          </ChartLegendItem>
          <ChartLegendItem>
            <ChartLegendDot $color="#10b981" />
            Projected Price
          </ChartLegendItem>
          <ChartLegendItem>
            <ChartLegendDot $color="#f59e0b" />
            Current Value
          </ChartLegendItem>
        </ChartLegend>
      </ChartContainer>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <Page>
        <BackgroundPattern />
        <FloatingOrb $delay={0} $size={300} $top="10%" $left="5%" $color="#667eea" />
        <FloatingOrb $delay={2} $size={250} $top="60%" $left="80%" $color="#f472b6" />
        
        <Hero>
          <HeroInner>
            <HeroIconWrapper>
              <Home size={40} />
            </HeroIconWrapper>
            <HeroText>
              <HeroTitle>
                Home <span>Rank</span>
              </HeroTitle>
              <HeroSubtitle>
                Smart property analysis powered by data-driven insights for buyers and realtors
              </HeroSubtitle>
            </HeroText>
          </HeroInner>
        </Hero>

        <LoadingContainer>
          <LoadingSpinner size={48} />
          <LoadingText>Loading property data...</LoadingText>
        </LoadingContainer>
      </Page>
    );
  }

  // Show error state
  if (error) {
    return (
      <Page>
        <BackgroundPattern />
        <Hero>
          <HeroInner>
            <HeroIconWrapper>
              <Home size={40} />
            </HeroIconWrapper>
            <HeroText>
              <HeroTitle>
                Home <span>Rank</span>
              </HeroTitle>
            </HeroText>
          </HeroInner>
        </Hero>

        <Container style={{ gridTemplateColumns: '1fr' }}>
          <ErrorContainer>{error}</ErrorContainer>
        </Container>
      </Page>
    );
  }

  return (
    <Page>
      <BackgroundPattern />
      <FloatingOrb $delay={0} $size={300} $top="10%" $left="5%" $color="#667eea" />
      <FloatingOrb $delay={2} $size={250} $top="60%" $left="80%" $color="#f472b6" />
      <FloatingOrb $delay={1} $size={200} $top="40%" $left="90%" $color="#60a5fa" />
      
      <Hero>
        <HeroInner>
          <HeroIconWrapper>
            <Home size={40} />
          </HeroIconWrapper>
          <HeroText>
            <HeroTitle>
              Home <span>Rank</span>
            </HeroTitle>
            <HeroSubtitle>
              Smart property analysis powered by data-driven insights for buyers and realtors
            </HeroSubtitle>
            <HeroStats>
              <HeroStat>
                <HeroStatValue>{properties.length}+</HeroStatValue>
                <HeroStatLabel>Properties</HeroStatLabel>
              </HeroStat>
              <HeroStat>
                <HeroStatValue>{formatPrice(avgPrice)}</HeroStatValue>
                <HeroStatLabel>Avg Value</HeroStatLabel>
              </HeroStat>
              <HeroStat>
                <HeroStatValue>95%</HeroStatValue>
                <HeroStatLabel>Satisfaction</HeroStatLabel>
              </HeroStat>
            </HeroStats>
          </HeroText>
        </HeroInner>
      </Hero>

      <Container>
        <Sidebar>
          <SidebarHeader>
            <SidebarIconWrapper>
              <SlidersHorizontal size={20} />
            </SidebarIconWrapper>
            <SidebarTitle>Filters</SidebarTitle>
          </SidebarHeader>

          <FilterGroup>
            <FilterLabel>Price Range</FilterLabel>
            <RangeGroup>
              <Input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
              />
            </RangeGroup>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Bedrooms</FilterLabel>
            <Select
              value={filters.bedrooms}
              onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Bathrooms</FilterLabel>
            <Select
              value={filters.bathrooms}
              onChange={(e) => setFilters({...filters, bathrooms: e.target.value})}
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Min Square Feet</FilterLabel>
            <Input
              type="number"
              placeholder="e.g., 1500"
              value={filters.minSqft}
              onChange={(e) => setFilters({...filters, minSqft: e.target.value})}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Status</FilterLabel>
            <Select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </Select>
          </FilterGroup>

          <ApplyButton>Apply Filters</ApplyButton>
          <ClearButton onClick={clearFilters}>Clear All</ClearButton>
        </Sidebar>

        <MainContent>
          <MapContainer>
            <MapCanvas
              ref={mapRef}
              $isDragging={isDragging}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <MapContent $zoom={zoom} $offsetX={offset.x} $offsetY={offset.y}>
                <MapGrid />
                
                {/* Decorative streets */}
                <Street style={{ left: '20%', top: 0, width: '3px', height: '100%' }} />
                <Street style={{ left: '40%', top: 0, width: '3px', height: '100%' }} />
                <Street style={{ left: '60%', top: 0, width: '3px', height: '100%' }} />
                <Street style={{ left: '80%', top: 0, width: '3px', height: '100%' }} />
                <Street style={{ left: 0, top: '30%', width: '100%', height: '3px' }} />
                <Street style={{ left: 0, top: '60%', width: '100%', height: '3px' }} />
                
                {/* Decorative park */}
                <Park style={{ left: '62%', top: '18%', width: '28%', height: '35%' }} />
                
                {/* Small buildings */}
                <Building style={{ left: '10%', top: '15%', width: '8%', height: '10%' }} />
                <Building style={{ left: '45%', top: '40%', width: '10%', height: '12%' }} />
                <Building style={{ left: '15%', top: '70%', width: '12%', height: '15%' }} />

                {/* Property Markers */}
                {filteredProperties.map((property) => {
                  const { x, y } = latLngToPercent(property.lat, property.lng);
                  const isActive = activeProperty === property.id;
                  
                  return (
                    <PropertyMarker
                      key={property.id}
                      $x={x}
                      $y={y}
                      $status={property.status}
                      $active={isActive}
                      onMouseEnter={() => setActiveProperty(property.id)}
                      onMouseLeave={() => setActiveProperty(null)}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProperty(property);
                      }}
                    >
                      {isActive && (
                        <MarkerPopup>
                          <PopupPrice>{formatPrice(property.price)}</PopupPrice>
                          <PopupAddress>{property.address}</PopupAddress>
                          <PopupFeatures>
                            <span>{property.bedrooms} bd</span>
                            <span>•</span>
                            <span>{property.bathrooms} ba</span>
                            <span>•</span>
                            <span>{property.sqft.toLocaleString()} sf</span>
                          </PopupFeatures>
                        </MarkerPopup>
                      )}
                      
                      <MarkerPin $status={property.status}>
                        <MarkerDot $status={property.status}>
                          <Home size={14} />
                        </MarkerDot>
                      </MarkerPin>
                    </PropertyMarker>
                  );
                })}
              </MapContent>

              <MapLegend>
                <LegendTitle>
                  <Navigation size={18} />
                  Property Map
                </LegendTitle>
                <LegendItem>
                  <LegendDot $color="#10b981" />
                  Active Listings
                </LegendItem>
                <LegendItem>
                  <LegendDot $color="#f59e0b" />
                  Pending Sales
                </LegendItem>
                <LegendItem>
                  <LegendDot $color="#64748b" />
                  Recently Sold
                </LegendItem>
              </MapLegend>

              <MapControls>
                <MapControlButton onClick={handleZoomIn}>
                  <ZoomIn size={20} />
                </MapControlButton>
                <MapControlButton onClick={handleZoomOut}>
                  <ZoomOut size={20} />
                </MapControlButton>
              </MapControls>
            </MapCanvas>
          </MapContainer>

          <StatsBar>
            <StatCard>
              <StatIcon $color="#667eea">
                <Target size={28} />
              </StatIcon>
              <StatContent>
                <StatLabel>Total Properties</StatLabel>
                <StatValue>{filteredProperties.length}</StatValue>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon $color="#10b981">
                <DollarSign size={28} />
              </StatIcon>
              <StatContent>
                <StatLabel>Average Price</StatLabel>
                <StatValue>{formatPrice(avgPrice)}</StatValue>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIcon $color="#f59e0b">
                <BarChart3 size={28} />
              </StatIcon>
              <StatContent>
                <StatLabel>Average Score</StatLabel>
                <StatValue>
                  {filteredProperties.length > 0
                    ? (filteredProperties.reduce((sum, p) => sum + (p.score || 0), 0) / filteredProperties.length).toFixed(1)
                    : '0.0'
                  }
                </StatValue>
              </StatContent>
            </StatCard>
          </StatsBar>

          <ListingsSection>
            <SectionHeader>
              <SectionTitleMain>Available Properties</SectionTitleMain>
              <ResultCount>{filteredProperties.length} results</ResultCount>
            </SectionHeader>

            <PropertyGrid>
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  id={`property-${property.id}`}
                  $active={activeProperty === property.id}
                  onMouseEnter={() => setActiveProperty(property.id)}
                  onMouseLeave={() => setActiveProperty(null)}
                >
                  <PropertyImage $url={property.imageUrl}>
                    <PropertyBadge $status={property.status}>
                      {property.status}
                    </PropertyBadge>
                  </PropertyImage>

                  <PropertyInfo>
                    <PropertyPrice>{formatPrice(property.price)}</PropertyPrice>
                    <PropertyAddress>
                      <MapPin size={16} />
                      {property.address}, {property.city}, {property.state}
                    </PropertyAddress>

                    <PropertyFeatures>
                      <Feature>
                        <Bed size={18} />
                        {property.bedrooms} bd
                      </Feature>
                      <Feature>
                        <Bath size={18} />
                        {property.bathrooms} ba
                      </Feature>
                      <Feature>
                        <Maximize size={18} />
                        {property.sqft.toLocaleString()} sqft
                      </Feature>
                    </PropertyFeatures>
                  </PropertyInfo>
                  
                  <PropertyActions>
                    <ActionButton 
                      $variant="primary"
                      onClick={() => setSelectedProperty(property)}
                    >
                      <Info size={16} />
                      View Details
                    </ActionButton>
                    <ActionButton $variant="secondary">
                      <Heart size={16} />
                      Save
                    </ActionButton>
                  </PropertyActions>
                </PropertyCard>
              ))}
            </PropertyGrid>
          </ListingsSection>
        </MainContent>
      </Container>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <ModalOverlay onClick={() => setSelectedProperty(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalClose onClick={() => setSelectedProperty(null)}>
              <X size={20} />
            </ModalClose>
            
            <ModalHeader>
              <ModalImageContainer>
                <ModalImage $url={selectedProperty.imageUrl} />
              </ModalImageContainer>
              <ModalTitle>{selectedProperty.address}</ModalTitle>
              <ModalPrice>{formatPrice(selectedProperty.price)}</ModalPrice>
            </ModalHeader>

            <ModalBody>
              <Section>
                <SectionTitle>
                  <Home size={20} />
                  Property Details
                </SectionTitle>
                <DetailGrid>
                  <DetailCard>
                    <DetailLabel>Bedrooms</DetailLabel>
                    <DetailValue>{selectedProperty.bedrooms}</DetailValue>
                  </DetailCard>
                  <DetailCard>
                    <DetailLabel>Bathrooms</DetailLabel>
                    <DetailValue>{selectedProperty.bathrooms}</DetailValue>
                  </DetailCard>
                  <DetailCard>
                    <DetailLabel>Square Feet</DetailLabel>
                    <DetailValue>{selectedProperty.sqft.toLocaleString()}</DetailValue>
                  </DetailCard>
                  <DetailCard>
                    <DetailLabel>Year Built</DetailLabel>
                    <DetailValue>{selectedProperty.yearBuilt}</DetailValue>
                  </DetailCard>
                  <DetailCard>
                    <DetailLabel>Lot Size</DetailLabel>
                    <DetailValue>{selectedProperty.lotSize?.toLocaleString()} sqft</DetailValue>
                  </DetailCard>
                  <DetailCard>
                    <DetailLabel>Status</DetailLabel>
                    <DetailValue style={{ textTransform: 'capitalize' }}>{selectedProperty.status}</DetailValue>
                  </DetailCard>
                </DetailGrid>
              </Section>

              <Section>
                <SectionTitle>
                  <TrendingUp size={20} />
                  Price Projection Analysis
                </SectionTitle>
                <PriceChart property={selectedProperty} />
                
                <ProjectionCards>
                  {[1, 3, 5].map(years => {
                    const futurePrice = selectedProperty.price * Math.pow(1 + selectedProperty.appreciation, years);
                    const change = ((futurePrice - selectedProperty.price) / selectedProperty.price) * 100;
                    
                    return (
                      <ProjectionCard key={years} $trend="up">
                        <ProjectionYear>{years} Year{years > 1 ? 's' : ''}</ProjectionYear>
                        <ProjectionPrice>{formatPrice(Math.round(futurePrice))}</ProjectionPrice>
                        <ProjectionChange $positive={true}>
                          <TrendingUp size={16} />
                          +{change.toFixed(1)}%
                        </ProjectionChange>
                      </ProjectionCard>
                    );
                  })}
                </ProjectionCards>
              </Section>

              <Section>
                <SectionTitle>
                  <Info size={20} />
                  Investment Insights
                </SectionTitle>
                <DetailGrid>
                  <DetailCard>
                    <DetailLabel>Annual Appreciation</DetailLabel>
                    <DetailValue>{(selectedProperty.appreciation * 100).toFixed(1)}%</DetailValue>
                  </DetailCard>
                  <DetailCard>
                    <DetailLabel>Market Trend</DetailLabel>
                    <DetailValue style={{ textTransform: 'capitalize', color: selectedProperty.marketTrend === 'up' ? '#10b981' : '#64748b' }}>
                      {selectedProperty.marketTrend}
                    </DetailValue>
                  </DetailCard>
                  <DetailCard>
                    <DetailLabel>HomeRank Score</DetailLabel>
                    <DetailValue>{selectedProperty.score}/10</DetailValue>
                  </DetailCard>
                </DetailGrid>
              </Section>
            </ModalBody>
          </Modal>
        </ModalOverlay>
      )}
    </Page>
  );
}