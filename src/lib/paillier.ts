// Paillier Homomorphic Encryption - Pure TypeScript BigInt implementation

export interface PaillierPublicKey {
  n: bigint;
  n2: bigint;
  g: bigint;
  bits: number;
}

export interface PaillierPrivateKey {
  lambda: bigint;
  mu: bigint;
  p: bigint;
  q: bigint;
  publicKey: PaillierPublicKey;
}

export interface PaillierKeyPair {
  publicKey: PaillierPublicKey;
  privateKey: PaillierPrivateKey;
  bitLength: number;
}

// --- Math utilities ---

export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  if (mod === 1n) return 0n;
  let result = 1n;
  base = ((base % mod) + mod) % mod;
  while (exp > 0n) {
    if (exp & 1n) result = (result * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return result;
}

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b > 0n) { [a, b] = [b, a % b]; }
  return a;
}

function lcm(a: bigint, b: bigint): bigint {
  return (a / gcd(a, b)) * b;
}

export function modInverse(a: bigint, m: bigint): bigint {
  let [old_r, r] = [((a % m) + m) % m, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1n) throw new Error("No modular inverse exists");
  return ((old_s % m) + m) % m;
}

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
  // Mask to exact bit count and set MSB
  const mask = (1n << BigInt(bits)) - 1n;
  result = result & mask;
  result |= 1n << BigInt(bits - 1); // ensure correct bit length
  return result;
}

function randomBigIntRange(min: bigint, max: bigint): bigint {
  const range = max - min + 1n;
  const bits = range.toString(2).length + 8; // extra bits to reduce bias
  while (true) {
    const bytes = Math.ceil(bits / 8);
    const arr = randomBytes(bytes);
    let r = 0n;
    for (const b of arr) r = (r << 8n) | BigInt(b);
    r = r % range;
    if (r >= 0n) return r + min;
  }
}

// --- Primality testing (Miller-Rabin) ---

function millerRabin(n: bigint, k: number = 20): boolean {
  if (n < 2n) return false;
  if (n === 2n || n === 3n) return true;
  if (n % 2n === 0n) return false;

  let d = n - 1n;
  let r = 0;
  while (d % 2n === 0n) { d >>= 1n; r++; }

  for (let i = 0; i < k; i++) {
    const a = randomBigIntRange(2n, n - 2n);
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    let found = false;
    for (let j = 0; j < r - 1; j++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) { found = true; break; }
    }
    if (!found) return false;
  }
  return true;
}

function generatePrime(bits: number): bigint {
  while (true) {
    let candidate = randomBigInt(bits);
    candidate |= 1n; // ensure odd
    if (millerRabin(candidate, 20)) return candidate;
  }
}

// --- Paillier key generation ---

export function generateKeys(bitLength: number): PaillierKeyPair {
  const halfBits = Math.floor(bitLength / 2);
  let p: bigint, q: bigint, n: bigint;

  do {
    p = generatePrime(halfBits);
    q = generatePrime(halfBits);
    n = p * q;
  } while (p === q || n.toString(2).length < bitLength - 1);

  const n2 = n * n;
  const g = n + 1n;
  const lambda = lcm(p - 1n, q - 1n);
  const mu = modInverse(lambda, n);

  const publicKey: PaillierPublicKey = { n, n2, g, bits: bitLength };
  const privateKey: PaillierPrivateKey = { lambda, mu, p, q, publicKey };

  return { publicKey, privateKey, bitLength };
}

// --- Encryption ---

export function encrypt(m: bigint, publicKey: PaillierPublicKey): bigint {
  const { n, n2, g } = publicKey;
  // m must be in [0, n)
  const mMod = ((m % n) + n) % n;
  let r: bigint;
  do {
    r = randomBigIntRange(1n, n - 1n);
  } while (gcd(r, n) !== 1n);

  // c = g^m * r^n mod n^2
  const gm = modPow(g, mMod, n2);
  const rn = modPow(r, n, n2);
  return (gm * rn) % n2;
}

// --- Decryption ---

export function decrypt(c: bigint, privateKey: PaillierPrivateKey): bigint {
  const { lambda, mu, publicKey } = privateKey;
  const { n, n2 } = publicKey;

  // L(x) = (x - 1) / n
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

// --- Display helpers ---

export function bigintToHex(n: bigint): string {
  const hex = n.toString(16);
  return hex;
}

export function truncateHex(hex: string, maxLen: number = 32): string {
  if (hex.length <= maxLen) return hex;
  const half = Math.floor(maxLen / 2) - 1;
  return hex.slice(0, half) + "···" + hex.slice(-half);
}
