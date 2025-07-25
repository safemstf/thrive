// src/types/educational.types.ts

// Base types for better database migration
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Main category types
export type MainCategory = 'math' | 'english' | 'science';
export type SubCategory = 'sat' | 'foundations' | 'ap';
export type ScientificDiscipline = 'physics' | 'chemistry' | 'biology';

// Difficulty levels
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// Concept types
export interface Concept {
  id: string;
  tags?: string[];
  difficulty?: DifficultyLevel;
  title: string;
  summary?: string;
  estimatedMinutes?: number;
}

export interface ConceptProgress {
  conceptId: string;
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt?: string;  // ISO timestamp
  completedAt?: string; // ISO timestamp
  score?: number;
  attempts?: number;
  notes?: string;
}

// Content types for different subjects
export interface Example {
  id?: string;
  expression: string;
  solution?: string;
  steps?: string[];
  visual?: string; // URL or diagram reference
}

export interface Strategy {
  id?: string;
  title: string;
  description: string;
  whenToUse?: string;
}

export interface Formula {
  id?: string;
  symbol: string;
  name: string;
  latex?: string;
  units?: string;
  description?: string;
}

export interface Rule {
  id?: string;
  name: string;
  statement: string;
  symbol?: string;
  exceptions?: string[];
}

export interface CommonError {
  id?: string;
  error: string;
  correct: string;
  explanation?: string;
}

// Math specific content
export interface MathConcept {
  id: string;
  topic: string;
  formula?: Formula;
  rules: Rule[];
  examples: Example[];
  strategies: Strategy[];
  commonErrors?: CommonError[];
  difficultyLevels?: {
    [K in DifficultyLevel]?: {
      description: string;
      examples: Example[];
      practiceProblems?: string[];
    };
  };
}

// Science specific content
export interface ScienceConcept {
  id: string;
  topic: string;
  discipline: ScientificDiscipline;
  principle: string;
  formulas?: Formula[];
  laws?: Rule[];
  examples: Example[];
  applications: string[];
  labSkills?: string[];
  commonMistakes?: CommonError[];
}

// English specific content
export interface GrammarRule {
  id: string;
  topic: string;
  rule: Rule;
  examples: Example[];
  exceptions?: string[];
  commonErrors: CommonError[];
}

export interface LiteraryDevice {
  id: string;
  name: string;
  definition: string;
  symbol?: string;
  examples: Example[];
  effect: string;
}

export interface WritingStructure {
  id: string;
  type: string; // essay, paragraph, sentence
  components: {
    name: string;
    purpose: string;
    examples: string[];
  }[];
  transitions?: string[];
}

// Learning content union type
export interface LearningContent {
  mathConcepts?: MathConcept[];
  scienceConcepts?: ScienceConcept[];
  grammarRules?: GrammarRule[];
  literaryDevices?: LiteraryDevice[];
  writingStructures?: WritingStructure[];
}

// Book interface
export interface Book extends BaseEntity {
  title: string;
  subtitle?: string;
  year: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  scientificDiscipline?: ScientificDiscipline;
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
  icon?: string; // Icon identifier
  excerpt: string;
  description: string;
  learningContent: LearningContent;
  metadata?: {
    gradeLevel?: string[];
    prerequisites?: string[];
    duration?: string;
    lastUpdated?: Date;
  };
}

// Section configuration for UI
export interface SectionConfig {
  key: string;
  title: string;
  mainCategory: MainCategory;
  subCategory: SubCategory;
  disciplines?: ScientificDiscipline[];
}

// UI-specific types and defaults
export type CategoryIcon = MainCategory | SubCategory;

export interface SectionConfigUI extends SectionConfig {}

export const defaultSections: SectionConfigUI[] = [
  { key: 'sat', title: 'SAT Guides', mainCategory: 'math', subCategory: 'sat' },
  { key: 'workbooks', title: 'Workbooks', mainCategory: 'english', subCategory: 'foundations' },
  { key: 'ms-science', title: 'MS Science', mainCategory: 'science', subCategory: 'foundations' },
  { key: 'ap-science', title: 'AP Science', mainCategory: 'science', subCategory: 'ap' },
  { key: 'ap-calc', title: 'AP Calculus', mainCategory: 'math', subCategory: 'ap' }
];