// src/app/dashboard/profile/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { User, Mail, Shield, Calendar, Settings, Eye } from 'lucide-react';
import { RatingReview } from '@/components/ratingReview';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PageWrapper = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  color: #fff;
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  background: #fff;
  border-radius: 50%;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #764ba2;
  font-size: 3rem;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  font-size: 2.25rem;
  margin: 0 0 0.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const Role = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.25);
  padding: 0.25rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  text-transform: capitalize;
  margin-bottom: 1rem;
`;

const Email = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  opacity: 0.9;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.75rem;
  h3 {
    color: #2c2c2c;
    margin-bottom: 1rem;
    font-family: 'Work Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  p {
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  color: #2c2c2c;
  margin: 2.5rem 0 1.25rem;
  font-family: 'Work Sans', sans-serif;
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
  animation: ${fadeIn} 0.8s ease-out;
`;

const PortfolioCard = styled.a`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  text-decoration: none;
  color: #2c2c2c;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }
  svg {
    color: #764ba2;
  }
  span {
    font-weight: 500;
  }
`;

const SettingsButton = styled.button`
  background: #fff;
  color: #764ba2;
  border: 2px solid #fff;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: scale(1.02);
  }
`;

export default function ProfilePage() {
  const [stats, setStats] = useState({ visits: 0, averageRating: 0, totalRatings: 0 });
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;
    fetch('/api/user/stats')
      .then(res => res.ok ? res.json() : Promise.reject(res.statusText))
      .then(setStats)
      .catch(console.error);
  }, [loading, isAuthenticated, user]);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const userStats = {
    joinDate: 'January 2024',
  };

  return (
    <PageWrapper>
      <Header>
        <Avatar>{user?.name ? getInitials(user.name) : <User size={60} />}</Avatar>
        <ProfileInfo>
          <Name>{user?.name || 'User Profile'}</Name>
          <Role><Shield size={16} />{user?.role || 'member'}</Role>
          <Email><Mail size={16} />{user?.email || 'user@example.com'}</Email>
        </ProfileInfo>
        <SettingsButton><Settings size={16} />Edit Profile</SettingsButton>
      </Header>

      <Grid>
        <Card>
          <h3><Calendar size={20} />Account Info</h3>
          <p>Member since {userStats.joinDate}</p>
        </Card>

        <Card>
          <h3><Eye size={20} />Visits & Ratings</h3>
          <p>{stats.visits.toLocaleString()} total visits</p>
          <div style={{ marginTop: '0.5rem' }}>
            <RatingReview rating={stats.averageRating} votes={stats.totalRatings} />
          </div>
        </Card>
      </Grid>

      <SectionTitle>Your Portfolio</SectionTitle>
      <PortfolioGrid>
        <PortfolioCard href="/dashboard/gallery">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span>Gallery</span>
        </PortfolioCard>
      </PortfolioGrid>
    </PageWrapper>
  );
}
