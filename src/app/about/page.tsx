'use client';
import React from 'react';
import Image from 'next/image';
import styled, { keyframes } from 'styled-components';
import { Sparkles, Linkedin, Github, Youtube, MapPin, Clock, Star } from 'lucide-react';

/* ---------- GOLDEN/SPACING + ANIMATIONS (from blueprint) ---------- */
const PHI = 1.618033988749;
const PHI_INVERSE = 0.618033988749;

const GOLDEN_SPACING = {
  xs: `${0.618}rem`,
  sm: `${1}rem`,
  md: `${1.618}rem`,
  lg: `${2.618}rem`,
  xl: `${4.236}rem`,
  xxl: `${6.854}rem`,
};

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideInLeft = keyframes`
  from { opacity: 0; transform: translateX(-18px); }
  to { opacity: 1; transform: translateX(0); }
`;

const float = keyframes`
  0%,100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

const pulseGlow = keyframes`
  0%,100% { box-shadow: 0 0 14px rgba(59,130,246,0.18); }
  50% { box-shadow: 0 0 28px rgba(59,130,246,0.28); }
`;

/* ---------- SHELL ---------- */
const Page = styled.main`
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  justify-content: center;
  padding: ${GOLDEN_SPACING.xl} 1rem;
  box-sizing: border-box;
`;

/* ---------- HERO (reference look/overlay) ---------- */
const Hero = styled.header`
  width: 100%;
  max-width: 980px;
  height: clamp(180px, 30vh, 320px);
  border-radius: 14px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  padding: 2rem;
  margin: 0 auto ${GOLDEN_SPACING.md};
  background-image: url('https://picsum.photos/1600/600?random=12');
  background-size: cover;
  background-position: center;
  animation: ${fadeInUp} 0.6s ease;
  box-shadow: 0 10px 30px rgba(2,6,23,0.04);
  will-change: transform;
  margin-bottom: ${GOLDEN_SPACING.lg};

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(30,41,59,0.56), rgba(59,130,246,0.14));
    z-index: 1;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  gap: ${GOLDEN_SPACING.md};
  align-items: center;
  width: 100%;
`;

/* small animated icon */
const MiniBadge = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: rgba(255,255,255,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  svg { animation: ${float} 3s ease-in-out infinite; }
`;

/* hero text */
const HeroTitle = styled.h1`
  margin: 0;
  color: white;
  font-size: clamp(1.6rem, 3.8vw, 2.6rem);
  font-weight: 800;
  line-height: 1;
  span {
    background: linear-gradient(90deg,#60a5fa,#a78bfa,#f472b6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  margin: 6px 0 0;
  color: rgba(255,255,255,0.9);
  font-size: clamp(0.95rem, 1.6vw, 1.05rem);
`;

/* ---------- MAIN GRID (slightly overlapping hero like blueprint) ---------- */
const Main = styled.section`
  width: 100%;
  max-width: 980px;
  margin: -${GOLDEN_SPACING.md} auto 0; /* overlap */
  display: grid;
  gap: ${GOLDEN_SPACING.md};
  grid-template-columns: 320px 1fr;

  @media (max-width: 920px) {
    grid-template-columns: 1fr;
    margin-top: 0.5rem;
  }
`;

/* ---------- PROFILE CARD (glass, minimal) ---------- */
const ProfileCard = styled.aside`
  background: rgba(255,255,255,0.86);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 1.25rem;
  border: 1px solid rgba(2,6,23,0.04);
  animation: ${fadeInUp} 0.55s ease;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
`;

/* avatar */
const AvatarWrap = styled.div`
  width: 86px;
  height: 86px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg,#667eea,#60a5fa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 1.15rem;
  box-shadow: 0 8px 24px rgba(96,165,250,0.12);
`;

/* name & role */
const Name = styled.h2`
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #0f172a;
`;

const Role = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #475569;
`;

/* small meta pills */
const MetaRow = styled.div`
  display:flex;
  gap:0.5rem;
  flex-wrap:wrap;
  margin-top: 0.5rem;
`;

const Meta = styled.span`
  padding: 0.36rem 0.7rem;
  border-radius: 999px;
  background: white;
  border: 1px solid rgba(2,6,23,0.04);
  font-size: 0.85rem;
  color: #0f172a;
`;

/* social row (LinkedIn primary; optional GitHub/YouTube if present) */
const SocialRow = styled.div`
  display:flex;
  gap:0.6rem;
  margin-top: 0.6rem;
  a { display:inline-flex; align-items:center; justify-content:center; padding:0.45rem; border-radius:8px; color:inherit; text-decoration:none; transition: transform 0.15s ease; }
  a:hover { transform: translateY(-3px); }
`;

/* ---------- CONTENT (clean blocks) ---------- */
const Content = styled.div`
  display:flex;
  flex-direction:column;
  gap: ${GOLDEN_SPACING.sm};
`;

const Block = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid rgba(2,6,23,0.04);
  animation: ${slideInLeft} 0.45s ease;
`;

const Title = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
`;

const Text = styled.p`
  margin: 0;
  color: #475569;
  font-size: 0.97rem;
  line-height: 1.55;
`;

/* chips */
const Chips = styled.div`
  display:flex;
  gap:0.45rem;
  flex-wrap:wrap;
  margin-top: 0.5rem;
`;

const Chip = styled.span`
  padding:0.35rem 0.6rem;
  border-radius:999px;
  font-size:0.85rem;
  color:#0f172a;
  background:#ffffff;
  border:1px solid rgba(2,6,23,0.04);
`;

/* small list */
const List = styled.ul`
  margin: 0;
  padding-left: 1rem;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.6;
`;

/* subtle action row */
const ActionRow = styled.div`
  display:flex;
  gap: ${GOLDEN_SPACING.sm};
  margin-top: ${GOLDEN_SPACING.sm};
`;

/* subtle CTA (keeps visual language) */
const Primary = styled.a`
  display:inline-flex;
  gap:0.6rem;
  align-items:center;
  padding: 0.55rem 0.9rem;
  border-radius: 10px;
  background: linear-gradient(135deg,#60a5fa,#7c3aed);
  color: white;
  text-decoration: none;
  font-weight: 700;
  box-shadow: 0 8px 26px rgba(124,58,237,0.12);
  transition: transform 0.14s ease;
  &:hover { transform: translateY(-3px); }
`;

/* ---------- EXPORTED ABOUT PAGE ---------- */
export default function About() {
  // replace these with your real data or props
  const data = {
    name: 'Safe Mustafa',
    role: 'Software Engineer — Full-stack • Cloud',
    tagline: 'Minimal • Practical • Purposeful',
    bio:
      'I build reliable, maintainable systems — full-stack web apps, distributed storage, and cloud infrastructure on GCP. I focus on healthcare IT, epidemiological modeling, and practical ML tooling.',
    specializations: ['React', 'Next.js', 'Python', 'GCP', 'Docker', 'Cassandra'],
    stats: {
      years: 6,
      products: 5,
      focus: 'Healthcare',
      rating: 4.9,
    },
    social: {
      linkedin: 'https://www.linkedin.com/in/safe-mufasa',
      github: 'https://github.com/safemstf',
      youtube: 'https://www.youtube.com/@learnmorra',
    },
    // optional image (use a valid URL or leave empty to render initials)
    profileImage: '',
  };

  return (
    <Page>
      <div style={{ width: '100%', maxWidth: 980 }}>
        <Hero>
          <HeroInner>
            <MiniBadge aria-hidden>
              <Sparkles size={28} color="white" />
            </MiniBadge>

            <div>
              <HeroTitle>
                About <span>Me</span>
              </HeroTitle>
              <HeroSubtitle>{data.tagline} — {data.role.split('—')[0].trim()}</HeroSubtitle>
            </div>
          </HeroInner>
        </Hero>

        <Main>
          <ProfileCard>
            <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
              <AvatarWrap aria-hidden>
                {data.profileImage ? (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image src={data.profileImage} alt={data.name} fill style={{ objectFit: 'cover' }} />
                  </div>
                ) : (
                  <span>SM</span>
                )}
              </AvatarWrap>

              <div>
                <Name>{data.name}</Name>
                <Role>{data.role}</Role>
              </div>
            </div>

            <MetaRow>
              <Meta><Clock size={14} /> {data.stats.years}+ yrs</Meta>
              <Meta><Star size={14} /> {data.stats.products}+ products</Meta>
              <Meta>{data.stats.focus}</Meta>
            </MetaRow>

            <SocialRow>
              {/* LinkedIn only by default; keep others if you want */}
              <a href={data.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin size={18} color="#0A66C2" />
              </a>
              <a href={data.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href={data.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <Youtube size={18} color="#FF0000" />
              </a>
            </SocialRow>
          </ProfileCard>

          <Content>
            <Block>
              <Title>Overview</Title>
              <Text>{data.bio}</Text>

              <ActionRow>
                <Primary href={data.social.linkedin} target="_blank" rel="noopener noreferrer">
                  <Linkedin size={16} /> Connect on LinkedIn
                </Primary>
              </ActionRow>
            </Block>

            <Block>
              <Title>Core Skills</Title>
              <Chips>
                {data.specializations.map((s) => (
                  <Chip key={s}>{s}</Chip>
                ))}
              </Chips>
            </Block>

            <Block>
              <Title>Experience Highlights</Title>
              <List>
                <li>Delivered multiple full-stack applications (React/Next, Node, PostgreSQL/MongoDB).</li>
                <li>Built epidemiological modeling platforms (Python + D3), validated against public datasets.</li>
                <li>Architected resilient distributed storage and containerized services.</li>
                <li>Led digital transformations for healthcare with HIPAA-aware deployments.</li>
              </List>
            </Block>
          </Content>
        </Main>
      </div>
    </Page>
  );
}
