// src/data/books.ts
import { Book, MainCategory, ScientificDiscipline, SectionConfig, SubCategory } from '@/types/educational.types';

export const sections: SectionConfig[] = [
  {
    key: 'sat-prep',
    title: 'SAT Preparation',
    mainCategory: 'math',
    subCategory: 'sat',
  },
  {
    key: 'sat-english',
    title: 'SAT English',
    mainCategory: 'english',
    subCategory: 'sat',
  },
  {
    key: 'math-foundations',
    title: 'Math Foundations',
    mainCategory: 'math',
    subCategory: 'foundations',
  },
  {
    key: 'english-foundations',
    title: 'English Foundations',
    mainCategory: 'english',
    subCategory: 'foundations',
  },
  {
    key: 'ap-sciences',
    title: 'AP Sciences',
    mainCategory: 'science',
    subCategory: 'ap',
    disciplines: ['physics', 'chemistry', 'biology'],
  },
];

export const books: Book[] = [
  // SAT Math
  {
    id: 'sat-math-2025',
    title: 'SAT Math Mastery',
    subtitle: 'Complete prep guide with visual learning',
    year: '2025',
    mainCategory: 'math',
    subCategory: 'sat',
    colors: {
      primary: '#1565C0',
      secondary: '#42A5F5',
      accent: '#E3F2FD',
    },
    excerpt: 'Master algebra, geometry, and data analysis through visual problem-solving.',
    description: 'Comprehensive SAT Math preparation with step-by-step visual solutions.',
    learningContent: {
      mathConcepts: [
        {
          id: 'linear-equations',
          topic: 'Linear Equations & Systems',
          formula: {
            symbol: 'ax + by = c',
            name: 'Standard Form',
            latex: 'ax + by = c',
            description: 'General form of linear equation',
          },
          rules: [
            {
              name: 'Substitution Method',
              statement: 'Replace variable in one equation with expression from another',
              symbol: 'y = mx + b → substitute',
            },
            {
              name: 'Elimination Method',
              statement: 'Add/subtract equations to eliminate a variable',
              symbol: '+ or - equations',
            },
          ],
          examples: [
            {
              expression: '2x + 3 = 11',
              solution: 'x = 4',
              steps: ['2x = 11 - 3', '2x = 8', 'x = 4'],
            },
            {
              expression: 'System: x + y = 5, 2x - y = 1',
              solution: 'x = 2, y = 3',
              steps: ['Add equations: 3x = 6', 'x = 2', 'Substitute: 2 + y = 5', 'y = 3'],
            },
          ],
          strategies: [
            {
              title: 'Check Your Answer',
              description: 'Always substitute back into original equation',
              whenToUse: 'After solving any equation',
            },
            {
              title: 'Choose Method Wisely',
              description: 'Use elimination when coefficients are opposites or same',
              whenToUse: 'Solving systems of equations',
            },
          ],
          commonErrors: [
            {
              error: '2x + 3 = 11 → x = 11 - 3',
              correct: '2x + 3 = 11 → 2x = 11 - 3',
              explanation: 'Subtract from both sides before dividing',
            },
          ],
          difficultyLevels: {
            beginner: {
              description: 'Single-step equations',
              examples: [
                { expression: 'x + 5 = 12', solution: 'x = 7' },
                { expression: '3x = 18', solution: 'x = 6' },
              ],
              practiceProblems: ['2x = 10', 'x - 3 = 7', '4x = 20'],
            },
            intermediate: {
              description: 'Multi-step with distribution',
              examples: [
                { expression: '2(x + 3) = 14', solution: 'x = 4' },
                { expression: '3x - 5 = x + 7', solution: 'x = 6' },
              ],
            },
            advanced: {
              description: 'Systems and word problems',
              examples: [
                {
                  expression: 'If 2x + 3y = 12 and x - y = 1, find x and y',
                  solution: 'x = 3, y = 2',
                },
              ],
            },
          },
        },
        {
          id: 'quadratics',
          topic: 'Quadratic Functions',
          formula: {
            symbol: 'x = [-b ± √(b² - 4ac)] / 2a',
            name: 'Quadratic Formula',
            latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
          },
          rules: [
            {
              name: 'Discriminant',
              statement: 'b² - 4ac determines number of real solutions',
              symbol: 'Δ = b² - 4ac',
            },
            {
              name: 'Vertex Form',
              statement: 'f(x) = a(x - h)² + k where (h, k) is vertex',
              symbol: '(h, k) = vertex',
            },
          ],
          examples: [
            {
              expression: 'x² - 5x + 6 = 0',
              solution: 'x = 2 or x = 3',
              steps: ['Factor: (x - 2)(x - 3) = 0', 'x - 2 = 0 or x - 3 = 0', 'x = 2 or x = 3'],
            },
          ],
          strategies: [
            {
              title: 'Try Factoring First',
              description: 'Look for two numbers that multiply to c and add to b',
              whenToUse: 'When a = 1 and b, c are small integers',
            },
          ],
        },
      ],
    },
  },

  // SAT English
  {
    id: 'sat-english-2025',
    title: 'SAT English Excellence',
    subtitle: 'Grammar, reading comprehension, and writing',
    year: '2025',
    mainCategory: 'english',
    subCategory: 'sat',
    colors: {
      primary: '#5E35B1',
      secondary: '#7E57C2',
      accent: '#EDE7F6',
    },
    excerpt: 'Master grammar rules, punctuation, and rhetorical skills.',
    description: 'Complete SAT English preparation with visual grammar guides.',
    learningContent: {
      grammarRules: [
        {
          id: 'comma-usage',
          topic: 'Comma Usage',
          rule: {
            name: 'Comma Rules',
            statement: 'Use commas to separate items, clauses, and nonessential information',
            symbol: ',',
          },
          examples: [
            {
              expression: 'After the rain, the sun appeared.',
              solution: 'Comma after introductory phrase',
            },
            {
              expression: 'My teacher, who has 20 years experience, is retiring.',
              solution: 'Commas around nonessential clause',
            },
          ],
          exceptions: ['No comma with essential clauses', 'No comma between subject and verb'],
          commonErrors: [
            {
              error: 'I went to the store, and bought milk.',
              correct: 'I went to the store and bought milk.',
              explanation: 'No comma needed - same subject',
            },
          ],
        },
      ],
      writingStructures: [
        {
          id: 'paragraph-structure',
          type: 'paragraph',
          components: [
            {
              name: 'Topic Sentence',
              purpose: 'Introduce main idea',
              examples: ['The benefits of exercise extend beyond physical health.'],
            },
            {
              name: 'Supporting Evidence',
              purpose: 'Provide proof and examples',
              examples: ['Studies show...', 'For instance...', 'Research indicates...'],
            },
            {
              name: 'Analysis',
              purpose: 'Explain how evidence supports claim',
              examples: ['This demonstrates that...', 'Therefore...'],
            },
            {
              name: 'Concluding Sentence',
              purpose: 'Wrap up and transition',
              examples: ['Thus, regular exercise improves overall well-being.'],
            },
          ],
          transitions: ['Furthermore', 'However', 'In contrast', 'Similarly', 'Therefore'],
        },
      ],
    },
  },

  // Math Foundations
  {
    id: 'math-foundations-2025',
    title: 'Mathematics Foundations',
    subtitle: 'Build strong algebraic and geometric skills',
    year: '2025',
    mainCategory: 'math',
    subCategory: 'foundations',
    colors: {
      primary: '#00897B',
      secondary: '#26A69A',
      accent: '#E0F2F1',
    },
    excerpt: 'Essential mathematical concepts for high school success.',
    description: 'Master fundamental math concepts with visual learning aids.',
    learningContent: {
      mathConcepts: [
        {
          id: 'fractions-decimals',
          topic: 'Fractions & Decimals',
          rules: [
            {
              name: 'Fraction to Decimal',
              statement: 'Divide numerator by denominator',
              symbol: 'a/b = a ÷ b',
            },
          ],
          examples: [
            {
              expression: '3/4 = ?',
              solution: '0.75',
              steps: ['3 ÷ 4 = 0.75'],
            },
            {
              expression: '0.6 = ?/?',
              solution: '3/5',
              steps: ['0.6 = 6/10', 'Simplify: 6/10 = 3/5'],
            },
          ],
          strategies: [
            {
              title: 'Common Fractions',
              description: 'Memorize: 1/2=0.5, 1/4=0.25, 1/3≈0.33, 1/5=0.2',
              whenToUse: 'Quick mental math',
            },
          ],
        },
      ],
    },
  },

  // AP Physics
  {
    id: 'ap-physics-2025',
    title: 'AP Physics Complete',
    subtitle: 'Mechanics, E&M, and modern physics',
    year: '2025',
    mainCategory: 'science',
    subCategory: 'ap',
    scientificDiscipline: 'physics',
    colors: {
      primary: '#1976D2',
      secondary: '#42A5F5',
      accent: '#E3F2FD',
    },
    excerpt: 'Master AP Physics 1 & 2 with visual problem-solving.',
    description: 'Comprehensive AP Physics guide with step-by-step solutions.',
    learningContent: {
      scienceConcepts: [
        {
          id: 'kinematics',
          topic: 'Kinematics',
          discipline: 'physics',
          principle: 'Motion described by position, velocity, and acceleration',
          formulas: [
            {
              symbol: 'v = v₀ + at',
              name: 'Velocity-Time',
              latex: 'v = v_0 + at',
              units: 'm/s',
            },
            {
              symbol: 'x = x₀ + v₀t + ½at²',
              name: 'Position-Time',
              latex: 'x = x_0 + v_0t + \\frac{1}{2}at^2',
              units: 'm',
            },
          ],
          laws: [
            {
              name: "Newton's First Law",
              statement: 'Object at rest stays at rest unless acted upon by net force',
              symbol: 'ΣF = 0 → a = 0',
            },
          ],
          examples: [
            {
              expression: 'Ball dropped from 45m',
              solution: 't = 3s to hit ground',
              steps: ['y = ½gt²', '45 = ½(10)t²', 't² = 9', 't = 3s'],
            },
          ],
          applications: [
            'Projectile motion',
            'Free fall problems',
            'Collision analysis',
          ],
          labSkills: [
            'Using motion sensors',
            'Video analysis of motion',
            'Creating position-time graphs',
          ],
        },
      ],
    },
  },

  // AP Chemistry
  {
    id: 'ap-chemistry-2025',
    title: 'AP Chemistry Complete',
    subtitle: 'From atoms to thermodynamics',
    year: '2025',
    mainCategory: 'science',
    subCategory: 'ap',
    scientificDiscipline: 'chemistry',
    colors: {
      primary: '#D32F2F',
      secondary: '#F44336',
      accent: '#FFEBEE',
    },
    excerpt: 'Master chemical principles with visual molecular models.',
    description: 'Complete AP Chemistry preparation with lab techniques.',
    learningContent: {
      scienceConcepts: [
        {
          id: 'stoichiometry',
          topic: 'Stoichiometry',
          discipline: 'chemistry',
          principle: 'Quantitative relationships in chemical reactions',
          formulas: [
            {
              symbol: 'n = m/M',
              name: 'Moles Formula',
              units: 'mol',
              description: 'n = moles, m = mass (g), M = molar mass (g/mol)',
            },
          ],
          examples: [
            {
              expression: '2H₂ + O₂ → 2H₂O',
              solution: '2 mol H₂ reacts with 1 mol O₂',
              steps: ['Identify mole ratio: 2:1:2', 'Use ratio for calculations'],
            },
          ],
          applications: [
            'Limiting reagent problems',
            'Percent yield calculations',
            'Solution preparation',
          ],
          labSkills: [
            'Using analytical balance',
            'Volumetric measurements',
            'Titration techniques',
          ],
        },
      ],
    },
  },

  // AP Biology
  {
    id: 'ap-biology-2025',
    title: 'AP Biology Complete',
    subtitle: 'From cells to ecosystems',
    year: '2025',
    mainCategory: 'science',
    subCategory: 'ap',
    scientificDiscipline: 'biology',
    colors: {
      primary: '#388E3C',
      secondary: '#66BB6A',
      accent: '#E8F5E9',
    },
    excerpt: 'Master biological concepts with visual diagrams.',
    description: 'Comprehensive AP Biology guide with lab protocols.',
    learningContent: {
      scienceConcepts: [
        {
          id: 'cellular-respiration',
          topic: 'Cellular Respiration',
          discipline: 'biology',
          principle: 'Cells convert glucose to ATP through oxidation',
          formulas: [
            {
              symbol: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + ATP',
              name: 'Overall Equation',
              description: 'Complete oxidation of glucose',
            },
          ],
          examples: [
            {
              expression: 'Glycolysis',
              solution: '2 ATP net gain',
              steps: ['Glucose → 2 Pyruvate', 'Uses 2 ATP, produces 4 ATP', 'Net: 2 ATP'],
            },
          ],
          applications: [
            'Exercise physiology',
            'Metabolic disorders',
            'Fermentation in industry',
          ],
          labSkills: [
            'Measuring CO₂ production',
            'Using respirometers',
            'Cell fractionation',
          ],
        },
      ],
    },
  },

  // English Foundations
  {
    id: 'english-foundations-2025',
    title: 'English Foundations',
    subtitle: 'Grammar, writing, and literature basics',
    year: '2025',
    mainCategory: 'english',
    subCategory: 'foundations',
    colors: {
      primary: '#6A1B9A',
      secondary: '#AB47BC',
      accent: '#F3E5F5',
    },
    excerpt: 'Build strong English language skills.',
    description: 'Master fundamental English concepts for academic success.',
    learningContent: {
      grammarRules: [
        {
          id: 'parts-of-speech',
          topic: 'Parts of Speech',
          rule: {
            name: 'Eight Parts',
            statement: 'Words classified by function in sentences',
            symbol: 'N, V, Adj, Adv, P, C, I, Pron',
          },
          examples: [
            {
              expression: 'The cat quickly ran.',
              solution: 'The (article), cat (noun), quickly (adverb), ran (verb)',
            },
          ],
          commonErrors: [
            {
              error: 'Using adjective as adverb',
              correct: 'She runs quickly (not quick)',
              explanation: 'Adverbs modify verbs, adjectives modify nouns',
            },
          ],
        },
      ],
      literaryDevices: [
        {
          id: 'metaphor',
          name: 'Metaphor',
          definition: 'Direct comparison without using like or as',
          symbol: 'A = B',
          examples: [
            {
              expression: 'Life is a journey',
              solution: 'Life compared to journey',
            },
          ],
          effect: 'Creates vivid imagery and deeper meaning',
        },
      ],
    },
  },
];

// Helper functions for filtering and searching
export function getBooksByCategory(mainCategory: MainCategory, subCategory?: SubCategory): Book[] {
  return books.filter(book => 
    book.mainCategory === mainCategory && 
    (subCategory ? book.subCategory === subCategory : true)
  );
}

export function getBooksByDiscipline(discipline: ScientificDiscipline): Book[] {
  return books.filter(book => book.scientificDiscipline === discipline);
}

export function searchBooks(query: string): Book[] {
  const lowercaseQuery = query.toLowerCase();
  return books.filter(book => 
    book.title.toLowerCase().includes(lowercaseQuery) ||
    book.excerpt.toLowerCase().includes(lowercaseQuery) ||
    book.description.toLowerCase().includes(lowercaseQuery)
  );
}