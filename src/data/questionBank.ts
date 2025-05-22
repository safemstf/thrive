export type Question = {
  module: string;
  question: string;
  choices: string[];
  answer: number;
  range: number[];
  difficulty: 'easy' | 'medium' | 'hard';
};

export const questionBank: Question[] = [
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "Calculate (-1)/(10 - 1106/112).",
    "answer": -8,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "(-4*(-2)/24)/(312/144)",
    "answer": 0.15384615384615385,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "What is 6*(3 + (-8)/6 - 1)?",
    "answer": 4,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "What is the value of (-1 - -2)/(-3 + (-20)/(-6))?",
    "answer": 3,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "What is the value of 1 + -6*1/1?",
    "answer": -5,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "What is the value of (4 - 10)*(-10)/(-105)?",
    "answer": -0.5714285714285714,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "What is the value of (42/(-56))/(1/(-4))?",
    "answer": 3,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "1/(-8) - (979/(-88) + 16)",
    "answer": -5,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "Evaluate 3/(-5)*(-35)/56.",
    "answer": 0.375,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "arithmetic__mixed",
    "difficulty": "easy",
    "question": "Calculate 3/(-42)*(5 + -6)*-2.",
    "answer": -0.14285714285714285,
    "range": [
      6,
      15
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "Problem(question='What is 596 minutes before 3:08 AM?', answer='5:12 PM')",
    "answer": 0,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "How many minutes are there between 8:37 PM and 11:59 PM?",
    "answer": 202,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "How many minutes are there between 9:26 AM and 6:14 PM?",
    "answer": 528,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "How many minutes are there between 1:03 AM and 9:04 AM?",
    "answer": 481,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "How many minutes are there between 10:40 PM and 10:52 PM?",
    "answer": 12,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "How many minutes are there between 1:02 AM and 4:13 AM?",
    "answer": 191,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "Problem(question='What is 250 minutes after 12:50 AM?', answer='5:00 AM')",
    "answer": 0,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "How many minutes are there between 4:57 AM and 9:43 AM?",
    "answer": 286,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "How many minutes are there between 11:52 AM and 9:16 PM?",
    "answer": 564,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "easy",
    "question": "How many minutes are there between 1:36 PM and 1:07 AM?",
    "answer": 691,
    "range": [
      16,
      25
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve -850*w + 846*w + 28 = 0 for w.",
    "answer": 7,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve 20*q = 16*q for q.",
    "answer": 0,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve 25*v = 18*v + 42 for v.",
    "answer": 6,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve -60 = 6*z - 42 for z.",
    "answer": -3,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve -r + 1 = -2 for r.",
    "answer": 3,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve -8*b = 277 - 213 for b.",
    "answer": -8,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve -59*x + 7*x + 416 = 0 for x.",
    "answer": 8,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve 38 = 90*h - 109*h for h.",
    "answer": -2,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve 15 + 12 = 9*o for o.",
    "answer": 3,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_1d",
    "difficulty": "easy",
    "question": "Solve 0 = -42*m + 36*m - 6 for m.",
    "answer": -1,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "Problem(question='What is 421 minutes before 5:56 AM?', answer='10:55 PM')",
    "answer": 0,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "How many minutes are there between 3:05 PM and 9:36 PM?",
    "answer": 391,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "How many minutes are there between 7:31 PM and 5:42 AM?",
    "answer": 611,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "Problem(question='What is 391 minutes after 1:28 AM?', answer='7:59 AM')",
    "answer": 0,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "How many minutes are there between 1:08 AM and 2:59 AM?",
    "answer": 111,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "Problem(question='What is 634 minutes before 9:40 PM?', answer='11:06 AM')",
    "answer": 0,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "Problem(question='What is 507 minutes after 3:28 PM?', answer='11:55 PM')",
    "answer": 0,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "How many minutes are there between 5:50 AM and 7:41 AM?",
    "answer": 111,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "How many minutes are there between 8:12 PM and 10:52 PM?",
    "answer": 160,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "measurement__time",
    "difficulty": "medium",
    "question": "Problem(question='What is 592 minutes before 6:27 PM?', answer='8:35 AM')",
    "answer": 0,
    "range": [
      56,
      65
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve 0 = -42*q + 4*r - 188, -14*r + 29 = -q - 9*r for q.",
    "answer": -4,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve 26059*q + 41 = -5*o + 26063*q, -2*q + 7 = -o for o.",
    "answer": -9,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve 9 = 2569*j - 2566*j + 2*m, -5*j - 2*m = -11 for j.",
    "answer": 1,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve 6*a - 4*a - 5 = -c, 0 = 5*c + 2*a + 7 for c.",
    "answer": -3,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve -3*v - 10 = 4*t, -25*v = -5*t - 21*v + 3 for t.",
    "answer": -1,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve -7 = 3*a - r, 3*r = 74 - 71 for a.",
    "answer": -2,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve -10 - 17 = -3*b + 7*f, 5*b = f - 19 for b.",
    "answer": -5,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve 10 = 4*j + 22, -6*k = -3*j + 15 for k.",
    "answer": -4,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve 4*m - 3*q + 87 = 0, 0 = -480*m + 477*m + q - 64 for m.",
    "answer": -21,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "Solve -a + 32 = 5*s, 0 = -3*a + 4*s - 17 - 1 for a.",
    "answer": 2,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='What is the first derivative of 472652685*q*y + q + 123735173 wrt y?', answer=472652685*q)",
    "answer": 5,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='Find the first derivative of -153*a*h**2 - 8*a*h + 64*a + 2*h**2 - 176*h + 56830 wrt h.', answer=-306*a*h - 8*a + 4*h - 176)",
    "answer": 1,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='What is the second derivative of 9012*i**4 - 9699*i**3 - 2*i**2 - 630654520*i wrt i?', answer=108144*i**2 - 58194*i - 4)",
    "answer": 0,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='Find the second derivative of 6938005*a**5*b - 3*a*b + 2*b + 1624118 wrt a.', answer=138760100*a**3*b)",
    "answer": 1,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='Find the third derivative of -4576*t**5 - 4874*t**4 + 3*t**2 + 166635*t + 26 wrt t.', answer=-274560*t**2 - 116976*t)",
    "answer": 0,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='What is the third derivative of 211568*h*j**3 + 4*h*j**2 + h*j + h - 77*j**3 - 100*j**2 - 9138*j - 1 wrt j?', answer=1269408*h - 462)",
    "answer": 1,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='Find the second derivative of 167*a**5 + 158*a**4 - 3*a**3 + 15221443*a wrt a.', answer=3340*a**3 + 1896*a**2 - 18*a)",
    "answer": 0,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='What is the derivative of 5178705*q**2 - 2*q - 11395323 wrt q?', answer=10357410*q - 2)",
    "answer": 0,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='What is the derivative of -16*f**3 + 13514314*f - 312712103 wrt f?', answer=13514314 - 48*f**2)",
    "answer": 0,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "What is the second derivative of -672368905*k**2 + 555*k + 307753 wrt k?",
    "answer": -1344737810,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='Find the first derivative of 94*o**2 + 29108*o - 22381593 wrt o.', answer=188*o + 29108)",
    "answer": 1,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='What is the third derivative of -3033438*b**4 - 4*b**2 - 791*b + 7?', answer=-72802512*b)",
    "answer": 1,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='What is the third derivative of -3442*a**2*n**3 - 3*a**2*n**2 - 651*a*n**3 + n**3 - 74463685*n**2 wrt n?', answer=-20652*a**2 - 3906*a + 6)",
    "answer": 3,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='Find the third derivative of -6527461*c**3*x + c**3 - 4*c**2 - 6*c*x + 2*c - x - 439046 wrt c.', answer=6 - 39164766*x)",
    "answer": 2,
    "range": [
      86,
      100
    ],
    "choices": []
  },
  {
    "module": "calculus__differentiate",
    "difficulty": "hard",
    "question": "Problem(question='Find the second derivative of 231929254*y**4 + 91228580*y wrt y.', answer=2783151048*y**2)",
    "answer": 1,
    "range": [
      86,
      100
    ],
    "choices": []
  }
];