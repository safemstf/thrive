// src/utils/mathUtils.ts

/**
 * Evaluate a user's answer string against the correct numeric answer.
 * Returns boolean correct and formatted correct answer.
 */
export function evaluateAnswer(
  input: string,
  correct: number,
  eps = 1e-3
): { correct: boolean; formatted: string } {
  const val = parseFloat(input.trim());
  const isCorrect = !isNaN(val) && Math.abs(val - correct) < eps;
  const formatted = Number.isInteger(correct)
    ? correct.toString()
    : correct.toFixed(3);
  return { correct: isCorrect, formatted };
}