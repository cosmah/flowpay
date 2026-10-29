/** Cryptographically random password that satisfies invite/login password rules. */
export function generateInvitePassword(length = 14): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ"
  const lower = "abcdefghijkmnopqrstuvwxyz"
  const numbers = "23456789"
  const special = "!@#$%&*"
  const all = upper + lower + numbers + special

  const pick = (alphabet: string) =>
    alphabet[crypto.getRandomValues(new Uint32Array(1))[0] % alphabet.length]!

  const required = [pick(upper), pick(lower), pick(numbers), pick(special)]
  const rest = Array.from({ length: Math.max(length, 12) - required.length }, () =>
    pick(all)
  )
  const chars = [...required, ...rest]

  // Fisher–Yates shuffle
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0]! % (i + 1)
    ;[chars[i], chars[j]] = [chars[j]!, chars[i]!]
  }

  return chars.join("")
}
