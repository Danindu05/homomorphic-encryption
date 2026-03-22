export function gcd(a: bigint, b: bigint): bigint {
  while (b !== 0n) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

export function lcm(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return (a * b) / gcd(a, b);
}

export function modPow(base: bigint, exp: bigint, mod: bigint): bigint {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
}

export function modInv(a: bigint, m: bigint): bigint {
  const m0 = m;
  let y = 0n, x = 1n;
  if (m === 1n) return 0n;
  while (a > 1n) {
    const q = a / m;
    let t = m;
    m = a % m;
    a = t;
    t = y;
    y = x - q * y;
    x = t;
  }
  if (x < 0n) x += m0;
  return x;
}

export function getRandomBigInt(bits: number): bigint {
  let result = '';
  for (let i = 0; i < bits; i++) {
    result += Math.random() > 0.5 ? '1' : '0';
  }
  result = '1' + result.substring(1);
  return BigInt('0b' + result);
}

export function isProbablePrime(n: bigint, k: number = 5): boolean {
  if (n === 2n || n === 3n) return true;
  if (n <= 1n || n % 2n === 0n) return false;
  
  let d = n - 1n;
  let s = 0n;
  while (d % 2n === 0n) {
    d /= 2n;
    s += 1n;
  }
  
  for (let i = 0; i < k; i++) {
    const a = BigInt(Math.floor(Math.random() * 100) + 2) % (n - 3n) + 2n;
    let x = modPow(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    
    let isComposite = true;
    for (let r = 1n; r < s; r++) {
      x = modPow(x, 2n, n);
      if (x === n - 1n) {
        isComposite = false;
        break;
      }
    }
    if (isComposite) return false;
  }
  return true;
}

export function generatePrime(bits: number): bigint {
  let attempts = 0;
  while (attempts < 1000) {
    let p = getRandomBigInt(bits);
    if (p % 2n === 0n) p += 1n;
    if (isProbablePrime(p)) return p;
    attempts++;
  }
  return 101n; // Fallback
}
