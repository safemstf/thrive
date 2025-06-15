'use client';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/providers/authProvider';
import { User, Mail, Shield, Calendar, Settings, Eye, Star } from 'lucide-react';
import { RatingReview } from '@/components/ratingReview';

const PageWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  background: #2c2c2c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: 600;
  flex-shrink: 0;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  font-size: 2rem;
  color: #2c2c2c;
  margin: 0 0 0.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const Role = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #f3f4f6;
  padding: 0.25rem 1rem;
  border-radius: 999px;
  color: #666;
  font-size: 0.875rem;
  text-transform: capitalize;
  margin-bottom: 1rem;
`;

const Email = styled.p`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  margin: 0;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
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
  font-size: 1.5rem;
  color: #2c2c2c;
  margin: 2rem 0 1rem;
  font-family: 'Work Sans', sans-serif;
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const PortfolioCard = styled.a`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  text-decoration: none;
  color: #2c2c2c;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  svg {
    color: #666;
  }
  span {
    font-weight: 500;
  }
`;

const SettingsButton = styled.button`
  background: #2c2c2c;
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 8px;
  font-family: 'Work Sans', sans-serif;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

export default function ProfilePage() {
  const [stats, setStats] = useState({ visits: 0, averageRating: 0, totalRatings: 0 });

  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (loading || !isAuthenticated || !user) return;

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/user/stats');
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    };

    fetchStats();
  }, [loading, isAuthenticated, user]);


  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const userStats = {
    joinDate: 'January 2024',
    totalProjects: 12,
    totalGalleryItems: 24,
    completedCourses: 5
  };

  return (
    <PageWrapper>
      <Header>
        <Avatar>
          {user?.name ? getInitials(user.name) : <User size={60} />}
        </Avatar>
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
          <p style={{ marginTop: '0.5rem' }}>Account type: {user?.role === 'admin' ? 'Administrator' : 'Standard User'}</p>
        </Card>

        <Card>
          <h3>Activity Summary</h3>
          <p>{userStats.totalProjects} projects created</p>
          <p>{userStats.totalGalleryItems} gallery items</p>
          <p>{userStats.completedCourses} courses completed</p>
        </Card>

        <Card>
          <h3><Eye size={20} />Visits & Ratings</h3>
           <p>{stats.visits.toLocaleString()} total visits</p>
           <div style={{ marginTop: '0.5rem' }}>
             <RatingReview
               rating={stats.averageRating}
               votes={stats.totalRatings}
             />
           </div>
        </Card>
      </Grid>

      <SectionTitle>Your Portfolio</SectionTitle>
      <PortfolioGrid>
        <PortfolioCard href="/dashboard/gallery">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span>Gallery</span>
        </PortfolioCard>

        <PortfolioCard href="/dashboard/projects">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
          </svg>
          <span>CS Projects</span>
        </PortfolioCard>

        <PortfolioCard href="/dashboard/writing">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Curriculum</span>
        </PortfolioCard>

        <PortfolioCard href="/dashboard/tutoring">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
          <span>Tutoring</span>
        </PortfolioCard>
      </PortfolioGrid>
    </PageWrapper>
  );
}