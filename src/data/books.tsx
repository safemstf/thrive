// src/data/books.tsx
import React, { ReactNode } from 'react';

export type Category =
  | 'math'
  | 'math-workbook'
  | 'english'
  | 'english-workbook'
  | 'life-science'
  | 'physical-science'
  | 'earth-science'
  | 'ap-physics'
  | 'ap-biology'
  | 'ap-chemistry'
  | 'calculus-ab'
  | 'calculus-bc'
  | 'study-skills';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface LearningContent {
  punctuation?: { mark: string; rule: string; examples: string[]; commonMistakes?: string[] }[];
  tenses?: { name: string; structure?: string; rule?: string; examples: string[]; commonMistakes?: string[] }[];
  grammar?: { topic: string; rule: string; examples: string[]; commonMistakes?: string[] }[];
  mathConcepts?: {
    topic: string;
    rule: string;
    examples: string[];
    strategies?: string[];
    difficultyLevels?: Record<DifficultyLevel, { description: string; examples: string[] }>;
  }[];
  scienceConcepts?: {
    topic: string;
    principle: string;
    examples: string[];
    applications?: string[];
    difficultyLevels?: Record<DifficultyLevel, { description: string; examples: string[] }>;
  }[];
}

export interface Book {
  id: string;
  title: string;
  year: string;
  category: Category;
  colors: { primary: string; secondary: string };
  excerpt: string;
  link?: string;
  description: ReactNode;
  learningContent?: LearningContent;
}

export const books: Book[] = [
  // SAT Guides
  {
    id: 'sat-math-guide',
    title: 'SAT Math Guide',
    year: '2025',
    category: 'math',
    colors: { primary: '#1C3E6E', secondary: '#2A5CA5' },
    excerpt: 'Master algebra, geometry, and data analysis with comprehensive strategies.',
    description: (
      <>
        <p>Master algebra, geometry, and data analysis with targeted practice and proven SAT strategies. This comprehensive guide covers all four SAT Math domains with detailed explanations and step-by-step solutions.</p>
        <p><em>Interactive learning content available with difficulty-based examples!</em></p>
      </>
    ),
    learningContent: {
      mathConcepts: [
        {
          topic: 'Linear Equations and Systems',
          rule: 'Solve for unknown variables using algebraic manipulation. For systems, find values that satisfy all equations simultaneously.',
          examples: [
            'Single equation: 2x + 5 = 13 → 2x = 8 → x = 4',
            'Distribution: 3(x - 2) = 15 → 3x - 6 = 15 → 3x = 21 → x = 7',
            'Multi-step: 4x - 7 = 2x + 9 → 2x = 16 → x = 8',
            'System by elimination: x + y = 5 and 2x - y = 1 → Adding equations: 3x = 6 → x = 2, y = 3',
            'System by substitution: y = 2x + 1 and x + y = 7 → x + (2x + 1) = 7 → 3x = 6 → x = 2, y = 5'
          ],
          strategies: [
            'Isolate the variable by performing the same operations on both sides',
            'Distribute before combining like terms',
            'Use substitution when one equation is already solved for a variable',
            'Use elimination when coefficients can be made opposites easily',
            'Always check your answer by substituting back into original equations'
          ],
          difficultyLevels: {
            easy: {
              description: 'Direct substitution with concrete numbers',
              examples: [
                'If 3x + 7 = 19, what is x?',
                'Solve: 2y - 5 = 11',
                'Find x if 4x + 8 = 24'
              ]
            },
            medium: {
              description: 'Multi-step problems with variables on both sides',
              examples: [
                'If 3x - 4 = 2x + 7, what is x?',
                'Solve: 5(x - 2) = 3x + 6',
                'If ax + b = c, what is x in terms of a, b, and c?'
              ]
            },
            hard: {
              description: 'Abstract systems and parametric equations',
              examples: [
                'If ax + by = c and dx + ey = f, what is x in terms of a, b, c, d, e, f?',
                'For what value of k does the system kx + 3y = 12 and 2x + y = 4 have no solution?',
                'If the system px + qy = r and sx + ty = u has infinitely many solutions, what relationship must exist between the coefficients?'
              ]
            }
          }
        },
        {
          topic: 'Quadratic Functions and Equations',
          rule: 'Functions of the form f(x) = ax² + bx + c. Find zeros using factoring, completing the square, or quadratic formula.',
          examples: [
            'Factoring: x² - 5x + 6 = (x - 2)(x - 3), so zeros are x = 2, 3',
            'Quadratic formula: x² - 6x + 5 = 0 → x = (6 ± √(36-20))/2 = (6 ± 4)/2 → x = 5 or 1',
            'Vertex form: f(x) = 2(x - 3)² + 1 has vertex at (3, 1) and opens upward',
            'Standard to vertex: x² + 4x + 7 = (x + 2)² + 3, vertex at (-2, 3)',
            'Word problem: The height h = -16t² + 64t + 80 reaches maximum when t = -64/(2×-16) = 2 seconds'
          ],
          strategies: [
            'Try factoring first if the leading coefficient is 1 and constant term is small',
            'Complete the square to convert to vertex form: h = -b/(2a), k = f(h)',
            'Use discriminant b² - 4ac to determine the number of real solutions',
            'For word problems, identify what the variable represents and set up the equation carefully',
            'Graph mentally to check if your solution makes sense'
          ],
          difficultyLevels: {
            easy: {
              description: 'Simple factoring with integer solutions',
              examples: [
                'Solve: x² - 9 = 0',
                'Find the zeros of f(x) = x² - 5x + 6',
                'What is the vertex of y = x² - 4x + 3?'
              ]
            },
            medium: {
              description: 'Quadratic formula and completing the square',
              examples: [
                'Solve: 2x² - 7x + 3 = 0',
                'Find the vertex of f(x) = 3x² + 12x - 5',
                'For what values of x is x² - 6x + k = 0 if the discriminant is zero?'
              ]
            },
            hard: {
              description: 'Abstract quadratics and parametric analysis',
              examples: [
                'If ax² + bx + c = 0 has roots r and s, express r + s and rs in terms of a, b, c',
                'For what values of k does kx² - (k+2)x + 1 = 0 have real solutions?',
                'If f(x) = ax² + bx + c and f(p) = f(q) where p ≠ q, what is the x-coordinate of the vertex in terms of p and q?'
              ]
            }
          }
        },
        {
          topic: 'Functions and Their Properties',
          rule: 'A function assigns exactly one output to each input. Understand domain, range, and transformations.',
          examples: [
            'Function notation: If f(x) = 2x + 3, then f(5) = 2(5) + 3 = 13',
            'Domain restriction: f(x) = 1/(x-2) has domain x ≠ 2',
            'Composition: If f(x) = x² and g(x) = x + 1, then f(g(x)) = (x+1)²',
            'Transformation: g(x) = f(x-2) + 3 shifts f(x) right 2 units and up 3 units',
            'Inverse functions: If f(x) = 2x + 1, then f⁻¹(x) = (x-1)/2'
          ],
          strategies: [
            'For domain, identify values that make denominators zero or expressions under square roots negative',
            'For range, consider the function\'s behavior and any restrictions',
            'When composing functions, work from the inside out',
            'For transformations: f(x-h) shifts right h, f(x)+k shifts up k',
            'To find inverse, swap x and y, then solve for y'
          ],
          difficultyLevels: {
            easy: {
              description: 'Basic function evaluation with concrete values',
              examples: [
                'If f(x) = 3x + 5, what is f(4)?',
                'What is the domain of f(x) = x + 7?',
                'If g(x) = x², what is g(-3)?'
              ]
            },
            medium: {
              description: 'Function composition and transformations',
              examples: [
                'If f(x) = x² and g(x) = 2x + 1, what is f(g(x))?',
                'What is the domain of h(x) = √(x - 3)?',
                'How is g(x) = f(x - 2) + 5 related to f(x)?'
              ]
            },
            hard: {
              description: 'Abstract function properties and inverse relationships',
              examples: [
                'If f(g(x)) = x for all x in the domain, what can you conclude about f and g?',
                'If f(x) = ax + b and f⁻¹(3) = 7, and f⁻¹(1) = 5, find a and b',
                'For what values of k does f(x) = (kx + 1)/(x - k) have an inverse function?'
              ]
            }
          }
        },
        {
          topic: 'Exponential and Logarithmic Functions',
          rule: 'Exponential functions have the form f(x) = a·bˣ. Logarithms are the inverse of exponentials.',
          examples: [
            'Growth: If P(t) = 1000(1.05)ᵗ, population grows by 5% each year',
            'Decay: A(t) = 100(0.5)ᵗ represents half-life decay',
            'Logarithm properties: log₂(8) = 3 because 2³ = 8',
            'Change of base: log₃(x) = ln(x)/ln(3)',
            'Solving exponential: 2ˣ = 32 → x = 5 or using logs: x·ln(2) = ln(32)'
          ],
          strategies: [
            'For exponential growth/decay, identify the base (1+r for growth, 1-r for decay)',
            'Convert between exponential and logarithmic forms: bˣ = y ⟺ log_b(y) = x',
            'Use properties of logarithms to simplify: log(ab) = log(a) + log(b)',
            'For equations, take the logarithm of both sides if the variable is in the exponent',
            'Check answers in the original equation, especially when using logarithms'
          ],
          difficultyLevels: {
            easy: {
              description: 'Basic exponential evaluation and simple logarithms',
              examples: [
                'What is 2⁴?',
                'If log₃(x) = 2, what is x?',
                'What is log₁₀(100)?'
              ]
            },
            medium: {
              description: 'Growth/decay problems and logarithm properties',
              examples: [
                'If a population doubles every 3 years and starts at 200, what is it after 9 years?',
                'Solve: 3ˣ = 27',
                'What is log₂(8) + log₂(4)?'
              ]
            },
            hard: {
              description: 'Abstract exponential relationships and complex logarithmic equations',
              examples: [
                'If aˣ = b^y and both equal c, express x in terms of a, b, y, and c',
                'For what value of k do the equations y = 2ˣ and y = kx + 3 have exactly one intersection?',
                'If log_a(x) + log_a(y) = log_a(z), what is the relationship between x, y, and z?'
              ]
            }
          }
        },
        {
          topic: 'Geometry and Trigonometry',
          rule: 'Apply geometric relationships and trigonometric ratios to solve problems involving triangles, circles, and coordinate geometry.',
          examples: [
            'Pythagorean theorem: In a right triangle with legs 3 and 4, hypotenuse = √(3² + 4²) = 5',
            'Circle equation: (x-2)² + (y+1)² = 25 has center (2,-1) and radius 5',
            'Trigonometry: In a right triangle, sin(30°) = 1/2, cos(30°) = √3/2, tan(30°) = 1/√3',
            'Area formulas: Triangle = ½bh, Circle = πr², Sector = ½r²θ (θ in radians)',
            'Distance formula: d = √[(x₂-x₁)² + (y₂-y₁)²] between points (x₁,y₁) and (x₂,y₂)'
          ],
          strategies: [
            'Draw diagrams for all geometry problems to visualize relationships',
            'Memorize special right triangle ratios: 30-60-90 and 45-45-90',
            'For circles, identify center and radius from standard form (x-h)² + (y-k)² = r²',
            'Use SOH-CAH-TOA for basic trigonometric ratios',
            'Convert between degrees and radians: 180° = π radians'
          ],
          difficultyLevels: {
            easy: {
              description: 'Basic geometric calculations with given measurements',
              examples: [
                'What is the area of a triangle with base 6 and height 8?',
                'Find the distance between points (1, 2) and (4, 6)',
                'What is the circumference of a circle with radius 5?'
              ]
            },
            medium: {
              description: 'Multi-step problems involving geometric relationships',
              examples: [
                'A right triangle has legs of length x and x+3. If the hypotenuse is 15, find x',
                'What is the equation of a circle with center (-2, 3) and radius 4?',
                'In a 30-60-90 triangle, if the shortest side is 5, what is the hypotenuse?'
              ]
            },
            hard: {
              description: 'Abstract geometric relationships and parametric problems',
              examples: [
                'If a circle has equation x² + y² + Dx + Ey + F = 0, what are the center and radius in terms of D, E, F?',
                'For what value of k do the circles x² + y² = 25 and (x-k)² + y² = 9 intersect at exactly one point?',
                'If triangle ABC has sides of length a, b, and c, what is the area in terms of these sides? (Heron\'s formula)'
              ]
            }
          }
        },
        {
          topic: 'Data Analysis and Statistics',
          rule: 'Interpret data displays, calculate measures of center and spread, and understand probability concepts.',
          examples: [
            'Mean vs. median: For data set {2, 3, 3, 7, 15}, mean = 6, median = 3',
            'Standard deviation: Measures spread; smaller values indicate data closer to mean',
            'Correlation: r = 0.8 indicates strong positive linear relationship',
            'Probability: P(A or B) = P(A) + P(B) - P(A and B) for any events A, B',
            'Normal distribution: About 68% of data falls within 1 standard deviation of mean'
          ],
          strategies: [
            'Identify outliers and consider their effect on mean vs. median',
            'For scatter plots, look for patterns in data and strength of correlation',
            'Distinguish between correlation and causation in data interpretation',
            'For probability, use tree diagrams or tables to organize information',
            'Pay attention to sample size and sampling methods when interpreting results'
          ],
          difficultyLevels: {
            easy: {
              description: 'Basic calculations with small data sets',
              examples: [
                'Find the mean of: 4, 6, 8, 10, 12',
                'What is the median of: 3, 7, 2, 9, 5?',
                'If you flip a coin twice, what\'s the probability of getting two heads?'
              ]
            },
            medium: {
              description: 'Data interpretation and probability with conditions',
              examples: [
                'A data set has mean 50 and standard deviation 10. What percentage of data falls between 40 and 60?',
                'If P(A) = 0.3 and P(B) = 0.4 and P(A and B) = 0.1, what is P(A or B)?',
                'Which measure of center is most appropriate for a highly skewed distribution?'
              ]
            },
            hard: {
              description: 'Complex statistical relationships and abstract probability',
              examples: [
                'If a sample has mean μ and standard deviation σ, what happens to these values if every data point is transformed by ax + b?',
                'For events A and B, if P(A|B) = 0.8 and P(B) = 0.3, what is P(A and B)?',
                'How does sample size affect the margin of error in a confidence interval?'
              ]
            }
          }
        }
      ]
    }
  },
  {
    id: 'sat-english-guide',
    title: 'SAT English Guide',
    year: '2025',
    category: 'english',
    colors: { primary: '#4B2D83', secondary: '#6B4199' },
    excerpt: 'Master reading comprehension, writing strategies, and grammar rules.',
    description: (
      <>
        <p>Master reading comprehension, writing strategies, and grammar rules with SAT-focused techniques. This comprehensive guide covers both the Reading and Writing sections with proven strategies for success.</p>
        <p><em>Interactive learning content available with difficulty-based examples!</em></p>
      </>
    ),
    learningContent: {
      grammar: [
        {
          topic: 'Comma Usage and Rules',
          rule: 'Use commas to separate elements, prevent misreading, and follow standard conventions for clarity.',
          examples: [
            'Introductory elements: After studying for hours, Maria felt confident about the exam.',
            'Series (Oxford comma): The recipe calls for flour, sugar, eggs, and butter.',
            'Nonessential information: My teacher, who has taught for twenty years, announced her retirement.',
            'Coordinate adjectives: The large, comfortable chair was perfect for reading.',
            'Before coordinating conjunctions: She studied hard, yet she still felt nervous about the test.',
            'Direct address: Sarah, please turn in your assignment.',
            'Contrasting elements: The solution was simple, not complicated.'
          ],
          commonMistakes: [
            'Missing comma after long introductory phrases or clauses',
            'Comma splice: joining two independent clauses with only a comma',
            'Missing commas around nonessential relative clauses',
            'Unnecessary commas with essential information that restricts meaning',
            'Missing comma before coordinating conjunctions in compound sentences'
          ]
        },
        {
          topic: 'Pronoun-Antecedent Agreement',
          rule: 'Pronouns must agree with their antecedents in number, person, and gender. Antecedents must be clear and unambiguous.',
          examples: [
            'Singular indefinite pronouns: Each student must submit his or her assignment on time.',
            'Plural antecedents: The committee members expressed their concerns about the proposal.',
            'Compound antecedents joined by "and": Tom and Jerry brought their lunch to school.',
            'Compound antecedents joined by "or": Either Sarah or her friends will bring their car.',
            'Collective nouns: The team celebrated its victory. (team as unit)',
            'Modern usage: Everyone should do their best work. (increasingly accepted)',
            'Clear reference: When John spoke to Mark, he (John) seemed confident.'
          ],
          commonMistakes: [
            'Using plural pronouns with singular indefinite pronouns like "everyone," "somebody," "each"',
            'Ambiguous pronoun reference where it\'s unclear which noun the pronoun refers to',
            'Agreement errors with compound subjects joined by "or" or "nor"',
            'Using "they" to refer to singular nouns in formal writing',
            'Forgetting that collective nouns can be singular or plural depending on context'
          ]
        },
        {
          topic: 'Parallel Structure and Consistency',
          rule: 'Items in a series, comparisons, and correlative constructions must maintain the same grammatical form.',
          examples: [
            'Simple series: She enjoys reading, writing, and jogging.',
            'Complex series: The job requires attention to detail, ability to work independently, and strong communication skills.',
            'Correlative conjunctions: He not only studied hard but also attended every review session.',
            'Comparisons: Swimming is more enjoyable than running. (not "to run")',
            'After prepositions: She succeeded by working hard and staying focused.',
            'In instructions: To complete the project, analyze the data, identify patterns, and write conclusions.',
            'With infinitives: I want to read, to write, and to learn.'
          ],
          commonMistakes: [
            'Mixing verb forms in series: "running, to swim, and biked"',
            'Breaking parallelism in correlative conjunctions: "either...or," "not only...but also"',
            'Inconsistent structure in comparisons and contrasts',
            'Mixing gerunds and infinitives inappropriately',
            'Failing to maintain parallel structure in complex lists or instructions'
          ]
        },
        {
          topic: 'Subject-Verb Agreement',
          rule: 'Singular subjects require singular verbs; plural subjects require plural verbs. Agreement depends on the actual subject, not intervening words.',
          examples: [
            'Basic agreement: The student studies hard. The students study together.',
            'Intervening phrases: The box of old books is heavy. (subject is "box," not "books")',
            'Compound subjects with "and": Tom and Jerry are best friends.',
            'Compound subjects with "or": Either the teacher or the students are responsible.',
            'Indefinite pronouns: Each of the assignments requires careful attention.',
            'Collective nouns: The team is playing well. (team as unit)',
            'Inverted sentences: There are several reasons for this decision.',
            'Relative pronouns: She is one of the students who work hardest.'
          ],
          commonMistakes: [
            'Being confused by intervening prepositional phrases',
            'Treating compound subjects joined by "and" as singular',
            'Incorrect agreement with indefinite pronouns like "each," "every," "neither"',
            'Confusion with collective nouns (team, family, group)',
            'Agreement errors in inverted sentences beginning with "there" or "here"'
          ]
        },
        {
          topic: 'Modifier Placement and Clarity',
          rule: 'Place modifiers as close as possible to the words they modify to ensure clarity and avoid ambiguity.',
          examples: [
            'Participial phrases: Walking to school, Sarah saw a rainbow. (Sarah was walking)',
            'Relative clauses: The student who studied hardest received the highest grade.',
            'Prepositional phrases: The book on the table belongs to me.',
            'Limiting modifiers: Only three students passed the exam. (exactly three)',
            'Adverb placement: She almost ate the entire pizza. (she nearly ate it all)',
            'Infinitive phrases: To succeed in college, students must develop good study habits.',
            'Appositives: Dr. Smith, the department chair, will lead the meeting.'
          ],
          commonMistakes: [
            'Dangling modifiers: "Walking to school, the rainbow appeared" (rainbow can\'t walk)',
            'Misplaced limiting modifiers like "only," "just," "nearly," "almost"',
            'Squinting modifiers that could modify words on either side',
            'Ambiguous pronoun references that create confusion',
            'Misplaced prepositional phrases that create unintended meanings'
          ]
        },
        {
          topic: 'Sentence Structure and Boundaries',
          rule: 'Every complete sentence needs a subject and predicate. Avoid fragments, comma splices, and run-on sentences.',
          examples: [
            'Simple sentence: She studied hard.',
            'Compound sentence: She studied hard, so she passed the exam.',
            'Complex sentence: Because she studied hard, she passed the exam.',
            'Compound-complex: Although she was nervous, she studied hard, and she passed the exam.',
            'Correct fragment fix: "After finishing her homework" → "After finishing her homework, she watched TV."',
            'Comma splice fix: "It was raining, we stayed inside" → "It was raining, so we stayed inside."',
            'Run-on fix: "She studied she passed" → "She studied hard and passed the exam."'
          ],
          commonMistakes: [
            'Sentence fragments: incomplete thoughts punctuated as complete sentences',
            'Comma splices: joining independent clauses with only a comma',
            'Fused sentences: running independent clauses together without proper punctuation',
            'Treating dependent clauses as complete sentences',
            'Overusing coordinating conjunctions, creating overly long sentences'
          ]
        }
      ]
    }
  },

  // Middle School Science Workbooks
  {
    id: 'life-science-ms',
    title: 'Life Science Workbook',
    year: '2024',
    category: 'life-science',
    colors: { primary: '#2E7D32', secondary: '#43A047' },
    excerpt: 'Explore cells, ecosystems, heredity, and biological processes.',
    description: (
      <>
        <p>Comprehensive exploration of living organisms and biological processes. Master fundamental concepts in cell biology, genetics, ecology, and evolution with hands-on activities and real-world applications.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      scienceConcepts: [
        {
          topic: 'Cell Structure and Function',
          principle: 'All living things are made of cells, which are the basic units of life. Different cell parts have specific functions.',
          examples: [
            'Plant cells have cell walls, chloroplasts, and large vacuoles that animal cells lack.',
            'The nucleus controls cell activities and contains DNA.',
            'Mitochondria produce energy (ATP) for cellular processes.',
            'Ribosomes make proteins using instructions from DNA.',
            'The cell membrane controls what enters and exits the cell.'
          ],
          applications: [
            'Understanding how diseases affect specific cell organelles',
            'Explaining why plants can make their own food but animals cannot',
            'Comparing single-celled organisms to multicellular organisms',
            'Relating cell specialization to tissue and organ function'
          ]
        },
        {
          topic: 'Genetics and Heredity',
          principle: 'Traits are passed from parents to offspring through genes. Genetic variation occurs through sexual reproduction and mutations.',
          examples: [
            'Dominant traits (brown eyes) mask recessive traits (blue eyes) in heterozygotes.',
            'Punnett squares predict the probability of offspring traits.',
            'Some traits are controlled by multiple genes (height, skin color).',
            'Chromosomes carry genes, and humans have 23 pairs of chromosomes.',
            'DNA mutations can be harmful, helpful, or neutral.'
          ],
          applications: [
            'Predicting the likelihood of genetic disorders in families',
            'Understanding selective breeding in agriculture',
            'Explaining genetic diversity in populations',
            'Connecting DNA evidence to forensic investigations'
          ]
        },
        {
          topic: 'Ecosystems and Energy Flow',
          principle: 'Energy flows through ecosystems in one direction, while matter cycles. Organisms interact in complex food webs.',
          examples: [
            'Producers (plants) capture solar energy through photosynthesis.',
            'Primary consumers (herbivores) eat producers; secondary consumers eat primary consumers.',
            'Decomposers break down dead organisms, recycling nutrients.',
            'Energy decreases at each trophic level (10% rule).',
            'Food webs show interconnected feeding relationships.'
          ],
          applications: [
            'Analyzing the effects of removing species from ecosystems',
            'Understanding human impact on food chains',
            'Explaining population changes in predator-prey relationships',
            'Connecting climate change to ecosystem disruption'
          ]
        },
        {
          topic: 'Evolution and Natural Selection',
          principle: 'Species change over time through natural selection. Individuals with advantageous traits are more likely to survive and reproduce.',
          examples: [
            'Darwin\'s finches developed different beak shapes based on available food sources.',
            'Industrial melanism in peppered moths during pollution periods.',
            'Antibiotic resistance in bacteria demonstrates rapid evolution.',
            'Fossil records show gradual changes in species over millions of years.',
            'Homologous structures (whale fins, bat wings, human arms) indicate common ancestry.'
          ],
          applications: [
            'Understanding why we need new flu vaccines each year',
            'Explaining biodiversity and species adaptation',
            'Connecting extinction events to environmental changes',
            'Understanding conservation efforts and endangered species protection'
          ]
        }
      ]
    }
  },
  {
    id: 'physical-science-ms',
    title: 'Physical Science Workbook',
    year: '2024',
    category: 'physical-science',
    colors: { primary: '#0C3B2E', secondary: '#136F63' },
    excerpt: 'Master forces, energy, matter, and chemical reactions.',
    description: (
      <>
        <p>Master fundamental concepts of physics and chemistry including forces, energy, atomic structure, and chemical reactions. Build problem-solving skills with practical examples and laboratory connections.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      scienceConcepts: [
        {
          topic: 'Forces and Motion',
          principle: 'Forces cause changes in motion. Newton\'s laws describe the relationship between forces, mass, and acceleration.',
          examples: [
            'An object at rest stays at rest unless acted upon by an unbalanced force (Newton\'s 1st Law).',
            'Force = mass × acceleration (F = ma, Newton\'s 2nd Law).',
            'For every action, there is an equal and opposite reaction (Newton\'s 3rd Law).',
            'Friction opposes motion and depends on surface texture and normal force.',
            'Gravity pulls objects toward Earth with a force of 9.8 m/s² acceleration.'
          ],
          applications: [
            'Designing safer cars using crumple zones and airbags',
            'Calculating the force needed to move objects of different masses',
            'Understanding why rockets work in space (Newton\'s 3rd Law)',
            'Explaining why objects fall at the same rate in a vacuum'
          ]
        },
        {
          topic: 'Energy and Energy Transformations',
          principle: 'Energy cannot be created or destroyed, only transformed from one form to another. Different forms of energy can do work.',
          examples: [
            'Kinetic energy = ½mv² depends on mass and velocity.',
            'Potential energy = mgh depends on mass, gravity, and height.',
            'Chemical energy in food converts to kinetic energy in muscles.',
            'Electrical energy transforms to light energy in bulbs.',
            'Heat always flows from hot objects to cold objects.'
          ],
          applications: [
            'Analyzing energy efficiency in machines and devices',
            'Understanding how power plants convert various energy sources to electricity',
            'Explaining why perpetual motion machines are impossible',
            'Calculating energy costs for household appliances'
          ]
        },
        {
          topic: 'Atomic Structure and Chemical Reactions',
          principle: 'All matter is made of atoms. Chemical reactions involve rearranging atoms to form new compounds with different properties.',
          examples: [
            'Atoms contain protons (positive), neutrons (neutral), and electrons (negative).',
            'Elements are defined by their number of protons (atomic number).',
            'Chemical bonds form when atoms share or transfer electrons.',
            'In chemical reactions, atoms are rearranged but not created or destroyed.',
            'Balancing equations: 2H₂ + O₂ → 2H₂O shows conservation of mass.'
          ],
          applications: [
            'Understanding how different elements combine to form compounds',
            'Explaining why some materials conduct electricity and others don\'t',
            'Predicting products of simple chemical reactions',
            'Connecting atomic structure to the periodic table organization'
          ]
        }
      ]
    }
  },
  {
    id: 'earth-science-ms',
    title: 'Earth Science Workbook',
    year: '2024',
    category: 'earth-science',
    colors: { primary: '#37474F', secondary: '#546E7A' },
    excerpt: 'Investigate rocks, weather patterns, and Earth systems.',
    description: (
      <>
        <p>Explore Earth\'s systems including geology, meteorology, oceanography, and astronomy. Understand how Earth\'s processes shape our planet and affect human life.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      scienceConcepts: [
        {
          topic: 'Rock Cycle and Geological Processes',
          principle: 'Rocks form through different processes and can transform from one type to another through the rock cycle.',
          examples: [
            'Igneous rocks form from cooled magma or lava (granite, basalt).',
            'Sedimentary rocks form from compressed sediments (sandstone, limestone).',
            'Metamorphic rocks form from heat and pressure (marble from limestone, slate from shale).',
            'Weathering breaks down rocks; erosion transports the pieces.',
            'Plate tectonics drives mountain building, earthquakes, and volcanism.'
          ],
          applications: [
            'Identifying rock types based on formation processes and characteristics',
            'Understanding how fossils form and what they tell us about Earth\'s history',
            'Explaining why certain areas are prone to earthquakes and volcanic activity',
            'Connecting soil formation to rock weathering and climate'
          ]
        },
        {
          topic: 'Weather and Climate Systems',
          principle: 'Weather is caused by the movement of air masses and energy from the sun. Climate is long-term weather patterns.',
          examples: [
            'Warm air rises and cool air sinks, creating wind patterns.',
            'Water cycle: evaporation, condensation, precipitation, and runoff.',
            'High pressure systems bring clear weather; low pressure brings storms.',
            'Fronts form where different air masses meet, often causing weather changes.',
            'Climate zones depend on latitude, altitude, and proximity to water bodies.'
          ],
          applications: [
            'Reading weather maps and making short-term weather predictions',
            'Understanding how climate change affects weather patterns globally',
            'Explaining why deserts form at certain latitudes',
            'Connecting ocean currents to regional climate patterns'
          ]
        },
        {
          topic: 'Solar System and Universe',
          principle: 'Earth is part of the solar system, which is part of the Milky Way galaxy. Gravity governs the motion of celestial objects.',
          examples: [
            'Planets orbit the sun due to gravitational attraction.',
            'Moon phases result from the Moon\'s changing position relative to Earth and Sun.',
            'Seasons occur because Earth\'s axis is tilted 23.5° from vertical.',
            'Stars form from collapsing gas clouds and produce energy through nuclear fusion.',
            'Light-years measure astronomical distances; the nearest star is 4.2 light-years away.'
          ],
          applications: [
            'Predicting tides based on Moon phases and positions',
            'Understanding why we have leap years and varying day lengths',
            'Explaining how scientists determine the age and composition of stars',
            'Connecting space exploration to technological advances on Earth'
          ]
        }
      ]
    }
  },

  // High School Math Workbooks
  {
    id: 'geometry-workbook',
    title: 'Geometry Essentials Workbook',
    year: '2025',
    category: 'math-workbook',
    colors: { 
      primary: '#D32F2F', 
      secondary: '#F44336' 
    },
    excerpt: 'Proofs, area, volume, and coordinate geometry mastery.',
    description: (
      <>
        <p>Master geometric concepts through visual learning and rigorous proof practice. Build spatial reasoning skills essential for advanced mathematics.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      mathConcepts: [
        {
          topic: 'Triangle Congruence and Similarity',
          rule: 'Triangles are congruent if corresponding sides and angles are equal. Similar triangles have proportional sides and equal angles.',
          examples: [
            'SSS: If all three sides are equal, triangles are congruent',
            'SAS: If two sides and included angle are equal, triangles are congruent',
            'ASA: If two angles and included side are equal, triangles are congruent',
            'AA~: If two angles are equal, triangles are similar',
            'Scale factor of 3:1 means corresponding sides are in ratio 3:1'
          ],
          strategies: [
            'Draw and label diagrams clearly',
            'Identify given information and what needs to be proven',
            'Use properties of parallel lines and transversals',
            'Apply proportional reasoning for similar triangles'
          ]
        },
        {
          topic: 'Circle Theorems',
          rule: 'Angles, arcs, and chords in circles follow specific relationships based on their positions.',
          examples: [
            'Central angle = intercepted arc measure',
            'Inscribed angle = ½ intercepted arc measure',
            'Angles in same segment are equal',
            'Tangent perpendicular to radius at point of contact',
            'Power of point: PA × PB = PC × PD for secants from external point'
          ],
          strategies: [
            'Identify angle types: central, inscribed, or formed by tangents/secants',
            'Use arc addition and subtraction',
            'Apply inscribed quadrilateral properties',
            'Connect chord and tangent relationships'
          ]
        },
        {
          topic: 'Area and Volume Formulas',
          rule: 'Surface area and volume calculations depend on shape properties and dimensional relationships.',
          examples: [
            'Triangle: A = ½bh, A = ½ab sin C, A = √[s(s-a)(s-b)(s-c)] (Heron\'s)',
            'Circle: A = πr², C = 2πr',
            'Cylinder: V = πr²h, SA = 2πr² + 2πrh',
            'Sphere: V = (4/3)πr³, SA = 4πr²',
            'Pyramid: V = (1/3)Bh where B is base area'
          ],
          strategies: [
            'Break complex shapes into simpler components',
            'Use unit conversions carefully',
            'Visualize 3D shapes through cross-sections',
            'Check answers for reasonableness'
          ]
        }
      ]
    }
  },
  {
    id: 'precalculus-workbook',
    title: 'Pre-Calculus Prep Workbook',
    year: '2025',
    category: 'math-workbook',
    colors: { 
      primary: '#7B1FA2', 
      secondary: '#9C27B0' 
    },
    excerpt: 'Functions, trigonometry, and analytical geometry.',
    description: (
      <>
        <p>Bridge algebra and calculus with comprehensive coverage of functions, trigonometry, and analytical geometry. Essential preparation for calculus success.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      mathConcepts: [
        {
          topic: 'Function Transformations',
          rule: 'Functions can be transformed through vertical/horizontal shifts, stretches, compressions, and reflections.',
          examples: [
            'f(x) + k: vertical shift up k units',
            'f(x - h): horizontal shift right h units',
            'af(x): vertical stretch by factor |a|, reflection if a < 0',
            'f(bx): horizontal compression by factor 1/|b|, reflection if b < 0',
            'f(x) = 2(x - 3)² + 1: parabola shifted right 3, up 1, stretched by 2'
          ],
          strategies: [
            'Identify parent function first',
            'Apply transformations in order: horizontal shift, stretch/compress, vertical shift',
            'Use key points to verify transformations',
            'Graph parent function, then apply each transformation step by step'
          ]
        },
        {
          topic: 'Trigonometric Identities',
          rule: 'Fundamental relationships between trigonometric functions that are true for all valid angle measures.',
          examples: [
            'Pythagorean: sin²θ + cos²θ = 1, tan²θ + 1 = sec²θ',
            'Double angle: sin(2θ) = 2sin(θ)cos(θ), cos(2θ) = cos²θ - sin²θ',
            'Sum formulas: sin(A + B) = sin(A)cos(B) + cos(A)sin(B)',
            'Half angle: sin²(θ/2) = (1 - cos(θ))/2',
            'Product-to-sum: sin(A)cos(B) = ½[sin(A+B) + sin(A-B)]'
          ],
          strategies: [
            'Memorize fundamental identities thoroughly',
            'Work with one side of equation at a time',
            'Factor and use substitution strategically',
            'Convert everything to sines and cosines when stuck'
          ]
        },
        {
          topic: 'Polynomial and Rational Functions',
          rule: 'Polynomial behavior is determined by degree and leading coefficient. Rational functions have asymptotes.',
          examples: [
            'f(x) = x³ - 2x² - x + 2: cubic with 3 real roots',
            'End behavior: as x → ±∞, f(x) → +∞ (positive leading coefficient)',
            'f(x) = (x² - 4)/(x - 2) = x + 2 for x ≠ 2 (removable discontinuity)',
            'f(x) = 1/(x - 3): vertical asymptote at x = 3, horizontal at y = 0',
            'f(x) = (2x² + 1)/(x² - 1): horizontal asymptote at y = 2'
          ],
          strategies: [
            'Factor polynomials completely to find zeros',
            'Use synthetic division for polynomial long division',
            'Identify asymptotes before graphing rational functions',
            'Check behavior near asymptotes and critical points'
          ]
        }
      ]
    }
  },

  // English Literature Workbooks
  {
    id: 'literature-analysis-workbook',
    title: 'Literature Analysis Workbook',
    year: '2025',
    category: 'english-workbook',
    colors: { 
      primary: '#2E5D31', 
      secondary: '#4CAF50' 
    },
    excerpt: 'Literary devices, themes, and critical analysis skills.',
    description: (
      <>
        <p>Develop sophisticated literary analysis skills through close reading of poetry, prose, and drama. Master literary devices and critical writing techniques.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      grammar: [
        {
          topic: 'Literary Device Identification',
          rule: 'Recognize and analyze how authors use literary techniques to create meaning, mood, and effect.',
          examples: [
            'Metaphor: "Life is a journey" - direct comparison without "like" or "as"',
            'Symbolism: Green light in Gatsby represents hope and the American Dream',
            'Irony: "What a beautiful day for a picnic," she said as it started to rain',
            'Foreshadowing: Early hints about Romeo and Juliet being "star-crossed lovers"',
            'Alliteration: "Peter Piper picked a peck of pickled peppers"'
          ],
          commonMistakes: [
            'Confusing metaphor and simile',
            'Over-interpreting: not every detail is symbolic',
            'Missing the difference between dramatic, situational, and verbal irony'
          ]
        },
        {
          topic: 'Theme Analysis',
          rule: 'Themes are universal messages or central ideas that authors explore throughout their works.',
          examples: [
            'Coming of age: Scout\'s moral development in "To Kill a Mockingbird"',
            'Power and corruption: Macbeth\'s transformation from hero to tyrant',
            'Social class: Elizabeth and Darcy overcoming prejudice in "Pride and Prejudice"',
            'Nature vs. nurture: Questions of identity in "Frankenstein"',
            'Individual vs. society: Hester Prynne\'s struggle in "The Scarlet Letter"'
          ],
          commonMistakes: [
            'Confusing theme with plot summary',
            'Stating themes too specifically rather than universally',
            'Not supporting thematic claims with textual evidence'
          ]
        },
        {
          topic: 'Character Development Analysis',
          rule: 'Analyze how characters change throughout a work and what drives their transformation.',
          examples: [
            'Dynamic character: Elizabeth Bennet learns to overcome first impressions',
            'Static character: Atticus Finch maintains consistent moral principles',
            'Protagonist vs. antagonist: Sometimes the same character (internal conflict)',
            'Character foil: Benvolio\'s calm nature highlights Romeo\'s impulsiveness',
            'Round character: Complex, multifaceted like real people'
          ],
          commonMistakes: [
            'Focusing only on what characters do, not why they change',
            'Not distinguishing between character types and their functions',
            'Failing to connect character development to theme'
          ]
        }
      ]
    }
  },
  {
    id: 'essay-writing-workbook',
    title: 'Academic Essay Writing Workbook',
    year: '2025',
    category: 'english-workbook',
    colors: { 
      primary: '#5D4037', 
      secondary: '#8D6E63' 
    },
    excerpt: 'Thesis development, argumentation, and research skills.',
    description: (
      <>
        <p>Master academic writing through structured practice in thesis development, evidence integration, and persuasive argumentation.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      grammar: [
        {
          topic: 'Thesis Statement Construction',
          rule: 'A strong thesis makes a specific, arguable claim that can be supported with evidence throughout the essay.',
          examples: [
            'Weak: "Shakespeare wrote many plays." Strong: "Shakespeare\'s use of soliloquies in Hamlet reveals the protagonist\'s psychological complexity."',
            'Weak: "Social media is bad." Strong: "Excessive social media use among teenagers correlates with increased rates of anxiety and depression."',
            'Weak: "This essay will discuss climate change." Strong: "Immediate action on carbon emissions is essential to prevent catastrophic climate change within the next decade."',
            'Literary analysis: "Through symbolism and characterization, Steinbeck\'s Of Mice and Men illustrates how the American Dream remains unattainable for society\'s most vulnerable."',
            'Argumentative: "Schools should implement later start times because research demonstrates that adolescent sleep patterns improve academic performance and mental health."'
          ],
          commonMistakes: [
            'Making statements that are too broad or too narrow',
            'Presenting facts instead of arguable claims',
            'Writing announcements instead of position statements'
          ]
        },
        {
          topic: 'Evidence Integration and Citation',
          rule: 'Incorporate sources smoothly through quotation, paraphrase, and summary while maintaining proper attribution.',
          examples: [
            'Signal phrase + quote: According to researcher Jane Smith, "Students who start school later show a 15% improvement in test scores" (45).',
            'Embedded quote: The study reveals that later start times lead to "significant improvements in both attendance and academic performance" (Smith 45).',
            'Paraphrase: Smith\'s research indicates that delayed school schedules benefit student learning outcomes (45).',
            'Block quote: For quotations longer than 4 lines, indent and don\'t use quotation marks.',
            'Synthesis: While Smith argues for later start times (45), Johnson contends that schedule changes create logistical challenges (78).'
          ],
          commonMistakes: [
            'Dropping quotes without introduction or analysis',
            'Over-quoting instead of paraphrasing',
            'Incorrect citation format',
            'Failing to explain how evidence supports the argument'
          ]
        },
        {
          topic: 'Paragraph Structure and Transitions',
          rule: 'Each paragraph should focus on one main idea with clear topic sentences and smooth connections between ideas.',
          examples: [
            'Topic sentence: "The first benefit of later school start times is improved academic performance."',
            'Transition words: Furthermore, however, in contrast, as a result, similarly, for instance',
            'Bridge sentences: "While academic benefits are significant, the health advantages are equally compelling."',
            'Concluding sentences that connect back to thesis: "These academic improvements directly support the argument for policy change."',
            'PEAL structure: Point, Evidence, Analysis, Link back to thesis'
          ],
          commonMistakes: [
            'Paragraphs without clear focus or topic sentences',
            'Abrupt transitions that don\'t show logical connections',
            'Paragraphs that are too short or excessively long',
            'Failing to connect paragraph content back to main argument'
          ]
        }
      ]
    }
  },


  // Study Skills and Organization
  {
    id: 'study-skills-guide',
    title: 'Academic Success Study Guide',
    year: '2025',
    category: 'study-skills',
    colors: { 
      primary: '#5E35B1', 
      secondary: '#7E57C2' 
    },
    excerpt: 'Time management, note-taking, and test strategies.',
    description: (
      <>
        <p>Master essential study skills including time management, effective note-taking methods, memory techniques, and test-taking strategies for academic success.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
  },

  // AP Science Guides
  {
    id: 'ap-physics-guide',
    title: 'AP Physics Success Guide',
    year: '2025',
    category: 'ap-physics',
    colors: { primary: '#1565C0', secondary: '#1E88E5' },
    excerpt: 'Master mechanics, electricity & magnetism with comprehensive problem-solving strategies.',
    description: (
      <>
        <p>Comprehensive conceptual explanations and problem sets for AP Physics 1 and 2. Master mechanics, electricity, magnetism, waves, and modern physics with college-level rigor.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      scienceConcepts: [
        {
          topic: 'Kinematics and Dynamics',
          principle: 'Motion can be described mathematically using position, velocity, and acceleration. Forces cause changes in motion according to Newton\'s laws.',
          examples: [
            'Uniformly accelerated motion: v = v₀ + at, x = x₀ + v₀t + ½at²',
            'Projectile motion: horizontal and vertical components are independent',
            'Circular motion: centripetal acceleration a = v²/r points toward center',
            'Newton\'s 2nd Law: ΣF = ma relates net force to acceleration',
            'Free body diagrams isolate forces acting on a single object'
          ],
          applications: [
            'Analyzing collision problems using conservation of momentum',
            'Solving inclined plane problems with friction',
            'Calculating orbital periods using gravitational force',
            'Designing roller coasters using energy conservation'
          ]
        },
        {
          topic: 'Energy and Momentum Conservation',
          principle: 'Energy and momentum are conserved quantities in isolated systems. These conservation laws provide powerful problem-solving tools.',
          examples: [
            'Mechanical energy: E = KE + PE = ½mv² + mgh',
            'Work-energy theorem: W = ΔKE relates work done to change in kinetic energy',
            'Momentum conservation: p₁ᵢ + p₂ᵢ = p₁f + p₂f in collisions',
            'Elastic collisions conserve both momentum and kinetic energy',
            'Inelastic collisions conserve momentum but not kinetic energy'
          ],
          applications: [
            'Analyzing pendulum motion using energy conservation',
            'Solving collision problems in one and two dimensions',
            'Understanding how energy efficiency relates to real-world machines',
            'Calculating escape velocity from gravitational fields'
          ]
        }
      ]
    }
  },
  {
    id: 'ap-biology-guide',
    title: 'AP Biology Success Guide',
    year: '2025',
    category: 'ap-biology',
    colors: { primary: '#2E7D32', secondary: '#43A047' },
    excerpt: 'From molecular biology to ecology: high-yield practice.',
    description: (
      <>
        <p>High-yield summaries and practice covering all AP Biology topics.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
  },
  {
    id: 'ap-chemistry-guide',
    title: 'AP Chemistry Success Guide',
    year: '2025',
    category: 'ap-chemistry',
    colors: { primary: '#37474F', secondary: '#546E7A' },
    excerpt: 'Stoichiometry, thermodynamics & kinetics with examples.',
    description: (
      <>
        <p>Master stoichiometry, thermodynamics, and kinetics with detailed examples.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
  },

  // AP Calculus Guides
  {
    id: 'calculus-ab-guide',
    title: 'AP Calculus AB Guide',
    year: '2025',
    category: 'calculus-ab',
    colors: { primary: '#7D1935', secondary: '#9C2542' },
    excerpt: 'Step-by-step limits, derivatives & integrals.',
    description: (
      <>
        <p>Master limits, derivatives, and integrals with step-by-step guidance.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
  },
  {
    id: 'calculus-bc-guide',
    title: 'AP Calculus BC Guide',
    year: '2025',
    category: 'calculus-bc',
    colors: { primary: '#512A5B', secondary: '#6A1B9A' },
    excerpt: 'Series, parametrized eqns & advanced integration.',
    description: (
      <>
        <p>Advanced topics including series, parametric equations, and complex integration.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
  },

  // Writing Workbooks
  {
    id: 'writing-grammar-workbook',
    title: 'Writing Grammar Workbook',
    year: '2025',
    category: 'english-workbook',
    colors: { 
      primary: '#48304D', 
      secondary: '#5F4668' 
    },
    excerpt: 'Comprehensive drills for punctuation & sentence structure.',
    description: (
      <>
        <p>Intensive practice drills for punctuation, sentence structure, and grammar mastery.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      punctuation: [
        { 
          mark: '.', 
          rule: 'End declarative sentences and statements. Also used in abbreviations.', 
          examples: [
            'She finished her homework before dinner.',
            'The meeting starts at 3 p.m. in Conference Room B.',
            'Dr. Smith will present the research findings.'
          ],
          commonMistakes: [
            'Using periods in titles or headings',
            'Missing periods at the end of sentences'
          ]
        },
        { 
          mark: '?', 
          rule: 'End direct questions and interrogative sentences.', 
          examples: [
            'Did you finish your homework?',
            'What time does the library close?',
            'Are you planning to attend the conference?'
          ],
          commonMistakes: [
            'Using question marks with indirect questions: "She asked if I was ready."',
            'Missing question marks with direct questions'
          ]
        },
        { 
          mark: '!', 
          rule: 'Show strong emotion, excitement, emphasis, or commands.', 
          examples: [
            'What a beautiful sunset!',
            'Stop right there!',
            'I can\'t believe we won the championship!'
          ],
          commonMistakes: [
            'Overusing exclamation points in formal writing',
            'Using multiple exclamation points (!!!)'
          ]
        },
        { 
          mark: ',', 
          rule: 'Separate items in lists, after introductory elements, with coordinate conjunctions, and around nonessential information.', 
          examples: [
            'After studying for three hours, Maria felt prepared for the exam.',
            'We need pencils, paper, calculators, and erasers for the test.',
            'The library, which closes at 9 PM, offers quiet study spaces.',
            'She studied hard for the test, but she still felt nervous.'
          ],
          commonMistakes: [
            'Comma splice: "It was raining, we stayed inside."',
            'Missing comma after introductory phrases',
            'Unnecessary commas with essential information'
          ]
        },
        { 
          mark: ';', 
          rule: 'Join two related independent clauses without a conjunction, or separate complex list items.', 
          examples: [
            'I studied hard for the test; I was confident I would pass.',
            'The weather was perfect; we decided to have a picnic.',
            'The conference included speakers from Boston, Massachusetts; Portland, Oregon; and Austin, Texas.'
          ],
          commonMistakes: [
            'Using semicolons with dependent clauses',
            'Confusing semicolons with colons',
            'Using semicolons in simple lists'
          ]
        },
        { 
          mark: ':', 
          rule: 'Introduce lists, explanations, or quotes after a complete sentence. Also used in time notation and ratios.', 
          examples: [
            'She had three main goals: improve grades, join the debate team, and volunteer weekly.',
            'The coach gave us clear instructions: practice starts at 6 AM sharp.',
            'Remember this important rule: always proofread your work.',
            'The meeting starts at 2:30 PM.',
            'The ratio of students to teachers is 15:1.'
          ],
          commonMistakes: [
            'Using colons after incomplete sentences: "My hobbies include: reading and swimming."',
            'Using colons when not introducing something',
            'Capitalizing after colons unless it\'s a proper noun or complete sentence'
          ]
        },
        { 
          mark: '—', 
          rule: 'Add emphasis, show interruption, indicate abrupt change, or replace parentheses for strong emphasis.', 
          examples: [
            'He won the prize—against all odds—and celebrated with his team.',
            'The solution was simple—study harder.',
            'I was about to leave when—surprise!—my friends arrived for the party.',
            'The test covers three subjects—math, science, and English.'
          ],
          commonMistakes: [
            'Confusing em dashes (—) with hyphens (-)',
            'Overusing dashes instead of commas or parentheses',
            'Adding spaces around em dashes (incorrect in most style guides)'
          ]
        },
        { 
          mark: '"..."', 
          rule: 'Enclose direct quotes, dialogue, and titles of short works.', 
          examples: [
            'She said, "I\'ll be there by noon."',
            '"The only way to do great work," said Steve Jobs, "is to love what you do."',
            'Have you read the article "The Future of Education"?',
            'The teacher announced, "Tomorrow\'s test has been postponed."'
          ],
          commonMistakes: [
            'Using quotes for emphasis instead of actual quotations',
            'Incorrect punctuation placement with quotes',
            'Missing quotes around direct speech'
          ]
        },
        { 
          mark: '\'', 
          rule: 'Show possession, form contractions, and indicate omitted letters or numbers.', 
          examples: [
            'Sarah\'s book is on the table.',
            'Don\'t forget to submit your assignment.',
            'The students\' projects were displayed in the hallway.',
            'The class of \'98 held their reunion last weekend.'
          ],
          commonMistakes: [
            'Its vs. it\'s: "The dog wagged its tail" vs. "It\'s a beautiful day"',
            'Using apostrophes for plural nouns: "Apple\'s for sale"',
            'Incorrect possessive forms: "Charles\' vs. Charles\'s"'
          ]
        },
        { 
          mark: '()', 
          rule: 'Add extra information, clarification, asides, or citations that could be removed without changing the main meaning.', 
          examples: [
            'The meeting (scheduled for 3 PM) was moved to tomorrow.',
            'John Adams (the second U.S. president) was a founding father.',
            'Please bring your supplies (pencils, paper, and calculator) to the exam.',
            'The research study (published in 2023) supports this conclusion.'
          ],
          commonMistakes: [
            'Using parentheses for essential information',
            'Overusing parentheses instead of commas',
            'Incorrect punctuation around parentheses'
          ]
        }
      ],
      tenses: [
        { 
          name: 'Present Simple', 
          structure: 'Subject + base verb (+ s/es for 3rd person singular)', 
          examples: [
            'She writes essays every day.',
            'The library opens at 8 AM.',
            'Students often struggle with grammar.',
            'He doesn\'t understand the assignment.'
          ],
          commonMistakes: [
            'Forgetting -s/-es for third person singular',
            'Using present simple for ongoing actions',
            'Incorrect negative formation'
          ]
        },
        { 
          name: 'Past Simple', 
          structure: 'Subject + past form of verb (regular: -ed, irregular: various forms)', 
          examples: [
            'She wrote an essay yesterday.',
            'The students completed their projects last week.',
            'He didn\'t finish his homework on time.',
            'They went to the museum for their field trip.'
          ],
          commonMistakes: [
            'Confusing regular and irregular past forms',
            'Using past simple with time expressions requiring present perfect',
            'Double past marking: "didn\'t went"'
          ]
        },
        { 
          name: 'Future Simple', 
          structure: 'Subject + will + base verb', 
          examples: [
            'She will write an essay tomorrow.',
            'The test will cover three chapters.',
            'Students will receive their grades next week.',
            'I won\'t be able to attend the meeting.'
          ],
          commonMistakes: [
            'Using "will" with time clauses: "When she will arrive..."',
            'Confusing "will" and "going to"',
            'Using future tense after "if" in conditional sentences'
          ]
        },
        { 
          name: 'Present Continuous', 
          structure: 'Subject + am/is/are + verb + -ing', 
          examples: [
            'She is writing an essay right now.',
            'The students are working on their projects.',
            'I am not understanding this concept.',
            'Are you coming to the study session?'
          ],
          commonMistakes: [
            'Using stative verbs in continuous: "I am knowing"',
            'Missing auxiliary verb: "She writing"',
            'Incorrect -ing formation: "stoping" instead of "stopping"'
          ]
        },
        { 
          name: 'Past Continuous', 
          structure: 'Subject + was/were + verb + -ing', 
          examples: [
            'She was writing when I called.',
            'The students were discussing the assignment.',
            'While he was studying, his phone rang.',
            'They weren\'t paying attention during the lecture.'
          ],
          commonMistakes: [
            'Using past continuous for completed actions',
            'Incorrect auxiliary: "I were studying"',
            'Missing auxiliary in questions: "What you doing?"'
          ]
        },
        { 
          name: 'Present Perfect', 
          structure: 'Subject + has/have + past participle', 
          examples: [
            'She has written three essays this week.',
            'The students have completed their assignments.',
            'I have never seen such dedication.',
            'Have you finished your homework yet?'
          ],
          commonMistakes: [
            'Using with specific past time: "I have seen him yesterday"',
            'Confusing past participle forms',
            'Using "has" with plural subjects'
          ]
        },
        { 
          name: 'Past Perfect', 
          structure: 'Subject + had + past participle', 
          examples: [
            'She had written the essay before class started.',
            'The students had studied hard before the exam.',
            'By the time I arrived, they had already finished.',
            'He hadn\'t completed the assignment when the deadline passed.'
          ],
          commonMistakes: [
            'Overusing past perfect when simple past is sufficient',
            'Incorrect sequence of tenses',
            'Using past perfect without clear time relationship'
          ]
        },
        { 
          name: 'Future Perfect', 
          structure: 'Subject + will have + past participle', 
          examples: [
            'She will have written five essays by Friday.',
            'The students will have graduated by next summer.',
            'By 2025, technology will have changed education significantly.',
            'I will have finished my degree before I turn 25.'
          ],
          commonMistakes: [
            'Using future perfect when simple future is appropriate',
            'Incorrect past participle forms',
            'Missing time reference for completion'
          ]
        }
      ],
      grammar: [
        { 
          topic: 'Subject-Verb Agreement', 
          rule: 'Singular subjects take singular verbs; plural subjects take plural verbs. Agreement depends on the subject, not intervening words.', 
          examples: [
            'The student studies hard every night.',
            'The students study together in the library.',
            'Neither of the boys has finished his homework.',
            'The teacher, along with her students, is planning a field trip.',
            'Each of the assignments requires careful attention.'
          ],
          commonMistakes: [
            'Disagreement with compound subjects: "Tom and Jerry is coming"',
            'Confusion with collective nouns: "The team are playing well"',
            'Ignoring intervening phrases: "The box of books are heavy"'
          ]
        },
        { 
          topic: 'Pronoun Cases', 
          rule: 'Use subjective case for subjects (I, he, she, we, they), objective case for objects (me, him, her, us, them), and possessive case for ownership (my, his, her, our, their).', 
          examples: [
            'She and I worked on the project together.',
            'The teacher gave the assignment to him and me.',
            'Between you and me, this test seems challenging.',
            'The book belongs to her, not to them.',
            'Whom did you see at the library?'
          ],
          commonMistakes: [
            'Using "me" in compound subjects: "Me and John went"',
            'Hypercorrection: "between you and I"',
            'Confusing who/whom: "Who did you give it to?"'
          ]
        },
        { 
          topic: 'Modifier Placement', 
          rule: 'Place modifiers as close as possible to the words they modify to avoid ambiguity.', 
          examples: [
            'Walking to school, Sarah saw a rainbow.',
            'The student who studied hardest received the highest grade.',
            'Only three students passed the exam. (exactly three)',
            'Three students only passed the exam. (they just barely passed)',
            'She almost ate the entire pizza. (she nearly ate it all)'
          ],
          commonMistakes: [
            'Dangling modifiers: "Walking to school, the rainbow appeared"',
            'Misplaced limiting modifiers: "only," "just," "nearly"',
            'Ambiguous pronoun reference: "John told Mark that he was wrong"'
          ]
        },
        { 
          topic: 'Run-on Sentences and Fragments', 
          rule: 'Every sentence needs a subject and predicate. Avoid comma splices and fused sentences.', 
          examples: [
            'She studied hard. She passed the exam. (two complete sentences)',
            'She studied hard, so she passed the exam. (compound sentence)',
            'Because she studied hard, she passed the exam. (complex sentence)',
            'After finishing her homework. (fragment - needs main clause)',
            'It was raining, we stayed inside. (comma splice - needs conjunction or semicolon)'
          ],
          commonMistakes: [
            'Comma splices: joining independent clauses with only a comma',
            'Sentence fragments: incomplete thoughts punctuated as sentences',
            'Fused sentences: running independent clauses together without punctuation'
          ]
        },
        { 
          topic: 'Verb Tense Consistency', 
          rule: 'Maintain consistent verb tenses within paragraphs and related sentences unless there\'s a logical reason to change.', 
          examples: [
            'She walks to school every day and enjoys the exercise.',
            'Yesterday, he studied for three hours and then watched a movie.',
            'The author writes about characters who lived in the 19th century.',
            'When I was young, I believed that adults knew everything.',
            'The research shows that students perform better when they get adequate sleep.'
          ],
          commonMistakes: [
            'Unnecessary tense shifts: "She walks to school and enjoyed the exercise"',
            'Incorrect sequence of tenses: "He said he will come tomorrow"',
            'Using past tense for general truths in literature: "Hamlet was indecisive"'
          ]
        },
        { 
          topic: 'Comparative and Superlative Forms', 
          rule: 'Use comparative (-er, more) for two items; superlative (-est, most) for three or more. Don\'t double up.', 
          examples: [
            'This book is more interesting than that one.',
            'She is the smartest student in the class.',
            'Of the two options, this is the better choice.',
            'This is the most challenging assignment we\'ve had.',
            'He runs faster than his brother but not as fast as his sister.'
          ],
          commonMistakes: [
            'Double comparatives: "more better," "most fastest"',
            'Using superlative for two items: "the best of the two"',
            'Incorrect forms: "gooder" instead of "better"'
          ]
        }
      ]
    }
  },

  // Math Workbook
  {
    id: 'algebra-workbook',
    title: 'Algebra Fundamentals Workbook',
    year: '2025',
    category: 'math-workbook',
    colors: { 
      primary: '#1565C0', 
      secondary: '#1976D2' 
    },
    excerpt: 'Master algebraic concepts with step-by-step practice.',
    description: (
      <>
        <p>Build strong algebraic foundations with comprehensive practice problems and clear explanations.</p>
        <p><em>Interactive learning content available!</em></p>
      </>
    ),
    learningContent: {
      mathConcepts: [
        {
          topic: 'Solving Linear Inequalities',
          rule: 'Solve like equations, but flip inequality sign when multiplying/dividing by negative numbers.',
          examples: [
            '2x + 3 > 7 → 2x > 4 → x > 2',
            '-3x + 1 ≤ 10 → -3x ≤ 9 → x ≥ -3 (flipped sign)',
            '5 < 2x - 1 < 9 → 6 < 2x < 10 → 3 < x < 5'
          ],
          strategies: [
            'Always flip inequality when multiplying/dividing by negative',
            'Graph solutions on number line to visualize',
            'Check answer by testing a value in the solution set'
          ]
        },
        {
          topic: 'Factoring Quadratics',
          rule: 'Find two numbers that multiply to ac and add to b in ax² + bx + c.',
          examples: [
            'x² + 5x + 6 = (x + 2)(x + 3) [2 × 3 = 6, 2 + 3 = 5]',
            'x² - 7x + 12 = (x - 3)(x - 4) [-3 × -4 = 12, -3 + -4 = -7]',
            '2x² + 7x + 3 = (2x + 1)(x + 3) [Use AC method: 2 × 3 = 6, find factors of 6 that add to 7]'
          ],
          strategies: [
            'Look for GCF first',
            'Use FOIL to check your factoring',
            'For leading coefficient ≠ 1, try AC method or grouping'
          ]
        }
      ]
    }
  }
];