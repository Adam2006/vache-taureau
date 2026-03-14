/**
 * Evaluate a guess against the secret number.
 * Returns { taureaux, vaches }
 *   taureaux = right digit, right position
 *   vaches   = right digit, wrong position
 */
export function evaluate(guess, secret) {
  let taureaux = 0
  let vaches = 0
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      taureaux++
    } else if (secret.includes(guess[i])) {
      vaches++
    }
  }
  return { taureaux, vaches }
}

/**
 * Check a number string is valid:
 * - exactly `digitCount` characters
 * - all digits 0-9
 * - no repeated digits
 */
export function isValidNumber(str, digitCount) {
  if (str.length !== digitCount) return false
  if (!/^\d+$/.test(str)) return false
  return new Set(str).size === str.length
}

/**
 * Generate a random valid secret number of `digitCount` unique digits.
 */
export function generateSecret(digitCount) {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  const result = []
  // First digit can't be 0 for readability (optional)
  const pool = [...digits]
  while (result.length < digitCount) {
    const idx = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result.join('')
}
