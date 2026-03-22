// Paillier Cryptosystem — Type definitions

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

// Worker message types
export type WorkerRequest =
  | { id: string; type: "generateKeys"; bitLength: number }
  | { id: string; type: "encrypt"; m: string; publicKey: SerializedPublicKey }
  | { id: string; type: "decrypt"; c: string; privateKey: SerializedPrivateKey }
  | { id: string; type: "homAdd"; c1: string; c2: string; publicKey: SerializedPublicKey }
  | { id: string; type: "homMulConst"; c: string; k: string; publicKey: SerializedPublicKey }
  | { id: string; type: "batchEncrypt"; values: string[]; publicKey: SerializedPublicKey }
  | { id: string; type: "benchmark"; bitLength: number };

export type WorkerResponse =
  | { id: string; type: "generateKeys"; result: SerializedKeyPair }
  | { id: string; type: "encrypt"; result: string }
  | { id: string; type: "decrypt"; result: string }
  | { id: string; type: "homAdd"; result: string }
  | { id: string; type: "homMulConst"; result: string }
  | { id: string; type: "batchEncrypt"; result: string[] }
  | { id: string; type: "benchmark"; result: BenchmarkData }
  | { id: string; type: "progress"; message: string }
  | { id: string; type: "error"; error: string };

export interface SerializedPublicKey {
  n: string;
  n2: string;
  g: string;
  bits: number;
}

export interface SerializedPrivateKey {
  lambda: string;
  mu: string;
  p: string;
  q: string;
  publicKey: SerializedPublicKey;
}

export interface SerializedKeyPair {
  publicKey: SerializedPublicKey;
  privateKey: SerializedPrivateKey;
  bitLength: number;
}

export interface BenchmarkData {
  keyGenMs: number;
  encryptMs: number;
  heAddMs: number;
  decryptMs: number;
  plainAddMs: number;
  verified: boolean;
}
