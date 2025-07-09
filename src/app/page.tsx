// app/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Grid3X3, 
  User, 
  Image, 
  FolderOpen, 
  BookOpen, 
  GraduationCap, 
  Loader2, 
  AlertCircle,
  Construction,
  Rocket,
  Users,
  Star,
  ArrowRight,
  Wifi,
  WifiOff
} from 'lucide-react';
import { api } from '@/lib/api-client';

// Types based on your API client
interface Portfolio {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatar?: string;
  featuredImage?: string;
  galleryCount?: number;
  projectCount?: number;
  curriculumCount?: number;
  offersTutoring?: boolean;
}

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

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  font-family: 'Work Sans', sans-serif;
  margin: 0 0 2rem;

  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 0 1rem;
  }
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  padding: 0 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e0e0e0;
  border-radius: 999px;
  font-size: 1rem;
  font-family: 'Work Sans', sans-serif;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  &:focus {
    outline: none;
    border-color: #2c2c2c;
    box-shadow: 0 4px 12px rgba(44, 44, 44, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 2rem;
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
  gap: 1rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c2c2c;
  font-family: 'Work Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ViewAllLink = styled(Link)`
  color: #666;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-family: 'Work Sans', sans-serif;

  &:hover {
    color: #2c2c2c;
    transform: translateX(2px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  gap: 0.5rem;
  color: #666;
  font-family: 'Work Sans', sans-serif;
`;

const StateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
  margin: 2rem 0;
`;

const StateIcon = styled.div<{ $type: 'error' | 'empty' | 'development' }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => 
    props.$type === 'error' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
    props.$type === 'development' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;

  svg {
    width: 40px;
    height: 40px;
  }
`;

const StateTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c2c2c;
  margin: 0 0 0.5rem;
  font-family: 'Work Sans', sans-serif;
`;

const StateDescription = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0 0 2rem;
  line-height: 1.6;
  max-width: 500px;
  font-family: 'Work Sans', sans-serif;
`;

const StateButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  background: ${props => props.$variant === 'secondary' ? 'none' : '#2c2c2c'};
  border: 1px solid #2c2c2c;
  color: ${props => props.$variant === 'secondary' ? '#2c2c2c' : 'white'};
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-family: 'Work Sans', sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-weight: 300;
  margin: 0 0.5rem;

  &:hover {
    background: ${props => props.$variant === 'secondary' ? '#2c2c2c' : '#1a1a1a'};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(44, 44, 44, 0.2);
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  text-align: center;
  padding: 1rem;
  
  svg {
    width: 48px;
    height: 48px;
    margin-bottom: 0.5rem;
    opacity: 0.7;
  }
  
  span {
    font-size: 0.875rem;
    opacity: 0.8;
    font-weight: 500;
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
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
  transition: all 0.2s ease;
  
  &:hover {
    background: #1a1a1a;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(44, 44, 44, 0.2);
  }
`;

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApiError, setIsApiError] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const generateGradient = (id: string) => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
    ];
    const hash = id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsApiError(false);
      
      // Try to fetch featured portfolios first, fall back to discover
      let portfolioData: any;
      try {
        portfolioData = await api.portfolio.getFeatured(6);
      } catch (featuredError) {
        console.log('Featured portfolios endpoint not available, trying discover...');
        try {
          const discoverResult: any = await api.portfolio.discover({}, 1, 6);
          portfolioData = discoverResult;
        } catch (discoverError) {
          console.log('Discover endpoint also not available:', discoverError);
          throw discoverError;
        }
      }
      
      // Handle different response formats
      let portfolioArray: Portfolio[] = [];
      
      if (Array.isArray(portfolioData)) {
        portfolioArray = portfolioData;
      } else if (portfolioData && typeof portfolioData === 'object') {
        portfolioArray = portfolioData.portfolios || 
                        portfolioData.data || 
                        portfolioData.items || 
                        portfolioData.results || 
                        [];
      }
      
      setPortfolios(portfolioArray);
    } catch (err: any) {
      console.error('Failed to fetch portfolios:', err);
      
      // Check if it's an API connectivity error
      if (err.message?.includes('Cannot GET') || err.message?.includes('404') || err.message?.includes('fetch')) {
        setIsApiError(true);
        setError('Portfolio service is currently in development. Check back soon!');
      } else {
        setError('Failed to load portfolios. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const handlePortfolioClick = (username: string) => {
    router.push(`/u/${username}`);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const results: any = await api.portfolio.search(searchQuery, 12);
      
      let portfolioArray: Portfolio[] = [];
      
      if (Array.isArray(results)) {
        portfolioArray = results;
      } else if (results && typeof results === 'object') {
        portfolioArray = results.portfolios || 
                        results.data || 
                        results.items || 
                        results.results || 
                        [];
      }
      
      setPortfolios(portfolioArray);
    } catch (err: any) {
      console.error('Search failed:', err);
      if (err.message?.includes('Cannot GET') || err.message?.includes('404')) {
        setError('Search is currently unavailable. Service in development.');
      } else {
        setError('Search failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderPortfolioImage = (portfolio: Portfolio) => {
    if (portfolio.featuredImage) {
      return <img src={portfolio.featuredImage} alt={portfolio.name} />;
    }
    
    return (
      <PlaceholderContent style={{ background: generateGradient(portfolio.id) }}>
        <User />
        <span>{portfolio.name}</span>
      </PlaceholderContent>
    );
  };

  const renderPortfolioStats = (portfolio: Portfolio) => {
    const stats = [];
    
    if (portfolio.galleryCount && portfolio.galleryCount > 0) {
      stats.push(
        <StatItem key="gallery">
          <Image />
          {portfolio.galleryCount} gallery items
        </StatItem>
      );
    }
    
    if (portfolio.projectCount && portfolio.projectCount > 0) {
      stats.push(
        <StatItem key="projects">
          <FolderOpen />
          {portfolio.projectCount} projects
        </StatItem>
      );
    }
    
    if (portfolio.curriculumCount && portfolio.curriculumCount > 0) {
      stats.push(
        <StatItem key="curriculum">
          <BookOpen />
          {portfolio.curriculumCount} courses
        </StatItem>
      );
    }
    
    if (portfolio.offersTutoring) {
      stats.push(
        <StatItem key="tutoring">
          <GraduationCap />
          Offers tutoring
        </StatItem>
      );
    }
    
    if (stats.length === 0) {
      stats.push(
        <StatItem key="new">
          <User />
          New portfolio
        </StatItem>
      );
    }
    
    return stats;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <Loader2 className="animate-spin" size={20} />
          Loading portfolios...
        </LoadingContainer>
      );
    }

    if (error) {
      if (isApiError) {
        return (
          <StateContainer>
            <StateIcon $type="development">
              <Construction />
            </StateIcon>
            <StateTitle>Service in Development</StateTitle>
            <StateDescription>
              We're building something amazing! The portfolio feature is currently under development. 
              Our team is working hard to bring you the best experience.
            </StateDescription>
            <div>
              <StateButton onClick={fetchPortfolios}>
                Check Again
              </StateButton>
              <StateButton $variant="secondary" onClick={() => window.location.href = '/thrive'}>
                Explore Thrive
              </StateButton>
            </div>
          </StateContainer>
        );
      } else {
        return (
          <StateContainer>
            <StateIcon $type="error">
              <WifiOff />
            </StateIcon>
            <StateTitle>Connection Error</StateTitle>
            <StateDescription>
              {error}
            </StateDescription>
            <StateButton onClick={fetchPortfolios}>
              Try Again
            </StateButton>
          </StateContainer>
        );
      }
    }

    if (portfolios.length === 0) {
      if (searchQuery) {
        return (
          <StateContainer>
            <StateIcon $type="empty">
              <Search />
            </StateIcon>
            <StateTitle>No Results Found</StateTitle>
            <StateDescription>
              No portfolios found for "{searchQuery}". Try adjusting your search terms or browse our featured creators.
            </StateDescription>
            <StateButton onClick={() => {
              setSearchQuery('');
              fetchPortfolios();
            }}>
              Clear Search
            </StateButton>
          </StateContainer>
        );
      } else {
        return (
          <StateContainer>
            <StateIcon $type="development">
              <Rocket />
            </StateIcon>
            <StateTitle>Coming Soon!</StateTitle>
            <StateDescription>
              We're preparing an amazing collection of portfolios from talented creators. 
              Be the first to explore when we launch!
            </StateDescription>
            <div>
              <StateButton onClick={fetchPortfolios}>
                Refresh
              </StateButton>
              <StateButton $variant="secondary" onClick={() => window.location.href = '/signup'}>
                Get Notified
              </StateButton>
            </div>
          </StateContainer>
        );
      }
    }

    return (
      <PortfolioGrid>
        {portfolios.map((portfolio) => (
          <PortfolioCard 
            key={portfolio.id}
            onClick={() => handlePortfolioClick(portfolio.username)}
          >
            <FeaturedImageContainer>
              {renderPortfolioImage(portfolio)}
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
              
              {portfolio.bio && <Bio>{portfolio.bio}</Bio>}
              
              <PortfolioStats>
                {renderPortfolioStats(portfolio)}
              </PortfolioStats>
            </CardContent>
          </PortfolioCard>
        ))}
      </PortfolioGrid>
    );
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
            {searchQuery ? 'Search Results' : 'Featured Portfolios'}
          </SectionTitle>
          {!searchQuery && portfolios.length > 0 && (
            <ViewAllLink href="/explore">
              View all <ArrowRight size={16} />
            </ViewAllLink>
          )}
        </SectionHeader>

        {renderContent()}
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