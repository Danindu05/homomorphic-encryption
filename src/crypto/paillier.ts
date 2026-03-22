// Paillier Homomorphic Encryption — Core implementation
//
// ⚠ DEMO IMPLEMENTATION — NOT FOR PRODUCTION USE
// This implementation is mathematically correct but does NOT use constant-time
// operations, making it vulnerable to timing side-channel attacks.
// For production HE, see:
//   - OpenFHE: https://www.openfhe.org/
//   - Microsoft SEAL: https://github.com/microsoft/SEAL

import type { PaillierPublicKey, PaillierPrivateKey, PaillierKeyPair } from "./types";
import { modPow, gcd, lcm, modInverse } from "./bigintHelpers";
import { generatePrime, randomBigIntRange } from "./primes";

export type { PaillierPublicKey, PaillierPrivateKey, PaillierKeyPair };
export { modPow, modInverse, bigintToHex, truncateHex } from "./bigintHelpers";
export { isProbablePrime } from "./primes";

// --- Key generation ---

export interface KeyGenResult {
  keyPair: PaillierKeyPair;
  pCandidates: number;
  qCandidates: number;
}

export function generateKeys(bitLength: number): KeyGenResult {
  const halfBits = Math.floor(bitLength / 2);
  let p: bigint, q: bigint, n: bigint;
  let pCandidates: number, qCandidates: number;

  do {
    const pResult = generatePrime(halfBits);
    const qResult = generatePrime(halfBits);
    p = pResult.prime;
    q = qResult.prime;
    pCandidates = pResult.candidatesTested;
    qCandidates = qResult.candidatesTested;
    n = p * q;
  } while (p === q || n.toString(2).length < bitLength - 1);

  const n2 = n * n;
  const g = n + 1n;
  const lambda = lcm(p - 1n, q - 1n);
  const mu = modInverse(lambda, n);

  const publicKey: PaillierPublicKey = { n, n2, g, bits: bitLength };
  const privateKey: PaillierPrivateKey = { lambda, mu, p, q, publicKey };

  return {
    keyPair: { publicKey, privateKey, bitLength },
    pCandidates,
    qCandidates,
  };
}

// --- Encryption ---

export function encrypt(m: bigint, publicKey: PaillierPublicKey): bigint {
  const { n, n2, g } = publicKey;
  const mMod = ((m % n) + n) % n;
  let r: bigint;
  do {
    r = randomBigIntRange(1n, n - 1n);
  } while (gcd(r, n) !== 1n);

  const gm = modPow(g, mMod, n2);
  const rn = modPow(r, n, n2);
  return (gm * rn) % n2;
}

// --- Decryption ---

export function decrypt(c: bigint, privateKey: PaillierPrivateKey): bigint {
  const { lambda, mu, publicKey } = privateKey;
  const { n, n2 } = publicKey;
  const x = modPow(c, lambda, n2);
  const l = (x - 1n) / n;
  return (l * mu) % n;
}

// --- Homomorphic operations ---

export function homAdd(c1: bigint, c2: bigint, publicKey: PaillierPublicKey): bigint {
  return (c1 * c2) % publicKey.n2;
}

export function homMulConst(c: bigint, k: bigint, publicKey: PaillierPublicKey): bigint {
  return modPow(c, k, publicKey.n2);
}
