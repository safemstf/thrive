// src/data/assessmentQuestions.ts
// Validated assessment question banks with scoring algorithms

export type QuestionType = 'likert4' | 'likert6' | 'likert11' | 'choice';

export interface ScaleOption {
  label: string;
  value: number;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  reverse?: boolean;
  // Only for 'choice' type questions
  options?: { label: string; value: number }[];
}

export interface Subscale {
  id: string;
  label: string;
  questionIds: string[];
}

export interface ScoreLevel {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
  showCrisisResources?: boolean;
}

export interface AssessmentDefinition {
  id: string;
  questionType: QuestionType;
  intro: string;
  timeframe?: string;  // e.g. "Over the last 2 weeks"
  options: ScaleOption[];  // for likert types (ignored for 'choice')
  questions: AssessmentQuestion[];
  subscales?: Subscale[];
  maxScore: number;
  levels: ScoreLevel[];
  clinicalDisclaimer?: string;
  recommendations: { min: number; max: number; items: string[] }[];
}

// ============================================================================
// GAD-7 — Generalized Anxiety Disorder Scale
// Spitzer et al., 2006
// ============================================================================

export const GAD7: AssessmentDefinition = {
  id: 'gad-7',
  questionType: 'likert4',
  intro: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
  timeframe: 'Over the last 2 weeks',
  options: [
    { label: 'Not at all', value: 0 },
    { label: 'Several days', value: 1 },
    { label: 'More than half the days', value: 2 },
    { label: 'Nearly every day', value: 3 },
  ],
  questions: [
    { id: 'gad1', text: 'Feeling nervous, anxious, or on edge' },
    { id: 'gad2', text: 'Not being able to stop or control worrying' },
    { id: 'gad3', text: 'Worrying too much about different things' },
    { id: 'gad4', text: 'Trouble relaxing' },
    { id: 'gad5', text: 'Being so restless that it is hard to sit still' },
    { id: 'gad6', text: 'Becoming easily annoyed or irritable' },
    { id: 'gad7', text: 'Feeling afraid, as if something awful might happen' },
  ],
  maxScore: 21,
  clinicalDisclaimer: 'The GAD-7 is a screening tool only. A score at or above 10 suggests moderate-to-severe anxiety and warrants follow-up with a healthcare provider. If you are in distress, please reach out to a mental health professional.',
  levels: [
    { min: 0, max: 4, label: 'Minimal anxiety', color: '#22c55e', description: 'Your responses suggest minimal anxiety symptoms. This is within the typical range for most people.' },
    { min: 5, max: 9, label: 'Mild anxiety', color: '#84cc16', description: 'Your responses suggest mild anxiety symptoms. You may notice some worry or nervousness, but it is likely manageable.' },
    { min: 10, max: 14, label: 'Moderate anxiety', color: '#f59e0b', description: 'Your responses suggest moderate anxiety symptoms. This level is worth discussing with a healthcare provider.' },
    { min: 15, max: 21, label: 'Severe anxiety', color: '#ef4444', description: 'Your responses suggest severe anxiety symptoms. We strongly encourage you to connect with a mental health professional.', showCrisisResources: true },
  ],
  recommendations: [
    { min: 0, max: 4, items: ['Maintain your current stress management practices', 'Regular exercise and sleep support low anxiety levels', 'Mindfulness practices can help maintain wellbeing'] },
    { min: 5, max: 9, items: ['Consider mindfulness or relaxation techniques', 'Regular physical activity can reduce mild anxiety', 'Limiting caffeine and alcohol may help', 'Journaling can help identify and process worries'] },
    { min: 10, max: 14, items: ['Speak with a GP or mental health professional', 'Cognitive-behavioural techniques (CBT) are effective for GAD', 'A regular routine and sleep schedule can help significantly', 'Consider reducing or eliminating stimulants'] },
    { min: 15, max: 21, items: ['Please contact a mental health professional as soon as possible', 'Crisis line: 988 Suicide & Crisis Lifeline (call or text 988)', 'International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/'] },
  ],
};

// ============================================================================
// PHQ-9 — Patient Health Questionnaire for Depression
// Kroenke et al., 2001
// ============================================================================

export const PHQ9: AssessmentDefinition = {
  id: 'phq-9',
  questionType: 'likert4',
  intro: 'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
  timeframe: 'Over the last 2 weeks',
  options: [
    { label: 'Not at all', value: 0 },
    { label: 'Several days', value: 1 },
    { label: 'More than half the days', value: 2 },
    { label: 'Nearly every day', value: 3 },
  ],
  questions: [
    { id: 'phq1', text: 'Little interest or pleasure in doing things' },
    { id: 'phq2', text: 'Feeling down, depressed, or hopeless' },
    { id: 'phq3', text: 'Trouble falling or staying asleep, or sleeping too much' },
    { id: 'phq4', text: 'Feeling tired or having little energy' },
    { id: 'phq5', text: 'Poor appetite or overeating' },
    { id: 'phq6', text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
    { id: 'phq7', text: 'Trouble concentrating on things, such as reading or watching television' },
    { id: 'phq8', text: 'Moving or speaking so slowly that other people could have noticed — or the opposite, being so fidgety or restless that you have been moving around a lot more than usual' },
    { id: 'phq9', text: 'Thoughts that you would be better off dead, or thoughts of hurting yourself in some way' },
  ],
  maxScore: 27,
  clinicalDisclaimer: 'The PHQ-9 is a screening tool only. Any score on item 9 (thoughts of self-harm) should be taken seriously. If you are having thoughts of harming yourself, please contact a mental health professional or crisis service immediately.',
  levels: [
    { min: 0, max: 4, label: 'Minimal depression', color: '#22c55e', description: 'Your responses suggest minimal depressive symptoms, within the typical range for most people.' },
    { min: 5, max: 9, label: 'Mild depression', color: '#84cc16', description: 'Your responses suggest mild depressive symptoms. You may want to monitor these over time and speak to someone if they persist.' },
    { min: 10, max: 14, label: 'Moderate depression', color: '#f59e0b', description: 'Your responses suggest moderate depressive symptoms. Speaking with a healthcare provider is recommended.' },
    { min: 15, max: 19, label: 'Moderately severe depression', color: '#f97316', description: 'Your responses suggest moderately severe depressive symptoms. Please reach out to a healthcare provider or mental health professional.' },
    { min: 20, max: 27, label: 'Severe depression', color: '#ef4444', description: 'Your responses suggest severe depressive symptoms. Please contact a mental health professional as soon as possible.', showCrisisResources: true },
  ],
  recommendations: [
    { min: 0, max: 4, items: ['Continue activities that bring you joy and connection', 'Regular sleep, exercise, and social contact support mood', 'Monitor your mood over time and re-screen if things change'] },
    { min: 5, max: 9, items: ['Stay physically active — exercise is one of the most effective mood lifters', 'Maintain social connections even when you do not feel like it', 'Reduce alcohol — it worsens depressive symptoms over time', 'Consider talking to a counsellor or therapist'] },
    { min: 10, max: 14, items: ['Please speak with your GP or a mental health professional', 'CBT is highly effective for moderate depression', 'Behavioural activation — doing things even when unmotivated — can break negative cycles', 'Be patient with yourself; recovery takes time'] },
    { min: 15, max: 27, items: ['Please contact a mental health professional as soon as possible', 'Crisis line: 988 Suicide & Crisis Lifeline (call or text 988)', 'Crisis Text Line: text HOME to 741741'] },
  ],
};

// ============================================================================
// Rosenberg Self-Esteem Scale (RSE)
// Rosenberg, 1965
// ============================================================================

export const ROSENBERG: AssessmentDefinition = {
  id: 'rosenberg-self-esteem',
  questionType: 'likert4',
  intro: 'Below is a list of statements dealing with your general feelings about yourself. Please indicate how strongly you agree or disagree with each statement.',
  options: [
    { label: 'Strongly agree', value: 3 },
    { label: 'Agree', value: 2 },
    { label: 'Disagree', value: 1 },
    { label: 'Strongly disagree', value: 0 },
  ],
  questions: [
    { id: 'rse1', text: 'On the whole, I am satisfied with myself.' },
    { id: 'rse2', text: 'At times I think I am no good at all.', reverse: true },
    { id: 'rse3', text: 'I feel that I have a number of good qualities.' },
    { id: 'rse4', text: 'I am able to do things as well as most other people.' },
    { id: 'rse5', text: 'I feel I do not have much to be proud of.', reverse: true },
    { id: 'rse6', text: 'I certainly feel useless at times.', reverse: true },
    { id: 'rse7', text: "I feel that I'm a person of worth, at least on an equal plane with others." },
    { id: 'rse8', text: 'I wish I could have more respect for myself.', reverse: true },
    { id: 'rse9', text: 'All in all, I am inclined to feel that I am a failure.', reverse: true },
    { id: 'rse10', text: 'I take a positive attitude toward myself.' },
  ],
  maxScore: 30,
  levels: [
    { min: 0, max: 14, label: 'Low self-esteem', color: '#ef4444', description: 'Your responses suggest low self-esteem. This can affect many areas of life. Speaking with a therapist or counsellor can be very helpful.' },
    { min: 15, max: 22, label: 'Normal range', color: '#22c55e', description: 'Your self-esteem is in the typical range. Most people score between 15 and 25 on this scale.' },
    { min: 23, max: 30, label: 'High self-esteem', color: '#6366f1', description: 'Your responses suggest high self-esteem and a strong positive sense of self-worth.' },
  ],
  recommendations: [
    { min: 0, max: 14, items: ['Consider speaking with a therapist — CBT and compassion-focused therapy are very effective', 'Practice self-compassion: treat yourself as you would treat a good friend', 'Challenge your inner critic: is the evidence actually there?', 'Keep a journal of small wins and moments you felt capable'] },
    { min: 15, max: 22, items: ['Notice when self-doubt arises and examine the evidence behind it', 'Build on your strengths — use the VIA Character Strengths assessment to identify them', 'Invest in relationships where you feel valued and respected', 'Self-compassion practices can move self-esteem in a positive direction'] },
    { min: 23, max: 30, items: ['Continue investing in activities and relationships that affirm your strengths', 'Use your confidence to support and uplift others', 'Be aware that very high scores can occasionally reflect defensiveness rather than genuine security'] },
  ],
};

// ============================================================================
// PERMA Wellbeing Profiler (Simplified — 15 items, 3 per pillar)
// Seligman et al.
// ============================================================================

export const PERMA: AssessmentDefinition = {
  id: 'perma-profiler',
  questionType: 'likert11',
  intro: 'The following questions ask about your wellbeing across five key areas. Answer based on how you generally feel in your life right now.',
  options: Array.from({ length: 11 }, (_, i) => ({ label: String(i), value: i })),
  questions: [
    // Positive Emotions
    { id: 'p1', text: 'How often do you feel positive?' },
    { id: 'p2', text: 'How often do you feel joyful?' },
    { id: 'p3', text: 'How much of the time do you feel that things in your life are going well?' },
    // Engagement
    { id: 'e1', text: 'How often do you become absorbed in what you are doing?' },
    { id: 'e2', text: 'How often do you feel excited and interested in things?' },
    { id: 'e3', text: 'How often do you feel deeply engaged with what you are working on?' },
    // Relationships
    { id: 'r1', text: 'To what extent do you feel loved?' },
    { id: 'r2', text: 'To what extent do you receive help and support from others when you need it?' },
    { id: 'r3', text: 'To what extent do you have warm and trusting relationships?' },
    // Meaning
    { id: 'm1', text: 'To what extent do you lead a purposeful and meaningful life?' },
    { id: 'm2', text: 'To what extent do you feel that what you do in life is valuable and worthwhile?' },
    { id: 'm3', text: 'To what extent does your life have a sense of direction or purpose?' },
    // Accomplishment
    { id: 'a1', text: 'How often do you achieve the important goals you have set for yourself?' },
    { id: 'a2', text: 'How much of the time do you feel you are making progress towards your goals?' },
    { id: 'a3', text: 'To what extent do you feel you are succeeding at what you do?' },
  ],
  subscales: [
    { id: 'P', label: 'Positive Emotions', questionIds: ['p1', 'p2', 'p3'] },
    { id: 'E', label: 'Engagement', questionIds: ['e1', 'e2', 'e3'] },
    { id: 'R', label: 'Relationships', questionIds: ['r1', 'r2', 'r3'] },
    { id: 'M', label: 'Meaning', questionIds: ['m1', 'm2', 'm3'] },
    { id: 'A', label: 'Accomplishment', questionIds: ['a1', 'a2', 'a3'] },
  ],
  maxScore: 150,  // 15 items × max 10
  levels: [
    { min: 0, max: 59, label: 'Low flourishing', color: '#ef4444', description: 'Your overall wellbeing score is below the typical range. Several pillars of flourishing may need attention.' },
    { min: 60, max: 89, label: 'Moderate flourishing', color: '#f59e0b', description: 'Your overall wellbeing is moderate. Some areas are strong while others may benefit from investment.' },
    { min: 90, max: 119, label: 'Good flourishing', color: '#22c55e', description: 'Your overall wellbeing is good. You are experiencing meaningful levels of flourishing across most pillars.' },
    { min: 120, max: 150, label: 'High flourishing', color: '#6366f1', description: 'Your overall wellbeing score is high. You are flourishing strongly across the five PERMA pillars.' },
  ],
  recommendations: [
    { min: 0, max: 59, items: ['Focus on your lowest-scoring PERMA pillar first — small changes have big effects', 'Connection to others (R) has one of the strongest effects on overall wellbeing — invest there', 'Meaning (M) can often be found by identifying and using your character strengths', 'Consider speaking with a therapist or life coach'] },
    { min: 60, max: 89, items: ['Identify your 1-2 lowest subscores and set one small goal in each', 'Engagement (E) often improves by choosing activities that are challenging but achievable', 'Gratitude practices can boost Positive Emotions (P) significantly', 'Share your goals with others — social accountability boosts Accomplishment (A)'] },
    { min: 90, max: 119, items: ['Build on your strongest pillars — use them to shore up weaker ones', 'Consider how you can help others experience more flourishing', 'A regular wellbeing check-in (monthly) helps maintain high scores'] },
    { min: 120, max: 150, items: ['You are flourishing — use your wellbeing as a resource for others', 'Consider how you might mentor or support people with lower wellbeing', 'Continue investing in all five pillars to maintain this level'] },
  ],
};

// ============================================================================
// Growth Mindset Assessment (Dweck-adapted, 8 items)
// ============================================================================

export const GROWTH_MINDSET: AssessmentDefinition = {
  id: 'growth-mindset',
  questionType: 'likert6',
  intro: 'The following statements are about your beliefs regarding ability, intelligence, and personal qualities. Rate how much you agree or disagree with each one.',
  options: [
    { label: 'Strongly disagree', value: 1 },
    { label: 'Disagree', value: 2 },
    { label: 'Slightly disagree', value: 3 },
    { label: 'Slightly agree', value: 4 },
    { label: 'Agree', value: 5 },
    { label: 'Strongly agree', value: 6 },
  ],
  questions: [
    // Fixed mindset items (reverse-scored — agreement = fixed mindset)
    { id: 'gm1', text: 'Your intelligence is something very basic about you that you cannot change very much.', reverse: true },
    { id: 'gm2', text: 'You have a certain amount of ability, and you cannot really do much to change it.', reverse: true },
    { id: 'gm3', text: 'You can learn new things, but you cannot really change how talented you are.', reverse: true },
    { id: 'gm4', text: 'Your character is something basic about you that you cannot change very much.', reverse: true },
    // Growth mindset items (agreement = growth mindset)
    { id: 'gm5', text: 'No matter how much intelligence you have, you can always change it quite a bit.' },
    { id: 'gm6', text: 'You can always substantially change how intelligent you are.' },
    { id: 'gm7', text: 'With effort and practice, you can significantly increase your ability in almost any area.' },
    { id: 'gm8', text: 'Your basic qualities are things you can cultivate through your own effort and experience.' },
  ],
  maxScore: 48,  // 8 items × 6
  levels: [
    { min: 8, max: 19, label: 'Fixed mindset', color: '#ef4444', description: 'Your responses suggest a predominantly fixed mindset — a belief that your abilities and intelligence are largely set traits. This can limit your resilience and willingness to take on challenges.' },
    { min: 20, max: 27, label: 'Leaning fixed', color: '#f59e0b', description: 'Your responses suggest you lean toward a fixed mindset, though you have some growth-oriented beliefs. With awareness, this is very changeable.' },
    { min: 28, max: 37, label: 'Mixed mindset', color: '#84cc16', description: 'You hold a blend of fixed and growth beliefs — common for most people. Identifying which contexts trigger fixed thinking can help shift the balance.' },
    { min: 38, max: 44, label: 'Leaning growth', color: '#22c55e', description: 'Your responses suggest a growth-oriented mindset. You tend to see challenges as opportunities and believe effort leads to improvement.' },
    { min: 45, max: 48, label: 'Strong growth mindset', color: '#6366f1', description: 'You have a strong growth mindset. You consistently believe that abilities can be developed through dedication and hard work.' },
  ],
  recommendations: [
    { min: 8, max: 27, items: ['Notice when you say "I am not good at this" — try replacing with "I am not good at this yet"', 'Celebrate effort and process, not just outcomes', 'Read Dweck\'s "Mindset: The New Psychology of Success"', 'Reflect on a past skill you now have that you once struggled with — what does that tell you?'] },
    { min: 28, max: 37, items: ['Identify the specific areas where your fixed mindset most often shows up', 'Challenge yourself with slightly-too-hard tasks: this is where growth happens', 'Reframe failures as data, not verdicts', 'Surround yourself with people who model a growth mindset'] },
    { min: 38, max: 48, items: ['Continue seeking challenges slightly beyond your current level', 'Share your growth mindset with others — it is contagious', 'Be patient when working with people who have a more fixed mindset', 'Use your growth orientation to mentor others through failure'] },
  ],
};

// ============================================================================
// Cognitive Reflection Test (Extended, 7 items)
// Frederick (2005) + extensions
// ============================================================================

export const CRT: AssessmentDefinition = {
  id: 'cognitive-reflection',
  questionType: 'choice',
  intro: 'These questions require careful thinking. Each one has an obvious-seeming answer — but it is usually wrong. Take your time.',
  options: [],  // choices are per-question for 'choice' type
  questions: [
    {
      id: 'crt1',
      text: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
      options: [
        { label: '10 cents', value: 0 },
        { label: '5 cents', value: 1 },
        { label: '50 cents', value: 0 },
        { label: '100 cents', value: 0 },
      ],
    },
    {
      id: 'crt2',
      text: 'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?',
      options: [
        { label: '100 minutes', value: 0 },
        { label: '20 minutes', value: 0 },
        { label: '5 minutes', value: 1 },
        { label: '25 minutes', value: 0 },
      ],
    },
    {
      id: 'crt3',
      text: 'In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take to cover half the lake?',
      options: [
        { label: '24 days', value: 0 },
        { label: '47 days', value: 1 },
        { label: '44 days', value: 0 },
        { label: '12 days', value: 0 },
      ],
    },
    {
      id: 'crt4',
      text: 'Jack is looking at Anne, but Anne is looking at George. Jack is married, but George is not. Is a married person looking at an unmarried person?',
      options: [
        { label: 'Yes', value: 1 },
        { label: 'No', value: 0 },
        { label: 'Cannot be determined', value: 0 },
      ],
    },
    {
      id: 'crt5',
      text: 'A farmer had 17 sheep. All but 9 ran away. How many sheep does the farmer have left?',
      options: [
        { label: '8', value: 0 },
        { label: '9', value: 1 },
        { label: '17', value: 0 },
        { label: '6', value: 0 },
      ],
    },
    {
      id: 'crt6',
      text: "A doctor gives you three pills and tells you to take one every half hour. How many minutes will the pills last?",
      options: [
        { label: '90 minutes', value: 0 },
        { label: '60 minutes', value: 1 },
        { label: '30 minutes', value: 0 },
        { label: '45 minutes', value: 0 },
      ],
    },
    {
      id: 'crt7',
      text: "Emily's mother has four children: April, May, June, and ___?",
      options: [
        { label: 'July', value: 0 },
        { label: 'Emily', value: 1 },
        { label: 'August', value: 0 },
        { label: 'January', value: 0 },
      ],
    },
  ],
  maxScore: 7,
  levels: [
    { min: 0, max: 1, label: 'Highly intuitive', color: '#f59e0b', description: 'You tend to go with your gut — quick, instinctive responses. This is often useful, but can lead to systematic errors on problems that require a second look.' },
    { min: 2, max: 3, label: 'Balanced thinker', color: '#84cc16', description: 'You use both intuitive and analytical thinking. With a bit more deliberation, your accuracy on tricky problems would improve.' },
    { min: 4, max: 5, label: 'Reflective thinker', color: '#22c55e', description: 'You tend to pause and re-examine your first instinct before answering — a strong indicator of careful, analytical reasoning.' },
    { min: 6, max: 7, label: 'Highly analytical', color: '#6366f1', description: 'You scored in the top range — you routinely override misleading intuitions to arrive at correct answers through deliberate reasoning.' },
  ],
  recommendations: [
    { min: 0, max: 3, items: ['Practice "slow thinking" — before answering, ask: what would the obvious wrong answer be here?', 'Study logical fallacies and cognitive biases', 'The book "Thinking, Fast and Slow" by Daniel Kahneman explores these two thinking systems in depth', 'Apply the "consider the opposite" technique before making decisions'] },
    { min: 4, max: 7, items: ['Your reflective thinking is a strong asset in complex decision-making', 'Apply this careful approach to high-stakes decisions in your work and life', 'Be patient with others who reach conclusions faster but less carefully', 'Explore more advanced logic and probabilistic reasoning'] },
  ],
};

// ============================================================================
// Registry — all assessment definitions
// ============================================================================

export const ASSESSMENT_REGISTRY: Record<string, AssessmentDefinition> = {
  'gad-7': GAD7,
  'phq-9': PHQ9,
  'rosenberg-self-esteem': ROSENBERG,
  'perma-profiler': PERMA,
  'growth-mindset': GROWTH_MINDSET,
  'cognitive-reflection': CRT,
};

export const getAssessmentDefinition = (id: string): AssessmentDefinition | null => {
  return ASSESSMENT_REGISTRY[id] ?? null;
};

// Helper: compute total score from answers map
export const computeScore = (
  def: AssessmentDefinition,
  answers: Record<string, number>
): number => {
  return def.questions.reduce((sum, q) => {
    const raw = answers[q.id] ?? 0;
    const maxVal = def.questionType === 'likert4' ? 3
      : def.questionType === 'likert6' ? 6
      : def.questionType === 'likert11' ? 10
      : 1;
    const val = q.reverse ? (maxVal - raw) : raw;
    return sum + val;
  }, 0);
};

// Helper: compute PERMA subscores
export const computeSubscores = (
  def: AssessmentDefinition,
  answers: Record<string, number>
): { id: string; label: string; score: number; max: number }[] => {
  if (!def.subscales) return [];
  return def.subscales.map(sub => {
    const score = sub.questionIds.reduce((s, qid) => s + (answers[qid] ?? 0), 0);
    const max = sub.questionIds.length * 10;
    return { id: sub.id, label: sub.label, score, max };
  });
};

export const getScoreLevel = (def: AssessmentDefinition, score: number): ScoreLevel => {
  return def.levels.find(l => score >= l.min && score <= l.max) ?? def.levels[def.levels.length - 1];
};
