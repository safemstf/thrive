// app/login/page.tsx - Enhanced UI/UX with Scroll Effects
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { Eye, EyeOff, Loader2, AlertCircle, ChevronLeft, User, Mail, Lock, RefreshCw, Sparkles, Zap, Shield } from 'lucide-react';

// Import everything from the central hub!
import {
  AuthPageWrapper,
  Card,
  BaseButton,
  Input,
  FormGroup,
  Label,
  MessageContainer,
  TabContainer,
  TabButton
} from '@/styles/styled-components';

// API hub
import api from '@/lib/api-client';

/* ===== Animations ===== */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

/* ===== Layout Components with Scroll Effects ===== */
const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  
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
    will-change: transform;
  }
  
  @media (max-width: 968px) { display: none; }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #ffffff;
  
  @media (max-width: 968px) {
    flex: none;
    width: 100%;
    min-height: 100vh;
  }
`;

const BrandSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.6s ease-out;
  will-change: transform;
`;

const BrandLogo = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  svg {
    animation: ${float} 3s ease-in-out infinite;
  }
  
  &:hover {
    transform: scale(1.05) rotate(5deg);
  }
`;

const BrandTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 1rem;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  will-change: transform;
`;

const BrandSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 420px;
  width: 100%;
  position: relative;
  z-index: 1;
`;

const FeatureItem = styled.div`
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: ${slideIn} 0.6s ease-out;
  animation-fill-mode: both;
  will-change: transform;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(10px) scale(1.02);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2);
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  
  ${FeatureItem}:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: white;
`;

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
`;

const FloatingCircle = styled.div<{ $delay: number; $size: number; $top: string; $left: string }>`
  position: absolute;
  width: ${p => p.$size}px;
  height: ${p => p.$size}px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent);
  top: ${p => p.$top};
  left: ${p => p.$left};
  animation: ${float} ${p => 3 + p.$delay}s ease-in-out infinite;
  animation-delay: ${p => p.$delay}s;
  pointer-events: none;
  z-index: 0;
`;

/* ===== Form Components ===== */
const FormCard = styled(Card)`
  width: 100%;
  max-width: 480px;
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  will-change: transform, box-shadow;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 25px 70px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    left: -50%;
    width: 200%;
    height: 2px;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(102, 126, 234, 0.5),
      transparent
    );
    animation: ${shimmer} 3s infinite;
  }
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 0.75rem;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1rem;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputWrapper = styled.div`
  position: relative;
  
  &:focus-within {
    .input-icon {
      color: #667eea;
      transform: translateY(-50%) scale(1.1);
    }
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  z-index: 2;
  transition: all 0.2s ease;
  pointer-events: none;
`;

const StyledInput = styled(Input)`
  padding-left: 3rem;
  height: 52px;
  font-size: 1rem;
  transition: all 0.2s ease;
  border: 2px solid #e5e7eb;
  
  &:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #64748b;
  z-index: 2;

  &:hover {
    color: #667eea;
    background: #f3f4f6;
    transform: translateY(-50%) scale(1.1);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const StyledTabContainer = styled(TabContainer)`
  background: #f9fafb;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 2rem;
  position: relative;
`;

const StyledTabButton = styled(TabButton)`
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  
  ${props => props.$active && `
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    color: #667eea;
  `}
  
  &:hover {
    transform: scale(1.02);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const SubmitButton = styled(BaseButton)`
  height: 52px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
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
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  text-decoration: none;
  font-size: 0.95rem;
  margin-top: 1.5rem;
  justify-content: center;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem;
  border-radius: 8px;

  &:hover {
    color: #667eea;
    background: #f9fafb;
    transform: translateX(-4px);
  }
`;

/* ===== Overlay Components ===== */
const overlayFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const overlaySlideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
  animation: ${overlayFadeIn} 0.3s ease-out;
`;

const OverlayCard = styled.div`
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${overlaySlideUp} 0.4s ease-out;
`;

const OverlayIconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 8px 16px rgba(251, 191, 36, 0.3);
  
  svg {
    color: #f59e0b;
    animation: ${pulse} 2s ease-in-out infinite;
  }
`;

const OverlayContent = styled.div`
  text-align: center;
`;

const OverlayTitle = styled.h3`
  margin: 0 0 1rem;
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
`;

const OverlayText = styled.p`
  margin: 0;
  color: #64748b;
  font-size: 1.05rem;
  line-height: 1.6;
`;

const OverlayReason = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
`;

const OverlayReasonText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #64748b;
  font-family: monospace;
`;

const OverlayActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const LoadingSpinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

/* ===== Scroll Hook ===== */
function useScrollEffect() {
  const [scrollY, setScrollY] = useState(0);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return scrollY;
}

/* ===== Main Component ===== */
export default function LoginPage() {
  const router = useRouter();
  const { login, signup, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const scrollY = useScrollEffect();
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  const [loginAvailable, setLoginAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [offlineReason, setOfflineReason] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Apply parallax effects
  useEffect(() => {
    if (leftPanelRef.current) {
      const offset = scrollY * 0.5;
      const bgPattern = leftPanelRef.current.querySelector('::before') as any;
      leftPanelRef.current.style.transform = `translateY(${offset * 0.1}px)`;
    }
    
    if (brandRef.current) {
      const offset = scrollY * 0.3;
      brandRef.current.style.transform = `translateY(${offset}px)`;
    }
  }, [scrollY]);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const checkConnection = useCallback(async () => {
    setChecking(true);
    setOfflineReason(null);
    try {
      const res = await api.health.testConnection();
      if (res && (res as any).connected) {
        setLoginAvailable(true);
      } else {
        setLoginAvailable(false);
        setOfflineReason((res as any).error || 'Server unreachable');
      }
    } catch (err: any) {
      setLoginAvailable(false);
      setOfflineReason(err?.message || 'Network error occurred');
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginAvailable !== true) {
      setError('Login is currently unavailable. Please try again later.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'register') {
        if (!formData.username || !formData.name || !formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        await signup({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'user'
        });

        setSuccess('Registration successful! Logging you in...');
        
        setTimeout(async () => {
          await login(formData.email, formData.password);
          router.push('/dashboard');
        }, 1000);
      } else {
        await login(formData.email, formData.password);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageWrapper $variant="login">
      <LeftPanel ref={leftPanelRef}>
        <FloatingCircle $delay={0} $size={120} $top="10%" $left="15%" />
        <FloatingCircle $delay={1} $size={80} $top="70%" $left="80%" />
        <FloatingCircle $delay={0.5} $size={100} $top="40%" $left="85%" />
        
        <BrandSection ref={brandRef}>
          <BrandLogo>
            <Sparkles size={40} color="white" />
          </BrandLogo>
          <BrandTitle>Welcome</BrandTitle>
          <BrandSubtitle>
            Join our community of creators and professionals
          </BrandSubtitle>
        </BrandSection>
        
        <FeatureList>
          <FeatureItem>
            <FeatureIcon><Zap size={22} /></FeatureIcon>
            <FeatureText>
              <FeatureTitle>Create Your Portfolio</FeatureTitle>
              <FeatureDescription>
                Showcase your work and build your professional presence with ease
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon><Shield size={22} /></FeatureIcon>
            <FeatureText>
              <FeatureTitle>Secure & Private</FeatureTitle>
              <FeatureDescription>
                Your data is protected with enterprise-grade security measures
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon><Sparkles size={22} /></FeatureIcon>
            <FeatureText>
              <FeatureTitle>Connect & Collaborate</FeatureTitle>
              <FeatureDescription>
                Network with like-minded professionals and grow together
              </FeatureDescription>
            </FeatureText>
          </FeatureItem>
        </FeatureList>
      </LeftPanel>

      <RightPanel>
        <FormCard $padding="lg">
          <CardHeader>
            <Title>{activeTab === 'login' ? 'Welcome Back' : 'Create Account'}</Title>
            <Subtitle>
              {activeTab === 'login' 
                ? 'Sign in to access your dashboard' 
                : 'Join our professional community'
              }
            </Subtitle>
          </CardHeader>
          
          <StyledTabContainer>
            <StyledTabButton 
              $active={activeTab === 'login'} 
              onClick={() => setActiveTab('login')}
              type="button"
            >
              Sign In
            </StyledTabButton>
            <StyledTabButton 
              $active={activeTab === 'register'} 
              onClick={() => setActiveTab('register')}
              type="button"
            >
              Sign Up
            </StyledTabButton>
          </StyledTabContainer>

          <Form onSubmit={handleSubmit}>
            {activeTab === 'register' && (
              <>
                <FormGroup>
                  <Label htmlFor="username">Username</Label>
                  <InputWrapper>
                    <InputIcon className="input-icon"><User size={18} /></InputIcon>
                    <StyledInput
                      id="username"
                      name="username"
                      type="text"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="name">Full Name</Label>
                  <InputWrapper>
                    <InputIcon className="input-icon"><User size={18} /></InputIcon>
                    <StyledInput
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </InputWrapper>
                </FormGroup>
              </>
            )}

            <FormGroup>
              <Label htmlFor="email">Email Address</Label>
              <InputWrapper>
                <InputIcon className="input-icon"><Mail size={18} /></InputIcon>
                <StyledInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </InputWrapper>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <InputWrapper>
                <InputIcon className="input-icon"><Lock size={18} /></InputIcon>
                <StyledInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <PasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </PasswordToggle>
              </InputWrapper>
            </FormGroup>

            {activeTab === 'register' && (
              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <InputWrapper>
                  <InputIcon className="input-icon"><Lock size={18} /></InputIcon>
                  <StyledInput
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </InputWrapper>
              </FormGroup>
            )}

            {error && (
              <MessageContainer $type="error">
                <AlertCircle size={16} />
                {error}
              </MessageContainer>
            )}

            {success && (
              <MessageContainer $type="success">
                <AlertCircle size={16} />
                {success}
              </MessageContainer>
            )}

            <SubmitButton 
              $variant="primary" 
              $fullWidth 
              $size="lg"
              type="submit" 
              disabled={loading || loginAvailable !== true}
            >
              {loading ? (
                <>
                  <LoadingSpinner size={18} />
                  {activeTab === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                activeTab === 'login' ? 'Sign In' : 'Create Account'
              )}
            </SubmitButton>
          </Form>

          <BackLink href="/">
            <ChevronLeft size={16} />
            Back to Home
          </BackLink>
        </FormCard>
      </RightPanel>

      {loginAvailable !== true && (
        <Overlay role="alertdialog" aria-modal="true">
          <OverlayCard>
            <OverlayIconWrapper>
              {checking ? <LoadingSpinner size={28} /> : <AlertCircle size={28} />}
            </OverlayIconWrapper>

            <OverlayContent>
              <OverlayTitle>
                {checking ? 'Checking Server Status' : 'Service Temporarily Unavailable'}
              </OverlayTitle>
              <OverlayText>
                {checking ? (
                  'Please wait while we verify the connection...'
                ) : (
                  "We're experiencing technical difficulties. Our team is working to resolve this."
                )}
              </OverlayText>
              {!checking && offlineReason && (
                <OverlayReason>
                  <OverlayReasonText>Error: {offlineReason}</OverlayReasonText>
                </OverlayReason>
              )}
            </OverlayContent>

            <OverlayActions>
              <BaseButton
                $variant="secondary"
                $size="md"
                onClick={() => router.push('/')}
                style={{ flex: 1 }}
              >
                Back to Home
              </BaseButton>
              <BaseButton
                $variant="primary"
                $size="md"
                onClick={checkConnection}
                disabled={checking}
                style={{ flex: 1 }}
              >
                {checking ? <><LoadingSpinner size={16} /> Checking...</> : <><RefreshCw size={16} /> Try Again</>}
              </BaseButton>
            </OverlayActions>
          </OverlayCard>
        </Overlay>
      )}
    </AuthPageWrapper>
  );
}