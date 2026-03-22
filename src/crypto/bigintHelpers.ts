// Modular arithmetic and BigInt utility functions

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

export function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b > 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

export function lcm(a: bigint, b: bigint): bigint {
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

export function bigintToHex(n: bigint): string {
  return n.toString(16);
}

export function truncateHex(hex: string, maxLen: number = 32): string {
  if (hex.length <= maxLen) return hex;
  const half = Math.floor(maxLen / 2) - 1;
  return hex.slice(0, half) + "···" + hex.slice(-half);
}

export function bigintBitLength(n: bigint): number {
  if (n === 0n) return 0;
  return n.toString(2).length;
}
