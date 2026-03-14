'use client';
// src/app/dashboard/thrive/assessments/AssessmentRunner.tsx

import React, { useState, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { ArrowLeft, AlertCircle, CheckCircle, RotateCcw, ChevronRight, ExternalLink } from 'lucide-react';
import {
  AssessmentDefinition,
  computeScore,
  computeSubscores,
  getScoreLevel,
} from '@/data/assessmentQuestions';

// ============================================================================
// DESIGN TOKENS
// ============================================================================

const T = {
  cream: '#faf7f2',
  ink: '#1a1208',
  inkMid: '#3d2e18',
  inkLight: '#7a6a56',
  border: 'rgba(26,18,8,0.1)',
  accent: '#2563eb',
  accentLight: '#eff6ff',
  success: '#16a34a',
  warning: '#b45309',
  danger: '#dc2626',
  radius: '12px',
  radiusSm: '7px',
  shadow: '0 1px 3px rgba(26,18,8,0.07), 0 4px 16px rgba(26,18,8,0.05)',
  shadowLg: '0 8px 32px rgba(26,18,8,0.1)',
};

// ============================================================================
// ANIMATIONS
// ============================================================================

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
`;

const fillBar = keyframes`
  from { width: 0%; }
  to { width: var(--fill-width); }
`;

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Shell = styled.div`
  min-height: 100vh;
  background: ${T.cream};
  font-family: 'DM Sans', system-ui, sans-serif;
  padding: 0 0 4rem 0;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid ${T.border};
  background: ${T.cream};
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid ${T.border};
  border-radius: ${T.radiusSm};
  background: transparent;
  color: ${T.inkLight};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    background: rgba(26,18,8,0.05);
    color: ${T.ink};
  }
`;

const ProgressWrap = styled.div`
  flex: 1;
  max-width: 300px;
  margin: 0 1.5rem;
`;

const ProgressTrack = styled.div`
  height: 6px;
  background: rgba(26,18,8,0.08);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.25rem;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${T.accent};
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressLabel = styled.div`
  font-size: 0.75rem;
  color: ${T.inkLight};
  text-align: center;
`;

const Content = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
  animation: ${fadeIn} 0.4s ease;
`;

const AssessmentHeader = styled.div`
  margin-bottom: 2rem;
`;

const AssessmentTitle = styled.h1`
  font-family: 'DM Serif Display', serif;
  font-size: 1.75rem;
  color: ${T.ink};
  margin: 0 0 0.5rem 0;
`;

const AssessmentIntro = styled.p`
  font-size: 1rem;
  color: ${T.inkLight};
  line-height: 1.6;
  margin: 0 0 0.75rem 0;
`;

const TimeframeChip = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: ${T.accentLight};
  color: ${T.accent};
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const Disclaimer = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  background: #fefce8;
  border: 1px solid #fde68a;
  border-radius: ${T.radius};
  margin-bottom: 1.75rem;
  animation: ${fadeIn} 0.3s ease;
`;

const DisclaimerText = styled.p`
  font-size: 0.82rem;
  color: #78350f;
  line-height: 1.5;
  margin: 0;
`;

// ── Question cards ───────────────────────────────────────────────────────────

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const QuestionCard = styled.div<{ $answered: boolean }>`
  background: white;
  border-radius: ${T.radius};
  border: 1px solid ${p => p.$answered ? 'rgba(37,99,235,0.25)' : T.border};
  padding: 1.25rem 1.5rem;
  box-shadow: ${T.shadow};
  transition: border-color 0.2s;
  animation: ${slideIn} 0.25s ease;
`;

const QuestionNumber = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  color: ${T.inkLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
`;

const QuestionText = styled.p`
  font-size: 0.975rem;
  color: ${T.ink};
  line-height: 1.55;
  margin: 0 0 1.25rem 0;
  font-weight: 500;
`;

// ── Likert scale ─────────────────────────────────────────────────────────────

const LikertRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const LikertBtn = styled.button<{ $selected: boolean; $count: number }>`
  flex: 1;
  min-width: ${p => p.$count > 8 ? '2.25rem' : '3.5rem'};
  padding: ${p => p.$count > 8 ? '0.5rem 0.25rem' : '0.625rem 0.5rem'};
  border-radius: ${T.radiusSm};
  border: 1.5px solid ${p => p.$selected ? T.accent : T.border};
  background: ${p => p.$selected ? T.accentLight : 'transparent'};
  color: ${p => p.$selected ? T.accent : T.inkLight};
  font-size: ${p => p.$count > 8 ? '0.75rem' : '0.8rem'};
  font-weight: ${p => p.$selected ? '700' : '500'};
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  text-align: center;
  line-height: 1.3;

  &:hover {
    border-color: ${T.accent};
    background: ${T.accentLight};
    color: ${T.accent};
  }
`;

const LikertLabels = styled.div<{ $count: number }>`
  display: flex;
  justify-content: space-between;
  margin-top: 0.375rem;
  font-size: 0.65rem;
  color: ${T.inkLight};
  padding: 0 0.25rem;
`;

// ── Choice (CRT) ─────────────────────────────────────────────────────────────

const ChoiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ChoiceBtn = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: ${T.radiusSm};
  border: 1.5px solid ${p => p.$selected ? T.accent : T.border};
  background: ${p => p.$selected ? T.accentLight : 'white'};
  color: ${p => p.$selected ? T.accent : T.ink};
  font-size: 0.9rem;
  font-weight: ${p => p.$selected ? '600' : '400'};
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: inherit;

  &:hover {
    border-color: ${T.accent};
    background: ${T.accentLight};
    color: ${T.accent};
  }
`;

const ChoiceDot = styled.div<{ $selected: boolean }>`
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid ${p => p.$selected ? T.accent : T.border};
  background: ${p => p.$selected ? T.accent : 'transparent'};
  flex-shrink: 0;
  transition: all 0.15s;
`;

// ── Submit area ──────────────────────────────────────────────────────────────

const SubmitArea = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
`;

const SubmitBtn = styled.button<{ $ready: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 2.5rem;
  border-radius: 100px;
  border: none;
  background: ${p => p.$ready ? T.accent : 'rgba(26,18,8,0.12)'};
  color: ${p => p.$ready ? 'white' : T.inkLight};
  font-size: 1rem;
  font-weight: 600;
  cursor: ${p => p.$ready ? 'pointer' : 'not-allowed'};
  transition: all 0.2s;
  font-family: inherit;
  box-shadow: ${p => p.$ready ? '0 4px 14px rgba(37,99,235,0.3)' : 'none'};

  &:hover {
    background: ${p => p.$ready ? '#1d4ed8' : 'rgba(26,18,8,0.12)'};
    transform: ${p => p.$ready ? 'translateY(-1px)' : 'none'};
  }
`;

const SubmitHint = styled.p`
  font-size: 0.8rem;
  color: ${T.inkLight};
  margin: 0;
`;

// ── Results page ─────────────────────────────────────────────────────────────

const ResultsWrap = styled.div`
  animation: ${fadeIn} 0.5s ease;
`;

const ResultsHero = styled.div<{ $color: string }>`
  text-align: center;
  padding: 2.5rem 1.5rem;
  background: ${p => p.$color}12;
  border-radius: ${T.radius};
  border: 1px solid ${p => p.$color}30;
  margin-bottom: 1.5rem;
`;

const ResultsBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3rem 0.875rem;
  background: white;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${T.ink};
  box-shadow: ${T.shadow};
  margin-bottom: 1rem;
  letter-spacing: 0.25px;
`;

const ResultsScore = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 3.5rem;
  font-weight: 700;
  color: ${T.ink};
  line-height: 1;
  margin-bottom: 0.25rem;
`;

const ResultsMaxScore = styled.span`
  font-size: 1.25rem;
  color: ${T.inkLight};
  font-weight: 400;
`;

const ResultsLevel = styled.div<{ $color: string }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${p => p.$color};
  margin-bottom: 0.75rem;
`;

const ScoreBar = styled.div`
  max-width: 360px;
  margin: 0 auto;
  height: 10px;
  background: rgba(26,18,8,0.08);
  border-radius: 5px;
  overflow: hidden;
`;

const ScoreFill = styled.div<{ $pct: number; $color: string }>`
  height: 100%;
  width: ${p => p.$pct}%;
  background: ${p => p.$color};
  border-radius: 5px;
  transition: width 0.6s ease;
`;

const Card = styled.div`
  background: white;
  border-radius: ${T.radius};
  border: 1px solid ${T.border};
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: ${T.shadow};
`;

const CardTitle = styled.h3`
  font-family: 'DM Serif Display', serif;
  font-size: 1.1rem;
  color: ${T.ink};
  margin: 0 0 0.75rem 0;
`;

const InterpretationText = styled.p`
  font-size: 0.92rem;
  color: ${T.inkMid};
  line-height: 1.65;
  margin: 0;
`;

// Subscores (PERMA)
const SubscoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const SubscoreItem = styled.div`
  text-align: center;
  padding: 0.875rem 0.5rem;
  background: ${T.cream};
  border-radius: ${T.radiusSm};
  border: 1px solid ${T.border};
`;

const SubscorePillar = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${T.inkLight};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const SubscoreValue = styled.div`
  font-family: 'DM Mono', monospace;
  font-size: 1.4rem;
  font-weight: 700;
  color: ${T.ink};
`;

const SubscoreMax = styled.span`
  font-size: 0.8rem;
  color: ${T.inkLight};
  font-weight: 400;
`;

// Recommendations
const RecList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const RecItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: 0.9rem;
  color: ${T.inkMid};
  line-height: 1.5;

  &::before {
    content: '→';
    color: ${T.accent};
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

// Crisis resources
const CrisisBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: ${T.radius};
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
`;

const CrisisTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: #991b1b;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const CrisisText = styled.p`
  font-size: 0.85rem;
  color: #7f1d1d;
  line-height: 1.6;
  margin: 0;
`;

// Results actions
const ResultsActions = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1.5rem;
`;

const PrimaryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 100px;
  border: none;
  background: ${T.accent};
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  box-shadow: 0 4px 14px rgba(37,99,235,0.25);

  &:hover {
    background: #1d4ed8;
    transform: translateY(-1px);
  }
`;

const SecBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 100px;
  border: 1.5px solid ${T.border};
  background: white;
  color: ${T.ink};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;

  &:hover {
    background: ${T.cream};
    border-color: rgba(26,18,8,0.2);
  }
`;

// ============================================================================
// COMPONENT
// ============================================================================

interface AssessmentRunnerProps {
  definition: AssessmentDefinition;
  title: string;
  onBack: () => void;
}

export const AssessmentRunner: React.FC<AssessmentRunnerProps> = ({ definition, title, onBack }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = definition.questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;
  const progressPct = (answeredCount / totalQuestions) * 100;

  const score = submitted ? computeScore(definition, answers) : 0;
  const subscores = submitted ? computeSubscores(definition, answers) : [];
  const level = submitted ? getScoreLevel(definition, score) : definition.levels[0];
  const scorePct = submitted ? Math.round((score / definition.maxScore) * 100) : 0;

  const recs = submitted
    ? definition.recommendations.find(r => score >= r.min && score <= r.max)?.items ?? []
    : [];

  const handleAnswer = useCallback((qId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  }, []);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetake = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Results view ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Shell>
        <TopBar>
          <BackBtn onClick={onBack}>
            <ArrowLeft size={16} /> Back to Assessments
          </BackBtn>
          <span style={{ fontSize: '0.85rem', color: T.inkLight }}>{title}</span>
          <SecBtn onClick={handleRetake} style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}>
            <RotateCcw size={14} /> Retake
          </SecBtn>
        </TopBar>

        <Content>
          <ResultsWrap>
            <ResultsHero $color={level.color}>
              <ResultsBadge>
                <CheckCircle size={14} style={{ color: '#16a34a' }} />
                Assessment complete
              </ResultsBadge>
              <ResultsScore>
                {definition.questionType === 'choice'
                  ? `${score}/${definition.maxScore}`
                  : score}
                {definition.questionType !== 'choice' && (
                  <ResultsMaxScore> / {definition.maxScore}</ResultsMaxScore>
                )}
              </ResultsScore>
              <ResultsLevel $color={level.color}>{level.label}</ResultsLevel>
              <ScoreBar>
                <ScoreFill $pct={scorePct} $color={level.color} />
              </ScoreBar>
            </ResultsHero>

            {level.showCrisisResources && (
              <CrisisBox>
                <CrisisTitle><AlertCircle size={16} /> If you are in crisis</CrisisTitle>
                <CrisisText>
                  Your results suggest significant distress. Please reach out to a mental health professional.
                  <br /><br />
                  <strong>988 Suicide &amp; Crisis Lifeline:</strong> call or text 988 (US)<br />
                  <strong>Crisis Text Line:</strong> text HOME to 741741<br />
                  <strong>International resources:</strong> iasp.info/resources/Crisis_Centres/
                </CrisisText>
              </CrisisBox>
            )}

            <Card>
              <CardTitle>What this means</CardTitle>
              <InterpretationText>{level.description}</InterpretationText>
            </Card>

            {definition.clinicalDisclaimer && (
              <Disclaimer style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
                <DisclaimerText>{definition.clinicalDisclaimer}</DisclaimerText>
              </Disclaimer>
            )}

            {subscores.length > 0 && (
              <Card>
                <CardTitle>PERMA Subscores</CardTitle>
                <SubscoreGrid>
                  {subscores.map(s => (
                    <SubscoreItem key={s.id}>
                      <SubscorePillar>{s.label}</SubscorePillar>
                      <SubscoreValue>
                        {s.score}<SubscoreMax>/{s.max}</SubscoreMax>
                      </SubscoreValue>
                    </SubscoreItem>
                  ))}
                </SubscoreGrid>
              </Card>
            )}

            {recs.length > 0 && (
              <Card>
                <CardTitle>Recommendations</CardTitle>
                <RecList>
                  {recs.map((r, i) => <RecItem key={i}>{r}</RecItem>)}
                </RecList>
              </Card>
            )}

            <ResultsActions>
              <SecBtn onClick={onBack}>
                <ArrowLeft size={16} /> Back to Assessments
              </SecBtn>
              <PrimaryBtn onClick={handleRetake}>
                <RotateCcw size={16} /> Retake Assessment
              </PrimaryBtn>
            </ResultsActions>
          </ResultsWrap>
        </Content>
      </Shell>
    );
  }

  // ── Question view ─────────────────────────────────────────────────────────
  const isLikert = definition.questionType !== 'choice';
  const optionCount = definition.options.length;
  const firstLabel = definition.options[0]?.label ?? '';
  const lastLabel = definition.options[definition.options.length - 1]?.label ?? '';

  return (
    <Shell>
      <TopBar>
        <BackBtn onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </BackBtn>
        <ProgressWrap>
          <ProgressTrack>
            <ProgressFill $pct={progressPct} />
          </ProgressTrack>
          <ProgressLabel>{answeredCount} of {totalQuestions} answered</ProgressLabel>
        </ProgressWrap>
        <span style={{ fontSize: '0.8rem', color: T.inkLight, minWidth: 80, textAlign: 'right' }}>
          {Math.round(progressPct)}% complete
        </span>
      </TopBar>

      <Content>
        <AssessmentHeader>
          <AssessmentTitle>{title}</AssessmentTitle>
          {definition.timeframe && (
            <TimeframeChip>{definition.timeframe}</TimeframeChip>
          )}
          <AssessmentIntro style={{ marginTop: definition.timeframe ? '0.75rem' : 0 }}>
            {definition.intro}
          </AssessmentIntro>
        </AssessmentHeader>

        {definition.clinicalDisclaimer && (
          <Disclaimer>
            <AlertCircle size={16} style={{ color: '#b45309', flexShrink: 0, marginTop: 2 }} />
            <DisclaimerText>
              <strong>Screening tool only.</strong> {definition.clinicalDisclaimer}
            </DisclaimerText>
          </Disclaimer>
        )}

        <QuestionList>
          {definition.questions.map((q, idx) => {
            const answered = q.id in answers;
            const selected = answers[q.id];

            return (
              <QuestionCard key={q.id} $answered={answered}>
                <QuestionNumber>Question {idx + 1} of {totalQuestions}</QuestionNumber>
                <QuestionText>{q.text}</QuestionText>

                {q.options ? (
                  // Choice type (CRT)
                  <ChoiceList>
                    {q.options.map((opt, oi) => (
                      <ChoiceBtn
                        key={oi}
                        $selected={selected === oi}
                        onClick={() => handleAnswer(q.id, oi)}
                      >
                        <ChoiceDot $selected={selected === oi} />
                        {opt.label}
                      </ChoiceBtn>
                    ))}
                  </ChoiceList>
                ) : (
                  // Likert type
                  <>
                    <LikertRow>
                      {definition.options.map((opt, oi) => (
                        <LikertBtn
                          key={oi}
                          $selected={selected === opt.value}
                          $count={optionCount}
                          onClick={() => handleAnswer(q.id, opt.value)}
                        >
                          {optionCount <= 4 ? opt.label : opt.value === 0 || opt.value === optionCount - 1 ? opt.label : opt.value}
                        </LikertBtn>
                      ))}
                    </LikertRow>
                    {optionCount > 4 && (
                      <LikertLabels $count={optionCount}>
                        <span>{firstLabel}</span>
                        <span>{lastLabel}</span>
                      </LikertLabels>
                    )}
                  </>
                )}
              </QuestionCard>
            );
          })}
        </QuestionList>

        <SubmitArea>
          {!allAnswered && (
            <SubmitHint>
              {totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} remaining
            </SubmitHint>
          )}
          <SubmitBtn $ready={allAnswered} onClick={handleSubmit} disabled={!allAnswered}>
            <CheckCircle size={18} />
            {allAnswered ? 'See My Results' : `Answer all ${totalQuestions} questions to continue`}
          </SubmitBtn>
        </SubmitArea>
      </Content>
    </Shell>
  );
};

export default AssessmentRunner;
