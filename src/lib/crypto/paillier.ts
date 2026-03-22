import { lcm, modInv, modPow, generatePrime, getRandomBigInt } from './bigint-utils';

export interface PaillierPublicKey {
  n: bigint;
  g: bigint;
  n2: bigint;
}

export interface PaillierPrivateKey {
  lambda: bigint;
  mu: bigint;
}

export interface PaillierKeyPair {
  publicKey: PaillierPublicKey;
  privateKey: PaillierPrivateKey;
}

export class Paillier {
  static generateKeys(bits: number = 256): PaillierKeyPair {
    const p = generatePrime(bits / 2);
    const q = generatePrime(bits / 2);
    
    const n = p * q;
    const n2 = n * n;
    
    // lambda = lcm(p-1, q-1)
    const lambda = lcm(p - 1n, q - 1n);
    
    // g = n + 1
    const g = n + 1n;
    
    // mu = (L(g^lambda mod n^2))^-1 mod n
    const u = modPow(g, lambda, n2);
    const l = this.L(u, n);
    const mu = modInv(l, n);
    
    return {
      publicKey: { n, g, n2 },
      privateKey: { lambda, mu }
    };
  }
  
  static L(u: bigint, n: bigint): bigint {
    return (u - 1n) / n;
  }

  static encrypt(m: bigint, pk: PaillierPublicKey): bigint {
    let r = getRandomBigInt(64) % pk.n;
    if (r === 0n) r = 1n;
    
    // c = g^m * r^n mod n^2
    const c1 = modPow(pk.g, m, pk.n2);
    const c2 = modPow(r, pk.n, pk.n2);
    return (c1 * c2) % pk.n2;
  }
  
  static decrypt(c: bigint, pk: PaillierPublicKey, sk: PaillierPrivateKey): bigint {
    const u = modPow(c, sk.lambda, pk.n2);
    const l = this.L(u, pk.n);
    return (l * sk.mu) % pk.n;
  }
  
  static add(c1: bigint, c2: bigint, pk: PaillierPublicKey): bigint {
    return (c1 * c2) % pk.n2;
  }
  
  static multiply(c1: bigint, k: bigint, pk: PaillierPublicKey): bigint {
    return modPow(c1, k, pk.n2);
  }
}
