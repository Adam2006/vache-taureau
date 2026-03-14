import { evaluate, isValidNumber } from './gameLogic.js'

/**
 * Generate all valid numbers of a given digit count (unique digits).
 */
function generateAllCandidates(digitCount) {
  const candidates = []
  const min = Math.pow(10, digitCount - 1)
  const max = Math.pow(10, digitCount) - 1
  for (let n = min; n <= max; n++) {
    const s = String(n)
    if (isValidNumber(s, digitCount)) {
      candidates.push(s)
    }
  }
  return candidates
}

/**
 * Easy AI: picks a random valid number it hasn't tried yet.
 */
export function easyAIGuess(digitCount, previousGuesses) {
  const candidates = generateAllCandidates(digitCount)
  const remaining = candidates.filter(c => !previousGuesses.includes(c))
  if (remaining.length === 0) return candidates[0]
  return remaining[Math.floor(Math.random() * remaining.length)]
}

/**
 * Hard AI: uses constraint-based elimination (Mastermind solver).
 * Starts with all candidates, eliminates ones inconsistent with feedback.
 */
export class HardAI {
  constructor(digitCount) {
    this.digitCount = digitCount
    this.candidates = generateAllCandidates(digitCount)
    this.guesses = []
  }

  /**
   * Get next guess and eliminate impossible candidates based on last feedback.
   */
  nextGuess(lastGuess, lastResult) {
    // Eliminate candidates inconsistent with the last feedback
    if (lastGuess && lastResult) {
      this.candidates = this.candidates.filter(candidate => {
        const { taureaux, vaches } = evaluate(lastGuess, candidate)
        return taureaux === lastResult.taureaux && vaches === lastResult.vaches
      })
    }

    // Pick first remaining candidate (deterministic for hard mode)
    const guess = this.candidates[0] || String(Math.floor(Math.random() * 9000 + 1000))
    this.guesses.push(guess)
    return guess
  }
}
