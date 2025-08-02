'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';
import { useAuth } from '@/providers/authProvider';
import { Eye, EyeOff, Loader2, AlertCircle, ChevronLeft, User, Mail, Lock } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  background: #fafafa;
  font-family: 'Work Sans', sans-serif;
`;

const LeftPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  background: white;
  border-right: 1px solid #f0f0f0;
  
  @media (max-width: 968px) {
    display: none;
  }
`;

const BrandSection = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const BrandTitle = styled.h1`
  font-size: 3rem;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  margin-bottom: 1rem;
  color: #2c2c2c;
  letter-spacing: 1px;
`;

const BrandSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.5;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 400px;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
`;

const FeatureIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #2c2c2c;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const FeatureText = styled.div`
  flex: 1;
`;

const FeatureTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #2c2c2c;
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin: 0;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  
  @media (max-width: 968px) {
    flex: none;
    width: 100%;
    min-height: 100vh;
    background: white;
  }
`;

const LoginCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 100%;
  max-width: 420px;
  border: 1px solid #f0f0f0;
  
  @media (max-width: 968px) {
    box-shadow: none;
    border: none;
  }
`;

const CardHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #2c2c2c;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 1rem;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.25rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#2c2c2c' : '#666'};
  border-radius: 6px;
  font-family: 'Work Sans', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${props => props.$active ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background: ${props => props.$active ? 'white' : '#f0f0f0'};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
  font-family: 'Work Sans', sans-serif;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.2s ease;
  background: white;

  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 0 0 3px rgba(44, 44, 44, 0.1);
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
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: #2c2c2c;
    background: #f3f4f6;
  }
`;

const SubmitButton = styled.button`
  padding: 1rem 2rem;
  background: #2c2c2c;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    background: #1a1a1a;
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
    transform: none;
  }
`;

const MessageContainer = styled.div<{ $type: 'error' | 'success' }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;
  
  ${({ $type }) => $type === 'error' 
    ? `
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
    `
    : `
      background: #f0fdf4;
      color: #16a34a;
      border: 1px solid #bbf7d0;
    `
  }

  svg {
    flex-shrink: 0;
  }
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  margin-top: 1.5rem;
  justify-content: center;
  font-weight: 500;

  &:hover {
    color: #2c2c2c;
  }
`;

export default function LoginPage() {
  const router = useRouter();
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
    <PageWrapper>
      <LeftPanel>
        <BrandSection>
          <BrandTitle>Welcome</BrandTitle>
          <BrandSubtitle>
            Join our community of creators, educators, and professionals
          </BrandSubtitle>
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
        <LoginCard>
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
                    <Input
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
                    <Input
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
                <Input
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
                <Input
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
                  <Input
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

            <SubmitButton type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
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
        </LoginCard>
      </RightPanel>
    </PageWrapper>
  );
}