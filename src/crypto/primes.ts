// Prime generation with Miller-Rabin primality testing

import { modPow } from "./bigintHelpers";

// --- Random number generation ---

function randomBytes(n: number): Uint8Array {
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  return arr;
}

function randomBigInt(bits: number): bigint {
  const bytes = Math.ceil(bits / 8);
  const arr = randomBytes(bytes);
  let result = 0n;
  for (const b of arr) result = (result << 8n) | BigInt(b);
  const mask = (1n << BigInt(bits)) - 1n;
  result = result & mask;
  result |= 1n << BigInt(bits - 1); // ensure correct bit length
  return result;
}

export function randomBigIntRange(min: bigint, max: bigint): bigint {
  const range = max - min + 1n;
  const bits = range.toString(2).length + 8;
  while (true) {
    const bytes = Math.ceil(bits / 8);
    const arr = randomBytes(bytes);
    let r = 0n;
    for (const b of arr) r = (r << 8n) | BigInt(b);
    r = r % range;
    if (r >= 0n) return r + min;
  }
}

// --- Miller-Rabin Primality Testing ---

/**
 * Probabilistic primality test using Miller-Rabin algorithm.
 * @param n - The number to test for primality
 * @param rounds - Number of rounds (higher = more confidence). Default 20.
 * @returns true if n is probably prime
 *
 * NOTE: This is a DEMO implementation. Production cryptography requires
 * constant-time operations to prevent timing side-channel attacks.
 * See: https://www.openfhe.org/ and https://github.com/microsoft/SEAL
 */
export function isProbablePrime(n: bigint, rounds: number = 20): boolean {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  let d = n - 1n;
  let r = 0;
  while (d % 2n === 0n) {
    d >>= 1n;
    r++;
  }

  for (let i = 0; i < rounds; i++) {
    const a = randomBigIntRange(2n, n - 2n);
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let found = false;
    for (let j = 0; j < r - 1; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}

/**
 * Generate a random prime of the given bit length.
 * Uses 20 rounds of Miller-Rabin for high confidence.
 * @returns { prime, candidatesTested }
 */
export function generatePrime(bits: number): { prime: bigint; candidatesTested: number } {
  let candidatesTested = 0;
  while (true) {
    let candidate = randomBigInt(bits);
    candidate |= 1n; // ensure odd
    candidatesTested++;
    if (isProbablePrime(candidate, 20)) {
      return { prime: candidate, candidatesTested };
    }
  }
}
