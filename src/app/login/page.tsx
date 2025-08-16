// app/login/page.tsx - Refactored to use central styled-components hub
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styled from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { Eye, EyeOff, Loader2, AlertCircle, ChevronLeft, User, Mail, Lock } from 'lucide-react';
import { useDarkMode } from '@/providers/darkModeProvider';

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

// Only create custom components that are specific to login page
const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-3xl);
  border-right: 1px solid var(--color-border-light);
  
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
  
  @media (max-width: 968px) {
    flex: none;
    width: 100%;
    min-height: 100vh;
  }
`;

const BrandSection = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-3xl);
`;

const FeatureList = styled(FlexColumn)`
  gap: var(--spacing-xl);
  max-width: 400px;
`;

const FeatureItem = styled(Card)`
  padding: var(--spacing-lg);
  background: var(--color-background-tertiary);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary-500);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  color: var(--color-text-primary);
  font-family: var(--font-body);
`;

const FeatureDescription = styled(BodyText)`
  font-size: 0.9rem;
  margin: 0;
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: var(--spacing-xl);
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
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
  gap: var(--spacing-lg);
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: var(--spacing-lg);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-secondary);
  z-index: 2;
`;

const StyledInput = styled(Input)`
  padding-left: 3rem;
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
    color: var(--color-text-primary);
    background: var(--color-background-tertiary);
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-family: var(--font-body);
  margin-top: var(--spacing-xl);
  justify-content: center;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-text-primary);
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const { login, signup, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'register') {
        // Validation
        if (!formData.username || !formData.name || !formData.email || !formData.password) {
          throw new Error('Please fill in all fields');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        // Register as regular user only - no admin option
        await signup({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'user' // Always register as regular user
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
          <Heading1 $responsive={false} style={{ fontSize: '3rem', marginBottom: 'var(--spacing-lg)' }}>
            Welcome
          </Heading1>
          <BodyText $size="lg" style={{ marginBottom: 'var(--spacing-xl)' }}>
            Join our community of creators, educators, and professionals
          </BodyText>
        </BrandSection>
        
        <FeatureList>
          <FeatureItem>
            <FeatureIcon><User size={20} /></FeatureIcon>
            <FeatureText>
              <FeatureTitle>Create Your Portfolio</FeatureTitle>
              <FeatureDescription>Showcase your work and build your professional presence</FeatureDescription>
            </FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon><Mail size={20} /></FeatureIcon>
            <FeatureText>
              <FeatureTitle>Develop Your Skills</FeatureTitle>
              <FeatureDescription>Access professional development challenges and learning resources</FeatureDescription>
            </FeatureText>
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon><User size={20} /></FeatureIcon>
            <FeatureText>
              <FeatureTitle>Connect & Collaborate</FeatureTitle>
              <FeatureDescription>Network with like-minded professionals and learn from experts</FeatureDescription>
            </FeatureText>
          </FeatureItem>
        </FeatureList>
      </LeftPanel>

      <RightPanel>
        <Card $padding="lg" style={{ width: '100%', maxWidth: '420px' }}>
          <CardHeader>
            <Title>{activeTab === 'login' ? 'Welcome Back' : 'Create Account'}</Title>
            <Subtitle>
              {activeTab === 'login' 
                ? 'Sign in to access your dashboard' 
                : 'Join our professional community'
              }
            </Subtitle>
          </CardHeader>
          
          <TabContainer>
            <TabButton 
              $active={activeTab === 'login'} 
              onClick={() => setActiveTab('login')}
              type="button"
            >
              Sign In
            </TabButton>
            <TabButton 
              $active={activeTab === 'register'} 
              onClick={() => setActiveTab('register')}
              type="button"
            >
              Sign Up
            </TabButton>
          </TabContainer>

          <Form onSubmit={handleSubmit}>
            {activeTab === 'register' && (
              <>
                <FormGroup>
                  <Label htmlFor="username">Username</Label>
                  <InputWrapper>
                    <InputIcon><User size={18} /></InputIcon>
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
                    <InputIcon><User size={18} /></InputIcon>
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
                <InputIcon><Mail size={18} /></InputIcon>
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
                <InputIcon><Lock size={18} /></InputIcon>
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
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </PasswordToggle>
              </InputWrapper>
            </FormGroup>

            {activeTab === 'register' && (
              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <InputWrapper>
                  <InputIcon><Lock size={18} /></InputIcon>
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

            <BaseButton 
              $variant="primary" 
              $fullWidth 
              $size="lg"
              type="submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {activeTab === 'login' ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                activeTab === 'login' ? 'Sign In' : 'Create Account'
              )}
            </BaseButton>
          </Form>

          <BackLink href="/">
            <ChevronLeft size={16} />
            Back to Home
          </BackLink>
        </Card>
      </RightPanel>
    </AuthPageWrapper>
  );
}