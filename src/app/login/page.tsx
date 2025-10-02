// app/login/page.tsx - Enhanced UI/UX Design
'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  TabButton,
  FlexRow,
  FlexColumn,
  Heading1,
  BodyText
} from '@/styles/styled-components';

// API hub (your client)
import api from '@/lib/api-client';

/* ===== Animations ===== */
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

/* ===== Layout Components ===== */
const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-3xl);
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
  }
  
  @media (max-width: 968px) {
    display: none;
  }
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--color-background-primary, #ffffff);
  
  @media (max-width: 968px) {
    flex: none;
    width: 100%;
    min-height: 100vh;
  }
`;

const BrandSection = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-3xl);
  position: relative;
  z-index: 1;
  animation: ${fadeIn} 0.6s ease-out;
`;

const BrandLogo = styled.div`
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const BrandTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 var(--spacing-md);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  font-family: var(--font-body);
`;

const BrandSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
  font-weight: 400;
`;

const FeatureList = styled(FlexColumn)`
  gap: var(--spacing-lg);
  max-width: 420px;
  width: 100%;
  position: relative;
  z-index: 1;
`;

const FeatureItem = styled.div`
  padding: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  animation: ${slideIn} 0.6s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateX(10px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 var(--spacing-xs);
  color: white;
  font-family: var(--font-body);
`;

const FeatureDescription = styled.p`
  font-size: 0.95rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
`;

/* ===== Form Components ===== */
const FormCard = styled(Card)`
  width: 100%;
  max-width: 480px;
  animation: ${fadeIn} 0.5s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border-light, #e5e7eb);
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-2xl);
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-sm);
  font-family: var(--font-body);
`;

const Subtitle = styled(BodyText)`
  color: var(--color-text-secondary);
  font-size: 1rem;
  margin: 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const InputWrapper = styled.div`
  position: relative;
  
  &:focus-within {
    .input-icon {
      color: var(--color-primary-500, #667eea);
    }
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  z-index: 2;
  transition: color 0.2s ease;
  pointer-events: none;
`;

const StyledInput = styled(Input)`
  padding-left: 3rem;
  height: 52px;
  font-size: 1rem;
  transition: all 0.2s ease;
  border: 2px solid var(--color-border-light, #e5e7eb);
  
  &:focus {
    border-color: var(--color-primary-500, #667eea);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
  
  &::placeholder {
    color: var(--color-text-tertiary, #9ca3af);
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  color: var(--color-text-secondary);
  z-index: 2;

  &:hover {
    color: var(--color-primary-500, #667eea);
    background: var(--color-background-tertiary, #f3f4f6);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const StyledTabContainer = styled(TabContainer)`
  background: var(--color-background-secondary, #f9fafb);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xs);
  margin-bottom: var(--spacing-xl);
`;

const StyledTabButton = styled(TabButton)`
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-xl);
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${props => props.$active && `
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  `}
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
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  font-family: var(--font-body);
  margin-top: var(--spacing-xl);
  justify-content: center;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);

  &:hover {
    color: var(--color-primary-500, #667eea);
    background: var(--color-background-secondary, #f9fafb);
  }
`;

/* ===== Overlay Components ===== */
const overlayFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const overlaySlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  padding: var(--spacing-lg);
  animation: ${overlayFadeIn} 0.3s ease-out;
`;

const OverlayCard = styled.div`
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: var(--radius-xl);
  padding: var(--spacing-3xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
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
  margin: 0 0 var(--spacing-md);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary, #0f172a);
`;

const OverlayText = styled.p`
  margin: 0;
  color: var(--color-text-secondary, #64748b);
  font-size: 1.05rem;
  line-height: 1.6;
`;

const OverlayReason = styled.div`
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-background-secondary, #f8fafc);
  border-radius: var(--radius-md);
  border-left: 4px solid #f59e0b;
`;

const OverlayReasonText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #64748b);
  font-family: monospace;
`;

const OverlayActions = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
`;

const LoadingSpinner = styled(Loader2)`
  animation: ${spin} 1s linear infinite;
`;

/* ===== Main Component ===== */
export default function LoginPage() {
  const router = useRouter();
  const { login, signup, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Backend availability states
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

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Check backend health on mount
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
      <LeftPanel>
        <BrandSection>
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

      {/* Enhanced Overlay for Unavailable Login */}
      {loginAvailable !== true && (
        <Overlay role="alertdialog" aria-modal="true" aria-label="Login unavailable">
          <OverlayCard>
            <OverlayIconWrapper>
              {checking ? (
                <LoadingSpinner size={28} />
              ) : (
                <AlertCircle size={28} />
              )}
            </OverlayIconWrapper>

            <OverlayContent>
              <OverlayTitle>
                {checking ? 'Checking Server Status' : 'Service Temporarily Unavailable'}
              </OverlayTitle>

              <OverlayText>
                {checking ? (
                  'Please wait while we verify the connection to our servers...'
                ) : (
                  <>
                    We're experiencing technical difficulties with our authentication service. 
                    Our team has been notified and is working to resolve this issue.
                  </>
                )}
              </OverlayText>

              {!checking && offlineReason && (
                <OverlayReason>
                  <OverlayReasonText>
                    Error: {offlineReason}
                  </OverlayReasonText>
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
                title="Retry connecting to API"
                style={{ flex: 1 }}
              >
                {checking ? (
                  <>
                    <LoadingSpinner size={16} />
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Try Again
                  </>
                )}
              </BaseButton>
            </OverlayActions>
          </OverlayCard>
        </Overlay>
      )}
    </AuthPageWrapper>
  );
}