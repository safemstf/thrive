// // app/portfolio/[username]/page.tsx - Portfolio-Centric Architecture
// 'use client';

// import React, { useState, useEffect } from 'react';
// import styled from 'styled-components';
// import { useParams, notFound } from 'next/navigation';
// import { 
//   Globe, Mail, MapPin, Calendar, ExternalLink, 
//   Github, Linkedin, Twitter, Instagram, 
//   Eye, Heart, Share2, Download,
//   Grid3x3, List, Layers
// } from 'lucide-react';
// import { api } from '@/lib/api-client';
// import type { Portfolio, GalleryPiece } from '@/types/portfolio.types';

// interface PublicPortfolioData {
//   // Portfolio fields from backend response
//   id: string;
//   userId: string;
//   username: string;
//   title?: string;
//   displayName?: string;
//   bio?: string;
//   tagline?: string;
//   kind: string;
//   visibility: string;
//   specializations?: string[];
//   tags?: string[];
//   location?: string;
  
//   // Images
//   profileImage?: string;
//   coverImage?: string;
  
//   // Social & Contact
//   socialLinks?: {
//     github?: string;
//     linkedin?: string;
//     twitter?: string;
//     instagram?: string;
//     website?: string;
//   };
//   contactEmail?: string;
  
//   // Stats from backend
//   stats?: {
//     totalViews?: number;
//     totalLikes?: number;
//     totalPieces?: number;
//     uniqueVisitors?: number;
//     followers?: number;
//   };
  
//   // Settings
//   settings?: {
//     isPublic?: boolean;
//     allowComments?: boolean;
//     allowReviews?: boolean;
//   };
// }

// type ViewMode = 'grid' | 'masonry' | 'list';

// export default function PublicPortfolioPage() {
//   const params = useParams();
//   const username = params.username as string;

//   const [portfolio, setPortfolio] = useState<PublicPortfolioData | null>(null);
//   const [galleryData, setGalleryData] = useState<{
//     pieces: GalleryPiece[];
//     pagination?: any;
//     portfolio?: any;
//   }>({ pieces: [] });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [viewMode, setViewMode] = useState<ViewMode>('masonry');
//   const [selectedPiece, setSelectedPiece] = useState<GalleryPiece | null>(null);
//   const [likedPieces, setLikedPieces] = useState<Set<string>>(new Set());

//   useEffect(() => {
//     // fetchPortfolioData();
//   }, [username]);

// //   const fetchPortfolioData = async () => {
// //     try {
// //       setLoading(true);
// //       setError(null);

// //       // Fetch public portfolio data using the new portfolio-centric API
// //       const portfolioResponse = await api.portfolio.getByUsername(username);
      
// //       if (!portfolioResponse) {
// //         throw new Error('Portfolio not found');
// //       }

// //       // Use the response directly since it matches our backend structure
// //       setPortfolio(portfolioResponse);

// //       // Fetch gallery pieces if portfolio has gallery capability
// //       if (['creative', 'hybrid', 'professional'].includes(portfolioResponse.kind)) {
// //         try {
// //           // Use the new portfolio-centric gallery endpoint
// //           const galleryResponse = await api.portfolio.gallery.getByUsername(username);
// //           setGalleryData(galleryResponse);
          
// //           // Get liked status for all pieces if user is authenticated
// //           const pieceIds = galleryResponse.pieces?.map(p => p.id) || [];
// //         //   if (pieceIds.length > 0) {
// //         //     try {
// //         //       // const likedStatus = await api.portfolio.getLikedStatus(pieceIds);
// //         //       const likedSet = new Set(Object.keys(likedStatus).filter(id => likedStatus[id]));
// //         //       setLikedPieces(likedSet);
// //         //     } catch (err) {
// //         //       // User not authenticated or other error - that's fine
// //         //       console.log('Could not fetch liked status:', err);
// //         //     }
// //         //   }
// //         // } catch (galleryError) {
// //         //   console.error('Failed to fetch gallery:', galleryError);
// //         //   // Don't fail the whole page if gallery fails
// //         //   setGalleryData({ pieces: [] });
// //         // }
// //       }

// //       // Track view - use the portfolio ID from the response
// //       try {
// //         await api.portfolio.analytics.trackView(portfolioResponse.id, {
// //           referrer: document.referrer || undefined,
// //         });
// //       } catch (trackError) {
// //         // Non-critical error
// //         console.log('Could not track view:', trackError);
// //       }

// //     } catch (err: any) {
// //       console.error('Failed to fetch portfolio:', err);
// //       if (err.status === 404 || err.message?.includes('not found')) {
// //         setError('Portfolio not found');
// //       } else {
// //         setError('Failed to load portfolio');
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleLikePiece = async (pieceId: string) => {
// //     try {
// //       if (likedPieces.has(pieceId)) {
// //         await api.portfolio.unlikePiece(pieceId);
// //         setLikedPieces(prev => {
// //           const next = new Set(prev);
// //           next.delete(pieceId);
// //           return next;
// //         });
// //       } else {
// //         await api.portfolio.likePiece(pieceId);
// //         setLikedPieces(prev => new Set([...prev, pieceId]));
// //       }
// //     } catch (err) {
// //       console.error('Failed to like piece:', err);
// //       // Could show a toast notification here
// //     }
// //   };

// //   const handleShare = async () => {
// //     const shareData = {
// //       title: portfolio?.displayName || portfolio?.title || 'Portfolio',
// //       text: portfolio?.tagline || portfolio?.bio?.substring(0, 100) || 'Check out this portfolio',
// //       url: window.location.href,
// //     };

// //     try {
// //       if (navigator.share && navigator.canShare?.(shareData)) {
// //         await navigator.share(shareData);
// //       } else {
// //         await navigator.clipboard.writeText(window.location.href);
// //         // Could show a "Link copied!" toast notification here
// //       }
// //     } catch (err) {
// //       console.error('Failed to share:', err);
// //     }
// //   };

// //   if (loading) {
// //     return (
// //       <LoadingContainer>
// //         <LoadingSpinner />
// //         <LoadingText>Loading portfolio...</LoadingText>
// //       </LoadingContainer>
// //     );
// //   }

// //   if (error || !portfolio) {
// //     return (
// //       <ErrorContainer>
// //         <ErrorIcon>🎨</ErrorIcon>
// //         <ErrorTitle>Portfolio Not Found</ErrorTitle>
// //         <ErrorMessage>
// //           The portfolio you're looking for doesn't exist or has been made private.
// //         </ErrorMessage>
// //       </ErrorContainer>
// //     );
// //   }

// //   // Check if portfolio is public
// //   if (portfolio.settings && portfolio.settings.isPublic === false) {
// //     return (
// //       <ErrorContainer>
// //         <ErrorIcon>🔒</ErrorIcon>
// //         <ErrorTitle>Private Portfolio</ErrorTitle>
// //         <ErrorMessage>
// //           This portfolio is private and cannot be viewed publicly.
// //         </ErrorMessage>
// //       </ErrorContainer>
// //     );
// //   }

// //   const displayName = portfolio.displayName || portfolio.title || 'Anonymous';
// //   const galleryPieces = galleryData.pieces || [];

// //   return (
// //     <PageWrapper>
// //       {/* Hero Section */}
// //       <HeroSection>
// //         <HeroBackground />
// //         {portfolio.coverImage && (
// //           <CoverImage src={portfolio.coverImage} alt="Portfolio cover" />
// //         )}
// //         <HeroContent>
// //           <ProfileSection>
// //             {portfolio.profileImage ? (
// //               <Avatar src={portfolio.profileImage} alt={displayName} />
// //             ) : (
// //               <AvatarPlaceholder>
// //                 {displayName.charAt(0).toUpperCase()}
// //               </AvatarPlaceholder>
// //             )}
// //             <ProfileInfo>
// //               <ProfileName>{displayName}</ProfileName>
// //               {portfolio.tagline && (
// //                 <ProfileTagline>{portfolio.tagline}</ProfileTagline>
// //               )}
              
// //               {/* Meta Information */}
// //               <ProfileMeta>
// //                 {portfolio.location && (
// //                   <MetaItem>
// //                     <MapPin size={14} />
// //                     <span>{portfolio.location}</span>
// //                   </MetaItem>
// //                 )}
// //                 <MetaItem>
// //                   <Eye size={14} />
// //                   <span>{portfolio.stats?.totalViews || 0} views</span>
// //                 </MetaItem>
// //                 {portfolio.stats?.followers && (
// //                   <MetaItem>
// //                     <Heart size={14} />
// //                     <span>{portfolio.stats.followers} followers</span>
// //                   </MetaItem>
// //                 )}
// //               </ProfileMeta>

// //               {/* Specializations */}
// //               {portfolio.specializations && portfolio.specializations.length > 0 && (
// //                 <SpecializationsWrapper>
// //                   <SpecializationTags>
// //                     {portfolio.specializations.map((spec, index) => (
// //                       <SpecializationTag key={index}>{spec}</SpecializationTag>
// //                     ))}
// //                   </SpecializationTags>
// //                 </SpecializationsWrapper>
// //               )}

// //               {/* Social Links */}
// //               {portfolio.socialLinks && (
// //                 <SocialLinks>
// //                   {portfolio.socialLinks.github && (
// //                     <SocialLink href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer">
// //                       <Github size={18} />
// //                     </SocialLink>
// //                   )}
// //                   {portfolio.socialLinks.linkedin && (
// //                     <SocialLink href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
// //                       <Linkedin size={18} />
// //                     </SocialLink>
// //                   )}
// //                   {portfolio.socialLinks.twitter && (
// //                     <SocialLink href={portfolio.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
// //                       <Twitter size={18} />
// //                     </SocialLink>
// //                   )}
// //                   {portfolio.socialLinks.instagram && (
// //                     <SocialLink href={portfolio.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
// //                       <Instagram size={18} />
// //                     </SocialLink>
// //                   )}
// //                   {portfolio.socialLinks.website && (
// //                     <SocialLink href={portfolio.socialLinks.website} target="_blank" rel="noopener noreferrer">
// //                       <Globe size={18} />
// //                     </SocialLink>
// //                   )}
// //                 </SocialLinks>
// //               )}
// //             </ProfileInfo>
// //           </ProfileSection>

// //           {/* Action Buttons */}
// //           <ActionButtons>
// //             <ActionButton onClick={handleShare}>
// //               <Share2 size={16} />
// //               Share Portfolio
// //             </ActionButton>
// //             {portfolio.contactEmail && (
// //               <ActionButton as="a" href={`mailto:${portfolio.contactEmail}`} $primary>
// //                 <Mail size={16} />
// //                 Get in Touch
// //               </ActionButton>
// //             )}
// //           </ActionButtons>
// //         </HeroContent>
// //       </HeroSection>

// //       {/* Bio Section */}
// //       {portfolio.bio && (
// //         <BioSection>
// //           <Container>
// //             <SectionTitle>About</SectionTitle>
// //             <BioText>{portfolio.bio}</BioText>
// //           </Container>
// //         </BioSection>
// //       )}

// //       {/* Portfolio Stats Section */}
// //       {portfolio.stats && (
// //         <StatsSection>
// //           <Container>
// //             <StatsGrid>
// //               <StatItem>
// //                 <StatNumber>{portfolio.stats.totalViews || 0}</StatNumber>
// //                 <StatLabel>Total Views</StatLabel>
// //               </StatItem>
// //               <StatItem>
// //                 <StatNumber>{portfolio.stats.totalPieces || galleryPieces.length}</StatNumber>
// //                 <StatLabel>Artworks</StatLabel>
// //               </StatItem>
// //               {portfolio.stats.followers && (
// //                 <StatItem>
// //                   <StatNumber>{portfolio.stats.followers}</StatNumber>
// //                   <StatLabel>Followers</StatLabel>
// //                 </StatItem>
// //               )}
// //               <StatItem>
// //                 <StatNumber>{portfolio.stats.uniqueVisitors || 0}</StatNumber>
// //                 <StatLabel>Unique Visitors</StatLabel>
// //               </StatItem>
// //             </StatsGrid>
// //           </Container>
// //         </StatsSection>
// //       )}

// //       {/* Gallery Section */}
// //       {galleryPieces.length > 0 && (
// //         <GallerySection>
// //           <Container>
// //             <GalleryHeader>
// //               <SectionTitle>
// //                 {portfolio.kind === 'creative' ? 'Gallery' : 
// //                  portfolio.kind === 'professional' ? 'Projects' : 'Work'}
// //               </SectionTitle>
// //               <ViewModeToggle>
// //                 <ViewModeButton 
// //                   $active={viewMode === 'grid'} 
// //                   onClick={() => setViewMode('grid')}
// //                   title="Grid view"
// //                 >
// //                   <Grid3x3 size={18} />
// //                 </ViewModeButton>
// //                 <ViewModeButton 
// //                   $active={viewMode === 'masonry'} 
// //                   onClick={() => setViewMode('masonry')}
// //                   title="Masonry view"
// //                 >
// //                   <Layers size={18} />
// //                 </ViewModeButton>
// //                 <ViewModeButton 
// //                   $active={viewMode === 'list'} 
// //                   onClick={() => setViewMode('list')}
// //                   title="List view"
// //                 >
// //                   <List size={18} />
// //                 </ViewModeButton>
// //               </ViewModeToggle>
// //             </GalleryHeader>

// //             <GalleryGrid $viewMode={viewMode}>
// //               {galleryPieces.map((piece) => (
// //                 <GalleryItem 
// //                   key={piece.id}
// //                   $viewMode={viewMode}
// //                   onClick={() => setSelectedPiece(piece)}
// //                 >
// //                   <GalleryImageWrapper>
// //                     <GalleryImage 
// //                       src={piece.thumbnailUrl || piece.imageUrl} 
// //                       alt={piece.alt || piece.title} 
// //                       loading="lazy"
// //                     />
// //                     <GalleryOverlay>
// //                       <OverlayContent>
// //                         <PieceTitle>{piece.title}</PieceTitle>
// //                         {piece.medium && <PieceMedium>{piece.medium}</PieceMedium>}
// //                         {piece.year && <PieceYear>{piece.year}</PieceYear>}
// //                       </OverlayContent>
// //                       <OverlayActions>
// //                         <OverlayAction 
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             handleLikePiece(piece.id);
// //                           }}
// //                           $liked={likedPieces.has(piece.id)}
// //                           title={likedPieces.has(piece.id) ? 'Unlike' : 'Like'}
// //                         >
// //                           <Heart size={16} fill={likedPieces.has(piece.id) ? 'currentColor' : 'none'} />
// //                           <span>{(piece.stats?.likes || 0)}</span>
// //                         </OverlayAction>
// //                         <OverlayAction title="Views">
// //                           <Eye size={16} />
// //                           <span>{piece.stats?.views || 0}</span>
// //                         </OverlayAction>
// //                       </OverlayActions>
// //                     </GalleryOverlay>
// //                   </GalleryImageWrapper>
                  
// //                   {viewMode === 'list' && (
// //                     <ListItemDetails>
// //                       <ListItemTitle>{piece.title}</ListItemTitle>
// //                       <ListItemDescription>{piece.description}</ListItemDescription>
// //                       <ListItemMeta>
// //                         {piece.category && <MetaTag>{piece.category}</MetaTag>}
// //                         {piece.year && <MetaTag>{piece.year}</MetaTag>}
// //                         {piece.medium && <MetaTag>{piece.medium}</MetaTag>}
// //                         {piece.price && <MetaTag>${piece.price}</MetaTag>}
// //                         {piece.tags && piece.tags.slice(0, 3).map(tag => (
// //                           <MetaTag key={tag}>#{tag}</MetaTag>
// //                         ))}
// //                       </ListItemMeta>
// //                     </ListItemDetails>
// //                   )}
// //                 </GalleryItem>
// //               ))}
// //             </GalleryGrid>
// //           </Container>
// //         </GallerySection>
// //       )}

// //       {/* Empty Gallery State */}
// //       {galleryPieces.length === 0 && ['creative', 'hybrid', 'professional'].includes(portfolio.kind) && (
// //         <EmptyGallerySection>
// //           <Container>
// //             <EmptyStateWrapper>
// //               <EmptyStateIcon>🎨</EmptyStateIcon>
// //               <EmptyStateTitle>No artworks yet</EmptyStateTitle>
// //               <EmptyStateDescription>
// //                 This portfolio doesn't have any public artworks to display.
// //               </EmptyStateDescription>
// //             </EmptyStateWrapper>
// //           </Container>
// //         </EmptyGallerySection>
// //       )}

// //       {/* Lightbox Modal */}
// //       {selectedPiece && (
// //         <LightboxOverlay onClick={() => setSelectedPiece(null)}>
// //           <LightboxContent onClick={(e) => e.stopPropagation()}>
// //             <LightboxImageWrapper>
// //               <LightboxImage src={selectedPiece.imageUrl} alt={selectedPiece.alt || selectedPiece.title} />
// //             </LightboxImageWrapper>
// //             <LightboxInfo>
// //               <LightboxTitle>{selectedPiece.title}</LightboxTitle>
// //               {selectedPiece.description && (
// //                 <LightboxDescription>{selectedPiece.description}</LightboxDescription>
// //               )}
// //               <LightboxMeta>
// //                 {selectedPiece.medium && <MetaRow><strong>Medium:</strong> {selectedPiece.medium}</MetaRow>}
// //                 {selectedPiece.year && <MetaRow><strong>Year:</strong> {selectedPiece.year}</MetaRow>}
// //                 {selectedPiece.category && <MetaRow><strong>Category:</strong> {selectedPiece.category}</MetaRow>}
// //                 {selectedPiece.price && <MetaRow><strong>Price:</strong> ${selectedPiece.price}</MetaRow>}
// //                 {selectedPiece.tags && selectedPiece.tags.length > 0 && (
// //                   <MetaRow>
// //                     <strong>Tags:</strong> {selectedPiece.tags.map(tag => `#${tag}`).join(', ')}
// //                   </MetaRow>
// //                 )}
// //               </LightboxMeta>
// //               <LightboxActions>
// //                 <ActionButton 
// //                   onClick={() => handleLikePiece(selectedPiece.id)}
// //                   $liked={likedPieces.has(selectedPiece.id)}
// //                 >
// //                   <Heart size={16} fill={likedPieces.has(selectedPiece.id) ? 'currentColor' : 'none'} />
// //                   {likedPieces.has(selectedPiece.id) ? 'Liked' : 'Like'}
// //                 </ActionButton>
// //                 <ActionButton as="a" href={selectedPiece.imageUrl} download target="_blank">
// //                   <Download size={16} />
// //                   Download
// //                 </ActionButton>
// //               </LightboxActions>
// //             </LightboxInfo>
// //             <CloseButton onClick={() => setSelectedPiece(null)} title="Close">
// //               ×
// //             </CloseButton>
// //           </LightboxContent>
// //         </LightboxOverlay>
// //       )}

// //       {/* Footer */}
// //       <Footer>
// //         <Container>
// //           <FooterContent>
// //             <FooterText>
// //               © {new Date().getFullYear()} {displayName}. All rights reserved.
// //             </FooterText>
// //             <FooterLinks>
// //               <FooterLink href="/privacy">Privacy</FooterLink>
// //               <FooterLink href="/terms">Terms</FooterLink>
// //               <FooterLink href="/">LearnMorra</FooterLink>
// //             </FooterLinks>
// //           </FooterContent>
// //         </Container>
// //       </Footer>
// //     </PageWrapper>
// //   );
// // }

// // Styled Components (keeping the existing ones and adding new ones)

// const PageWrapper = styled.div`
//   min-height: 100vh;
//   background: #fafafa;
// `;

// const LoadingContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   min-height: 100vh;
//   gap: 1rem;
// `;

// const LoadingSpinner = styled.div`
//   width: 48px;
//   height: 48px;
//   border: 3px solid #e5e7eb;
//   border-top-color: #2c2c2c;
//   border-radius: 50%;
//   animation: spin 1s linear infinite;
  
//   @keyframes spin {
//     to { transform: rotate(360deg); }
//   }
// `;

// const LoadingText = styled.p`
//   color: #6b7280;
//   font-size: 1rem;
// `;

// const ErrorContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   min-height: 100vh;
//   text-align: center;
//   padding: 2rem;
// `;

// const ErrorIcon = styled.div`
//   font-size: 4rem;
//   margin-bottom: 1rem;
// `;

// const ErrorTitle = styled.h1`
//   font-size: 2rem;
//   font-weight: 700;
//   color: #111827;
//   margin-bottom: 0.5rem;
// `;

// const ErrorMessage = styled.p`
//   color: #6b7280;
//   font-size: 1.125rem;
//   max-width: 400px;
// `;

// const HeroSection = styled.section`
//   position: relative;
//   background: white;
//   border-bottom: 1px solid #e5e7eb;
//   overflow: hidden;
// `;

// const HeroBackground = styled.div`
//   position: absolute;
//   inset: 0;
//   background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//   opacity: 0.05;
// `;

// const CoverImage = styled.img`
//   position: absolute;
//   inset: 0;
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
//   opacity: 0.3;
// `;

// const HeroContent = styled.div`
//   position: relative;
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 4rem 2rem;
//   background: rgba(255, 255, 255, 0.95);
//   backdrop-filter: blur(10px);
  
//   @media (max-width: 768px) {
//     padding: 3rem 1.5rem;
//   }
// `;

// const ProfileSection = styled.div`
//   display: flex;
//   gap: 2rem;
//   margin-bottom: 2rem;
  
//   @media (max-width: 768px) {
//     flex-direction: column;
//     align-items: center;
//     text-align: center;
//   }
// `;

// const Avatar = styled.img`
//   width: 120px;
//   height: 120px;
//   border-radius: 50%;
//   object-fit: cover;
//   border: 4px solid white;
//   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
// `;

// const AvatarPlaceholder = styled.div`
//   width: 120px;
//   height: 120px;
//   border-radius: 50%;
//   background: linear-gradient(135deg, #2c2c2c 0%, #666666 100%);
//   color: white;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   font-size: 3rem;
//   font-weight: 600;
//   border: 4px solid white;
//   box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
// `;

// const ProfileInfo = styled.div`
//   flex: 1;
// `;

// const ProfileName = styled.h1`
//   font-size: 2.5rem;
//   font-weight: 700;
//   color: #111827;
//   margin: 0 0 0.5rem 0;
// `;

// const ProfileTagline = styled.p`
//   font-size: 1.25rem;
//   color: #6b7280;
//   margin: 0 0 1.5rem 0;
//   line-height: 1.6;
// `;

// const ProfileMeta = styled.div`
//   display: flex;
//   flex-wrap: wrap;
//   gap: 1.5rem;
//   margin-bottom: 1.5rem;
  
//   @media (max-width: 768px) {
//     justify-content: center;
//   }
// `;

// const MetaItem = styled.div`
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   color: #6b7280;
//   font-size: 0.875rem;
  
//   svg {
//     color: #9ca3af;
//   }
// `;

// const SpecializationsWrapper = styled.div`
//   margin-bottom: 1.5rem;
  
//   @media (max-width: 768px) {
//     display: flex;
//     justify-content: center;
//   }
// `;

// const SpecializationTags = styled.div`
//   display: flex;
//   gap: 0.5rem;
//   flex-wrap: wrap;
// `;

// const SpecializationTag = styled.span`
//   padding: 0.375rem 0.75rem;
//   background: #f3f4f6;
//   color: #4b5563;
//   border-radius: 6px;
//   font-size: 0.875rem;
//   font-weight: 500;
// `;

// const SocialLinks = styled.div`
//   display: flex;
//   gap: 1rem;
  
//   @media (max-width: 768px) {
//     justify-content: center;
//   }
// `;

// const SocialLink = styled.a`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 36px;
//   height: 36px;
//   border-radius: 50%;
//   background: #f3f4f6;
//   color: #4b5563;
//   transition: all 0.2s;
  
//   &:hover {
//     background: #2c2c2c;
//     color: white;
//     transform: translateY(-2px);
//   }
// `;

// const ActionButtons = styled.div`
//   display: flex;
//   gap: 1rem;
//   flex-wrap: wrap;
  
//   @media (max-width: 768px) {
//     justify-content: center;
//   }
// `;

// const ActionButton = styled.button<{ $primary?: boolean; $liked?: boolean }>`
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
//   padding: 0.75rem 1.5rem;
//   background: ${props => props.$primary ? '#2c2c2c' : props.$liked ? '#ef4444' : 'white'};
//   color: ${props => props.$primary || props.$liked ? 'white' : '#374151'};
//   border: 1px solid ${props => props.$primary || props.$liked ? 'transparent' : '#d1d5db'};
//   border-radius: 8px;
//   font-weight: 500;
//   cursor: pointer;
//   transition: all 0.2s;
//   text-decoration: none;
  
//   &:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
//   }
// `;

// const Container = styled.div`
//   max-width: 1200px;
//   margin: 0 auto;
//   padding: 0 2rem;
  
//   @media (max-width: 768px) {
//     padding: 0 1.5rem;
//   }
// `;

// const BioSection = styled.section`
//   padding: 4rem 0;
//   background: white;
//   border-bottom: 1px solid #e5e7eb;
// `;

// const SectionTitle = styled.h2`
//   font-size: 2rem;
//   font-weight: 600;
//   color: #111827;
//   margin: 0 0 1.5rem 0;
// `;

// const BioText = styled.p`
//   font-size: 1.125rem;
//   color: #4b5563;
//   line-height: 1.8;
//   white-space: pre-wrap;
//   max-width: 800px;
// `;

// // New Stats Section
// const StatsSection = styled.section`
//   padding: 3rem 0;
//   background: #f8fafc;
//   border-bottom: 1px solid #e5e7eb;
// `;

// const StatsGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
//   gap: 2rem;
//   text-align: center;
// `;

// const StatItem = styled.div`
//   background: white;
//   padding: 1.5rem;
//   border-radius: 12px;
//   box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
// `;

// const StatNumber = styled.div`
//   font-size: 2rem;
//   font-weight: 700;
//   color: #111827;
//   margin-bottom: 0.5rem;
// `;

// const StatLabel = styled.div`
//   font-size: 0.875rem;
//   color: #6b7280;
//   text-transform: uppercase;
//   letter-spacing: 0.5px;
// `;

// const GallerySection = styled.section`
//   padding: 4rem 0;
//   min-height: 400px;
// `;

// const GalleryHeader = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-bottom: 2rem;
  
//   @media (max-width: 768px) {
//     flex-direction: column;
//     gap: 1rem;
//     align-items: flex-start;
//   }
// `;

// const ViewModeToggle = styled.div`
//   display: flex;
//   gap: 0.25rem;
//   background: white;
//   padding: 0.25rem;
//   border-radius: 8px;
//   border: 1px solid #e5e7eb;
// `;
// // Buttons to toggle between list and grid views
// export const ViewModeButton = styled.button<{ active?: boolean }>`
//   padding: 0.5rem 1rem;
//   margin-right: 0.5rem;
//   border: none;
//   background-color: ${({ active }) => (active ? '#0070f3' : '#eaeaea')};
//   color: ${({ active }) => (active ? 'white' : '#333')};
//   border-radius: 0.25rem;
//   cursor: pointer;
//   &:hover {
//     background-color: ${({ active }) => (active ? '#005bb5' : '#cacaca')};
//   }
// `;

// // Container for the gallery grid
// export const GalleryGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
//   gap: 1rem;
//   margin-top: 1rem;
// `;

// // Individual gallery item wrapper
// export const GalleryItem = styled.div`
//   position: relative;
//   overflow: hidden;
//   border-radius: 0.5rem;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
// `;

// // Wrapper for images inside gallery items
// export const GalleryImageWrapper = styled.div`
//   width: 100%;
//   padding-top: 75%; /* 4:3 aspect ratio */
//   position: relative;
// `;

// export const GalleryImage = styled.img`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
// `;

// // Overlay displayed on hover
// export const GalleryOverlay = styled.div`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   background: rgba(0, 0, 0, 0.6);
//   opacity: 0;
//   transition: opacity 0.2s ease;
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
//   &:hover {
//     opacity: 1;
//   }
// `;

// export const OverlayContent = styled.div`
//   padding: 0.75rem;
//   color: white;
// `;

// export const PieceTitle = styled.h3`
//   margin: 0;
//   font-size: 1rem;
//   font-weight: 600;
// `;

// export const PieceMedium = styled.span`
//   font-size: 0.875rem;
//   color: #ddd;
// `;

// export const PieceYear = styled.span`
//   font-size: 0.75rem;
//   color: #bbb;
// `;

// export const OverlayActions = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   padding: 0.5rem;
// `;

// export const OverlayAction = styled.button`
//   background: transparent;
//   border: none;
//   color: white;
//   cursor: pointer;
//   padding: 0.25rem;
//   margin-left: 0.5rem;
//   &:hover {
//     color: #0070f3;
//   }
// `;

// // List view components
// export const ListItemDetails = styled.div`
//   flex: 1;
//   display: flex;
//   flex-direction: column;
// `;

// export const ListItemTitle = styled.h4`
//   margin: 0;
//   font-size: 1rem;
// `;

// export const ListItemDescription = styled.p`
//   margin: 0.25rem 0;
//   font-size: 0.875rem;
//   color: #555;
// `;

// export const ListItemMeta = styled.div`
//   display: flex;
//   gap: 1rem;
//   font-size: 0.75rem;
//   color: #777;
// `;

// // Empty state components
// export const EmptyStateWrapper = styled.div`
//   text-align: center;
//   padding: 2rem;
// `;

// export const EmptyStateIcon = styled.div`
//   font-size: 3rem;
//   color: #eaeaea;
//   margin-bottom: 1rem;
// `;

// export const EmptyStateTitle = styled.h3`
//   margin: 0.5rem 0;
// `;

// export const EmptyStateDescription = styled.p`
//   margin: 0;
//   color: #888;
// `;

// // Lightbox components
// export const LightboxOverlay = styled.div`
//   position: fixed;
//   top: 0;
//   left: 0;
//   width: 100vw;
//   height: 100vh;
//   background: rgba(0, 0, 0, 0.8);
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   z-index: 1000;
// `;

// export const LightboxContent = styled.div`
//   position: relative;
//   background: white;
//   border-radius: 0.5rem;
//   overflow: hidden;
//   max-width: 90vw;
//   max-height: 90vh;
// `;

// export const LightboxImageWrapper = styled.div`
//   width: 100%;
//   padding-top: 56.25%; /* 16:9 */
//   position: relative;
// `;

// export const LightboxImage = styled.img`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   object-fit: contain;
// `;

// export const LightboxInfo = styled.div`
//   padding: 1rem;
// `;

// export const LightboxTitle = styled.h2`
//   margin: 0;
//   font-size: 1.25rem;
// `;

// export const LightboxDescription = styled.p`
//   margin: 0.5rem 0;
// `;

// export const LightboxMeta = styled.div`
//   display: flex;
//   gap: 1rem;
//   font-size: 0.75rem;
//   color: #777;
// `;

// export const LightboxActions = styled.div`
//   display: flex;
//   justify-content: flex-end;
//   padding: 0.5rem;
// `;

// export const CloseButton = styled.button`
//   position: absolute;
//   top: 0.5rem;
//   right: 0.5rem;
//   background: transparent;
//   border: none;
//   color: #fff;
//   font-size: 1.5rem;
//   cursor: pointer;
// `;

// // Footer components
// export const Footer = styled.footer`
//   background: #fafafa;
//   padding: 2rem;
//   margin-top: 2rem;
// `;

// export const FooterContent = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
// `;

// export const FooterText = styled.p`
//   margin: 0;
//   color: #666;
// `;

// export const FooterLinks = styled.div`
//   display: flex;
//   gap: 1rem;
// `;

// export const FooterLink = styled.a`
//   color: #0070f3;
//   text-decoration: none;
//   &:hover {
//     text-decoration: underline;
//   }
// `;
