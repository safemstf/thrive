// src/app/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import Link from 'next/link';
import { useAuth } from '@/providers/authProvider';
import { Eye, EyeOff, Loader2, AlertCircle, Shield, ChevronLeft } from 'lucide-react';

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f8f8;
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 2rem;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${props => props.$active ? '#2c2c2c' : '#e5e7eb'};
  background: ${props => props.$active ? '#2c2c2c' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#2c2c2c'};
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$active ? '#1a1a1a' : '#f8f8f8'};
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
  font-size: 0.875rem;
  font-weight: 500;
  color: #4b5563;
  font-family: 'Work Sans', sans-serif;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2c2c2c;
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
  padding: 0.25rem;

  &:hover {
    color: #2c2c2c;
  }
`;

const AdminCheckbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f3f4f6;
  border-radius: 8px;
  margin-bottom: 1rem;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #4b5563;
    font-family: 'Work Sans', sans-serif;
    user-select: none;

    svg {
      color: #dc2626;
    }
  }
`;

const SubmitButton = styled.button`
  padding: 0.875rem;
  background: #2c2c2c;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #1a1a1a;
  }

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;

  svg {
    flex-shrink: 0;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  color: #16a34a;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  font-family: 'Work Sans', sans-serif;
  margin-top: 1.5rem;
  justify-content: center;

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
  const [isAdmin, setIsAdmin] = useState(false);
  
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

        // Pass role along with other credentials
        await signup({
          username: formData.username,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: isAdmin ? 'admin' : 'user'
        });

        setSuccess('Registration successful! Logging you in...');
        
        // Auto-login after registration
        setTimeout(async () => {
          await login(formData.email, formData.password);
          router.push('/dashboard');
        }, 1000);
      } else {
        // Login
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
      <LoginCard>
        <Title>{activeTab === 'login' ? 'Welcome Back' : 'Create Account'}</Title>
        
        <TabContainer>
          <TabButton 
            $active={activeTab === 'login'} 
            onClick={() => setActiveTab('login')}
            type="button"
          >
            Login
          </TabButton>
          <TabButton 
            $active={activeTab === 'register'} 
            onClick={() => setActiveTab('register')}
            type="button"
          >
            Register
          </TabButton>
        </TabContainer>

        <Form onSubmit={handleSubmit}>
          {activeTab === 'register' && (
            <>
              <FormGroup>
                <Label htmlFor="username">Username</Label>
                <InputWrapper>
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
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputWrapper>
          </FormGroup>

          {activeTab === 'register' && (
            <>
              <FormGroup>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <InputWrapper>
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

              <AdminCheckbox>
                <input
                  type="checkbox"
                  id="adminRole"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <label htmlFor="adminRole">
                  <Shield size={16} />
                  Register as Administrator
                </label>
              </AdminCheckbox>
            </>
          )}

          {error && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {error}
            </ErrorMessage>
          )}

          {success && (
            <SuccessMessage>
              {success}
            </SuccessMessage>
          )}

          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {activeTab === 'login' ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              activeTab === 'login' ? 'Login' : 'Create Account'
            )}
          </SubmitButton>
        </Form>

        <BackLink href="/">
          <ChevronLeft size={16} />
          Back to Home
        </BackLink>
      </LoginCard>
    </PageWrapper>
  );
}