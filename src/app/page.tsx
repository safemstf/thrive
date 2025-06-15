// app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Grid3X3, User, Image, FolderOpen, BookOpen, GraduationCap } from 'lucide-react';

// Mock data for portfolios - replace with API call
const mockPortfolios = [
  {
    id: '1',
    username: 'alex_designer',
    name: 'Alex Chen',
    avatar: null,
    portfolioItems: {
      gallery: 24,
      projects: 8,
      curriculum: 5,
      tutoring: true
    },
    featuredImage: '/api/placeholder/400/400',
    bio: 'Digital artist & creative developer'
  },
  {
    id: '2', 
    username: 'sarah_dev',
    name: 'Sarah Miller',
    avatar: null,
    portfolioItems: {
      gallery: 12,
      projects: 15,
      curriculum: 0,
      tutoring: false
    },
    featuredImage: '/api/placeholder/400/400',
    bio: 'Full-stack developer | Open source enthusiast'
  },
  {
    id: '3',
    username: 'mike_teach',
    name: 'Michael Johnson',
    avatar: null,
    portfolioItems: {
      gallery: 5,
      projects: 3,
      curriculum: 12,
      tutoring: true
    },
    featuredImage: '/api/placeholder/400/400',
    bio: 'Mathematics educator & tutor'
  },
  // Add more mock data as needed
];

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #fafafa;
`;

const Header = styled.header`
  background: white;
  border-bottom: 1px solid #e0e0e0;
  padding: 2rem 0;
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  color: #2c2c2c;
  margin: 0 0 0.5rem;
  letter-spacing: 1px;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  font-family: 'Work Sans', sans-serif;
  margin: 0 0 2rem;
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #2c2c2c;
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  width: 20px;
  height: 20px;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 4rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ViewAllLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;

  &:hover {
    color: #2c2c2c;
  }
`;

const PortfolioGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
`;

const PortfolioCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const FeaturedImageContainer = styled.div`
  position: relative;
  height: 200px;
  background: #f0f0f0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PortfolioOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s;

  ${PortfolioCard}:hover & {
    opacity: 1;
  }
`;

const CardContent = styled.div`
  padding: 1.5rem;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #2c2c2c;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
`;

const UserDetails = styled.div`
  flex: 1;
`;

const Username = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0;
`;

const Name = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;
`;

const Bio = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0 0 1rem;
  line-height: 1.4;
`;

const PortfolioStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const CTASection = styled.section`
  text-align: center;
  padding: 4rem 0;
  background: white;
  border-top: 1px solid #e0e0e0;
`;

const CTATitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 1rem;
  font-family: 'Work Sans', sans-serif;
`;

const CTADescription = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0 0 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: #2c2c2c;
  color: white;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-family: 'Work Sans', sans-serif;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #1a1a1a;
  }
`;

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolios, setPortfolios] = useState(mockPortfolios);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handlePortfolioClick = (username: string) => {
    router.push(`/u/${username}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  return (
    <PageWrapper>
      <Header>
        <Title>Explore Creative Portfolios</Title>
        <Subtitle>Discover talented creators and their work</Subtitle>
        
        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Search portfolios by name, skill, or interest..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </SearchContainer>
      </Header>

      <MainContent>
        <SectionHeader>
          <SectionTitle>
            <Grid3X3 size={24} />
            Featured Portfolios
          </SectionTitle>
          <ViewAllLink href="/explore">View all</ViewAllLink>
        </SectionHeader>

        <PortfolioGrid>
          {portfolios.map((portfolio) => (
            <PortfolioCard 
              key={portfolio.id}
              onClick={() => handlePortfolioClick(portfolio.username)}
            >
              <FeaturedImageContainer>
                <img src={portfolio.featuredImage} alt={portfolio.name} />
                <PortfolioOverlay />
              </FeaturedImageContainer>
              
              <CardContent>
                <UserInfo>
                  <Avatar>
                    {portfolio.avatar ? (
                      <img src={portfolio.avatar} alt={portfolio.name} />
                    ) : (
                      getInitials(portfolio.name)
                    )}
                  </Avatar>
                  <UserDetails>
                    <Username>@{portfolio.username}</Username>
                    <Name>{portfolio.name}</Name>
                  </UserDetails>
                </UserInfo>

                <Bio>{portfolio.bio}</Bio>

                <PortfolioStats>
                  {portfolio.portfolioItems.gallery > 0 && (
                    <StatItem>
                      <Image />
                      {portfolio.portfolioItems.gallery} gallery items
                    </StatItem>
                  )}
                  {portfolio.portfolioItems.projects > 0 && (
                    <StatItem>
                      <FolderOpen />
                      {portfolio.portfolioItems.projects} projects
                    </StatItem>
                  )}
                  {portfolio.portfolioItems.curriculum > 0 && (
                    <StatItem>
                      <BookOpen />
                      {portfolio.portfolioItems.curriculum} courses
                    </StatItem>
                  )}
                  {portfolio.portfolioItems.tutoring && (
                    <StatItem>
                      <GraduationCap />
                      Offers tutoring
                    </StatItem>
                  )}
                </PortfolioStats>
              </CardContent>
            </PortfolioCard>
          ))}
        </PortfolioGrid>
      </MainContent>

      <CTASection>
        <CTATitle>Ready to Share Your Work?</CTATitle>
        <CTADescription>
          Create your own portfolio and join our community of creators, educators, and innovators.
        </CTADescription>
        <CTAButton href="/signup">Get Started</CTAButton>
      </CTASection>
    </PageWrapper>
  );
}