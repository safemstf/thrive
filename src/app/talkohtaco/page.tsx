// src/app/talkohtaco/page.tsx
'use client';

import { useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import styled, { keyframes } from 'styled-components';

// ==========================
// MOCK AGENTS
// ==========================
const agents = [
  { id: 1, name: 'Lexi', role: 'English Conversation' },
  { id: 2, name: 'Kai', role: 'Spanish Pronunciation' },
  { id: 3, name: 'Sana', role: 'French Grammar' },
  { id: 4, name: 'Ryo', role: 'Japanese Culture & Phrases' },
  { id: 5, name: 'Elara', role: 'German Fluency' },
  { id: 6, name: 'Mei', role: 'Mandarin Tone Practice' },
  { id: 7, name: 'Zia', role: 'Arabic Calligraphy' },
  { id: 8, name: 'Anya', role: 'Russian Vocabulary' },
  { id: 9, name: 'Diego', role: 'Portuguese Dialogue' },
  { id: 10, name: 'Chloe', role: 'Korean Sentence Structure' },
  { id: 11, name: 'Liam', role: 'Italian Idioms' },
  { id: 12, name: 'Yuki', role: 'Cantonese Tonal Practice' },
];

// ==========================
// ANIMATIONS
// ==========================
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

// ==========================
// STYLED COMPONENTS
// ==========================
const PageWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  margin-top: -80px;
`;

const Hero = styled.section`
  padding: 6rem 1.5rem 4rem;
  background: linear-gradient(135deg, rgba(59,130,246,0.05) 0%, rgba(139,92,246,0.05) 100%);
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const HeroSubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  max-width: 700px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  animation: ${fadeInUp} 1s ease-out;
`;

const SearchContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 3.5rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 9999px;
  background: white;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
`;

const AgentsSection = styled.section`
  padding: 4rem 1.5rem;
  background: #fff;
`;

const Grid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 2rem;
`;

const Card = styled.div`
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 20px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  animation: ${fadeInUp} 0.8s ease-out;
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 20px -4px rgba(59,130,246,0.25);
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(135deg, #93c5fd, #c084fc);
  display: grid;
  place-items: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  animation: ${float} 4s ease-in-out infinite;
`;

const Name = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: #1e293b;
`;

const Role = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 1.25rem;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: white;
  font-weight: 600;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background: linear-gradient(135deg, #2563eb, #4f46e5);
  }
`;

// ==========================
// MAIN COMPONENT
// ==========================
export default function TalkOhTacoPage() {
  const [query, setQuery] = useState('');

  const filtered = agents.filter(
    (a) =>
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <PageWrapper>
      {/* Hero */}
      <Hero>
        <HeroTitle>
          Connect with <span className="text-blue-500">TalkOhTaco</span> Agents
        </HeroTitle>
        <HeroSubtitle>
          Practice languages with intelligent AI partners powered by configs and models — all client-side while the backend rests.
        </HeroSubtitle>

        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search by language, agent, or skill..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </SearchContainer>
      </Hero>

      {/* Agents */}
      <AgentsSection>
        <Grid>
          {filtered.length > 0 ? (
            filtered.map((agent) => (
              <Card key={agent.id}>
                <Avatar>{agent.name.charAt(0)}</Avatar>
                <Name>{agent.name}</Name>
                <Role>{agent.role}</Role>
                <Button>
                  <Sparkles size={16} /> Start Practice Session
                </Button>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400">No agents found.</p>
          )}
        </Grid>
      </AgentsSection>
    </PageWrapper>
  );
}
