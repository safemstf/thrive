// src\components\thrive\styles.tsx
import styled, { keyframes } from 'styled-components';
import { 
  Card, BaseButton, Badge, Grid, FlexRow, FlexColumn, HeroSection, 
  Heading1, Heading2, BodyText, Container, animationUtils,
  fadeInUp
} from '@/styles/styled-components';

// ==============================================
// ANIMATIONS (Keep only unique ones)
// ==============================================
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Welcome Banner Styled Components - Place these in your thrive styles file

// ==============================================
// WELCOME BANNER COMPONENTS
// ==============================================
export const WelcomeBanner = styled(Card).attrs({ $padding: 'lg' })`
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1),
    rgba(102, 126, 234, 0.05)
  );
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--spacing-2xl);
  overflow: hidden;
  position: relative;
  animation: ${fadeInUp} 0.6s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, 
      var(--color-primary-500),
      var(--color-primary-600),
      var(--color-primary-400)
    );
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at top right, 
      rgba(102, 126, 234, 0.05) 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`;

export const WelcomeContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-lg);
  }
`;

export const WelcomeBannerTitle = styled(Heading2)`
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-2xl);
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--font-display);
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-sm);
  }
`;

export const WelcomeBannerText = styled(BodyText)`
  color: var(--color-text-secondary);
  max-width: 600px;
  line-height: 1.7;
  margin: 0;
  font-size: var(--font-size-base);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-sm);
    max-width: none;
  }
  
  strong {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
  }
`;

export const WelcomeActions = styled(FlexRow).attrs({ 
  $gap: 'var(--spacing-md)',
  $wrap: true 
})`
  margin-top: var(--spacing-lg);
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-direction: column;
    align-items: stretch;
    gap: var(--spacing-sm);
  }
`;

export const AssessmentButton = styled(BaseButton).attrs({ $variant: 'primary' })`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-bold);
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700));
  box-shadow: var(--shadow-lg);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    background: linear-gradient(135deg, var(--color-primary-700), var(--color-primary-800));
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    transition: transform var(--transition-fast);
  }
  
  &:hover svg {
    transform: translateX(3px);
  }
  
  @media (max-width: 768px) {
    padding: var(--spacing-md);
    font-size: var(--font-size-sm);
    justify-content: center;
  }
`;

// ==============================================
// ADDITIONAL WELCOME COMPONENTS (Optional)
// ==============================================
export const WelcomeIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    margin-bottom: var(--spacing-md);
  }
`;

export const WelcomeStats = styled.div`
  display: flex;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid rgba(102, 126, 234, 0.2);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
`;

export const WelcomeStat = styled.div`
  text-align: center;
  
  .value {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    font-family: var(--font-display);
  }
  
  .label {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: var(--spacing-xs);
  }
`;

export const WelcomeProgress = styled.div`
  margin-top: var(--spacing-lg);
`;

export const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  
  .title {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
  }
  
  .percentage {
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    font-weight: var(--font-weight-semibold);
  }
`;

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: var(--color-background-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
`;

export const ProgressBarFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600));
  border-radius: var(--radius-full);
  transition: width 0.8s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 2s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// ==============================================
// VARIANT WELCOME BANNERS (Different styles)
// ==============================================
export const CompactWelcomeBanner = styled(WelcomeBanner)`
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  
  ${WelcomeContent} {
    gap: var(--spacing-lg);
  }
  
  ${WelcomeBannerTitle} {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-sm);
  }
  
  ${WelcomeActions} {
    margin-top: var(--spacing-md);
  }
`;

export const AlertWelcomeBanner = styled(WelcomeBanner)`
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.1),
    rgba(239, 68, 68, 0.05)
  );
  border: 2px solid rgba(239, 68, 68, 0.2);
  
  &::before {
    background: linear-gradient(90deg, 
      #ef4444,
      #dc2626,
      #b91c1c
    );
  }
  
  ${WelcomeBannerTitle} {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

export const SuccessWelcomeBanner = styled(WelcomeBanner)`
  background: linear-gradient(135deg, 
    rgba(34, 197, 94, 0.1),
    rgba(34, 197, 94, 0.05)
  );
  border: 2px solid rgba(34, 197, 94, 0.2);
  
  &::before {
    background: linear-gradient(90deg, 
      #22c55e,
      #16a34a,
      #15803d
    );
  }
  
  ${WelcomeBannerTitle} {
    background: linear-gradient(135deg, #22c55e, #16a34a);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

// ==============================================
// HERO SECTION COMPONENTS (Simplified)
// ==============================================
export const ThriveHeroSection = styled(HeroSection)`
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.08),
    rgba(102, 126, 234, 0.04)
  );
  border-bottom: 1px solid var(--color-border-light);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 50% 0%, 
      rgba(102, 126, 234, 0.1) 0%,
      transparent 50%
    );
    pointer-events: none;
  }
`;

export const HeroBadge = styled(Badge)`
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: var(--color-primary-700);
  margin-bottom: var(--spacing-lg);
  backdrop-filter: blur(10px);
  animation: ${animationUtils.slideUp} 0.6s ease-out;
`;

export const GradientText = styled.span`
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const HeroStats = styled(Card)`
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin: var(--spacing-xl) auto;
  padding: var(--spacing-xl);
  max-width: 800px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  animation: ${animationUtils.slideUp} 0.8s ease-out 0.6s both;
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-lg);
  }
`;

export const StatItem = styled.div`
  text-align: center;
  position: relative;
`;


export const LiveIndicator = styled.div`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 12px;
  height: 12px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    width: 20px;
    height: 20px;
    border: 2px solid #10b981;
    border-radius: 50%;
    opacity: 0.3;
    animation: pulse 2s ease-in-out infinite;
  }
`;

// ==============================================
// ASSESSMENT COMPONENTS (Using Modular System)
// ==============================================
export const AssessmentCard = styled(Card)<{ $color?: string }>`
  position: relative;
  overflow: hidden;
  cursor: pointer;
  ${animationUtils.hoverLift(8)}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: ${props => props.$color || 'var(--color-primary-500)'};
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    transition: left 0.6s;
  }
  
  &:hover::after {
    left: 100%;
  }
`;

export const CardIcon = styled.div<{ $color?: string }>`
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: ${props => props.$color || 'var(--color-primary-500)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: var(--shadow-lg);
  flex-shrink: 0;
  transition: transform var(--transition-normal);
  
  .assessment-card:hover & {
    transform: scale(1.1) rotate(5deg);
  }
`;

export const CardMetrics = styled(Card)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-lg);
  background: rgba(247, 250, 252, 0.5);
  border: 1px solid var(--color-border-light);
`;

// ==============================================
// LEADERBOARD COMPONENTS (Simplified)
// ==============================================
export const LeaderboardItem = styled(Card)<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  background: ${props => {
    if (props.$rank <= 3) {
      return 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(102, 126, 234, 0.08))';
    }
    return 'rgba(247, 250, 252, 0.6)';
  }};
  border: 1px solid ${props => props.$rank <= 3 ? 'rgba(102, 126, 234, 0.2)' : 'var(--color-border-light)'};
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateX(8px);
    box-shadow: var(--shadow-md);
  }
`;


// ==============================================
// CTA SECTION (Using Modular System)
// ==============================================
export const CTASection = styled(Card)`
  text-align: center;
  padding: var(--spacing-3xl);
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1),
    rgba(102, 126, 234, 0.05)
  );
  margin: var(--spacing-xl) auto;
  max-width: 900px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  box-shadow: var(--shadow-xl);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, 
      rgba(102, 126, 234, 0.08) 0%,
      transparent 70%
    );
    pointer-events: none;
  }
`;

// ==============================================
// CATEGORY COMPONENTS (Simplified)
// ==============================================
export const CategoryContainer = styled(Card)`
  margin-bottom: var(--spacing-xl);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

export const CategoryHeader = styled(FlexRow)<{ $isActive?: boolean }>`
  padding: var(--spacing-lg);
  cursor: pointer;
  background: ${({ $isActive }) => $isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent'};
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export const CategoryIcon = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color = 'var(--color-primary-500)' }) => $color};
  color: white;
`;

export const CategoryContent = styled.div`
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  animation: expand 0.5s ease-out;

  @keyframes expand {
    from { 
      max-height: 0;
      opacity: 0;
      transform: translateY(-10px);
    }
    to { 
      max-height: 2000px;
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// ==============================================
// ACTION COMPONENTS (Using Modular BaseButton)
// ==============================================
export const ActionCard = styled(FlexRow)`
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.1),
    rgba(102, 126, 234, 0.05)
  );
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    background: linear-gradient(135deg, 
      rgba(102, 126, 234, 0.15),
      rgba(102, 126, 234, 0.08)
    );
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateX(4px);
  }
`;

export const PrimaryButton = styled(BaseButton)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
`;

export const SecondaryButton = styled(BaseButton).attrs({ $variant: 'secondary' })`
  backdrop-filter: blur(10px);
`;

// ==============================================
// FLOATING COMPONENTS
// ==============================================
export const FloatingCard = styled(Card)`
  animation: ${float} 6s ease-in-out infinite;
`;

// ==============================================
// EXPORT ALIASES FOR COMPATIBILITY
// ==============================================
export const PageWrapper = Container;
export const GlassSection = Card;
export const SectionTitle = Heading2;
export const CardsGrid = Grid;
export const FeatureGrid = Grid;
export const FeatureCard = Card;
export const CardHeader = FlexRow;
export const CardContent = FlexColumn;
export const CardTitle = Heading2;
export const CardDescription = BodyText;
export const CardFooter = FlexColumn;
export const CTAButtons = FlexRow;
export const CTATitle = Heading2;
export const CTADescription = BodyText;
export const BenefitsList = FlexRow;
export const BenefitItem = FlexRow;
export const SecurityFeatures = FlexRow;
export const SecurityFeature = FlexRow;
export const LeaderboardSection = FlexColumn;
export const LeaderboardList = FlexColumn;
export const PlayerInfo = FlexColumn;
export const PlayerName = Heading2;
export const PlayerScore = BodyText;
export const MetricItem = FlexColumn;
export const MetricLabel = BodyText;

// Keep HeroTitle and HeroSubtitle with custom styling
export const HeroTitle = styled(Heading1)`
  animation: ${animationUtils.slideUp} 0.8s ease-out 0.2s both;
`;

export const HeroSubtitle = styled(BodyText)`
  font-size: var(--font-size-xl);
  max-width: 900px;
  margin: 0 auto var(--spacing-xl) auto;
  animation: ${animationUtils.slideUp} 0.8s ease-out 0.4s both;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-lg);
  }
`;


// Extra Ranking Styled Components - Place these in your thrive styles file

// ==============================================
// CORE RANKING COMPONENTS (Required imports)
// ==============================================
export const RankingCard = styled(Card).attrs({ $padding: 'lg' })`
  max-width: 1000px;
  margin: 0 auto;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  box-shadow: var(--shadow-lg);
`;

export const RankingHeader = styled(FlexRow).attrs({ 
  $justify: 'space-between',
  $align: 'center',
})`
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: var(--spacing-lg);
`;

export const RankingItem = styled(Card)<{ $rank: number }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-md);
  background: ${props => props.$rank <= 3 
    ? `linear-gradient(135deg, 
        rgba(102, 126, 234, 0.15),
        rgba(102, 126, 234, 0.08))`
    : 'var(--color-background-tertiary)'};
  border: 1px solid ${props => props.$rank <= 3 
    ? 'rgba(102, 126, 234, 0.2)' 
    : 'var(--color-border-light)'};
  border-radius: var(--radius-lg);
  transition: all var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    transform: translateX(4px);
    box-shadow: var(--shadow-md);
    background: ${props => props.$rank <= 3 
      ? `linear-gradient(135deg, 
          rgba(102, 126, 234, 0.2),
          rgba(102, 126, 234, 0.1))`
      : 'var(--color-background-secondary)'};
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const RankBadge = styled.div<{ $rank: number }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  font-family: var(--font-display);
  
  background: ${props => {
    if (props.$rank === 1) return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
    if (props.$rank === 2) return 'linear-gradient(135deg, #d1d5db, #9ca3af)';
    if (props.$rank === 3) return 'linear-gradient(135deg, #fdba74, #fb923c)';
    return 'linear-gradient(135deg, var(--color-primary-300), var(--color-primary-400))';
  }};
  
  color: ${props => props.$rank <= 3 ? '#1f2937' : 'white'};
  border: 3px solid var(--color-background-secondary);
  box-shadow: var(--shadow-md);
  
  ${props => props.$rank === 1 && `
    position: relative;
    
    &::after {
      content: '👑';
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 16px;
    }
  `}
`;

export const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

export const UserName = styled.div`
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-family: var(--font-display);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-base);
  }
`;

export const UserTitle = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xs);
  }
`;

export const UserSkills = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-xs);
`;

export const SkillBadge = styled(Badge)`
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-background-tertiary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-medium);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  text-transform: none;
  
  &:hover {
    background: var(--color-background-secondary);
    color: var(--color-text-primary);
    border-color: var(--color-primary-300);
  }
`;

export const ScoreDisplay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  text-align: center;
  flex-shrink: 0;
  min-width: 80px;
  
  @media (max-width: 768px) {
    min-width: 60px;
  }
`;

export const OverallScore = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: var(--font-display);
  line-height: 1;
  
  @media (max-width: 768px) {
    font-size: var(--font-size-xl);
  }
`;

export const ScoreBreakdown = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

// ==============================================
// ADDITIONAL UTILITY COMPONENTS
// ==============================================
export const RankingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-xl);
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg);
  }
`;

export const RankingTitle = styled(Heading2)`
  text-align: center;
  background: linear-gradient(135deg, var(--color-primary-600), var(--color-primary-400));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--spacing-lg);
`;

export const RankingStats = styled(Grid).attrs({ 
  $columns: 4,
  $gap: 'var(--spacing-lg)'
})`
  margin-bottom: var(--spacing-2xl);
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }
`;

export const StatCard = styled(Card).attrs({ $hover: true, $padding: 'lg' })`
  text-align: center;
  background: var(--color-background-secondary);
  border: 1px solid var(--color-border-light);
  
  &:hover {
    border-color: var(--color-primary-300);
  }
`;

export const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin: 0 auto var(--spacing-sm);
  box-shadow: var(--shadow-md);
`;

export const StatValue = styled.div`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-family: var(--font-display);
  margin-bottom: var(--spacing-xs);
`;

export const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-weight: var(--font-weight-medium);
`;

export const VerificationBadge = styled(Badge)<{ $verified: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: var(--font-weight-medium);
  
  ${props => props.$verified ? `
    background: rgba(34, 197, 94, 0.1);
    color: #16a34a;
    border: 1px solid rgba(34, 197, 94, 0.2);
  ` : `
    background: rgba(156, 163, 175, 0.1);
    color: #6b7280;
    border: 1px solid rgba(156, 163, 175, 0.2);
  `}
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-border-light);
  border-top: 2px solid var(--color-primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  padding: var(--spacing-xl);
  text-align: center;
`;

// ==============================================
// FEATURE ICON (Simplified)
// ==============================================
export const FeatureIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600));
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-lg) auto;
  color: white;
  box-shadow: var(--shadow-lg);
  transition: transform var(--transition-normal);
  
  .feature-card:hover & {
    transform: scale(1.1);
  }
`;

// ==============================================
// STATS CONTAINER ALIAS
// ==============================================
export const StatsContainer = HeroStats;