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
    "question": "(-1)/(10 - 1106/112).",
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
    "question": "6*(3 + (-8)/6 - 1)?",
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
    "question": "the value of (-1 - -2)/(-3 + (-20)/(-6))?",
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
    "question": "1 + -6*1/1?",
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
    "question": "(4 - 10)*(-10)/(-105)",
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
    "question": "(42/(-56))/(1/(-4))",
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
    "question":"1/(-8) - (979/(-88) + 16)",
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
    "question": "3/(-5)*(-35)/56.",
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
    "question": "3/(-42)*(5 + -6)*-2.",
    "answer": -0.14285714285714285,
    "range": [
      6,
      15
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
    "question": "25*v = 18*v + 42 ",
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
    "question": "-60 = 6*z - 42",
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
    "question": "-r + 1 = -2",
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
    "question": "-8*b = 277 - 213",
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
    "question": "-59*x + 7*x + 416 = 0",
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
    "question": "38 = 90*h - 109*h",
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
    "question": "15 + 12 = 9*o",
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
    "question": "0 = -42*m + 36*m - 6",
    "answer": -1,
    "range": [
      26,
      35
    ],
    "choices": []
  },
  {
    "module": "algebra__linear_2d",
    "difficulty": "medium",
    "question": "0 = -42*q + 4*r - 188, -14*r + 29 = -q - 9*r",
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
    "question": "26059*q + 41 = -5*o + 26063*q, -2*q + 7 = -o",
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
    "question": "9 = 2569*j - 2566*j + 2*m, -5*j - 2*m = -11",
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
    "question": "6*a - 4*a - 5 = -c, 0 = 5*c + 2*a + 7",
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
    "question": "-3*v - 10 = 4*t, -25*v = -5*t - 21*v + 3",
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
    "question": "-7 = 3*a - r, 3*r = 74 - 71 ",
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
    "question": "-10 - 17 = -3*b + 7*f, 5*b = f - 19",
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
    "question": "10 = 4*j + 22, -6*k = -3*j + 15",
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
    "question": "4*m - 3*q + 87 = 0, 0 = -480*m + 477*m + q - 64",
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
    "question": "-a + 32 = 5*s, 0 = -3*a + 4*s - 17 - 1",
    "answer": 2,
    "range": [
      66,
      75
    ],
    "choices": []
  },
  
];