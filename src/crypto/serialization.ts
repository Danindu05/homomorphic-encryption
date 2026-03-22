// Serialization helpers for transferring BigInt data to/from Web Worker

import type {
  PaillierPublicKey,
  PaillierPrivateKey,
  PaillierKeyPair,
  SerializedPublicKey,
  SerializedPrivateKey,
  SerializedKeyPair,
} from "./types";

export function serializePublicKey(pk: PaillierPublicKey): SerializedPublicKey {
  return { n: pk.n.toString(), n2: pk.n2.toString(), g: pk.g.toString(), bits: pk.bits };
}

export function deserializePublicKey(spk: SerializedPublicKey): PaillierPublicKey {
  return { n: BigInt(spk.n), n2: BigInt(spk.n2), g: BigInt(spk.g), bits: spk.bits };
}

export function serializePrivateKey(sk: PaillierPrivateKey): SerializedPrivateKey {
  return {
    lambda: sk.lambda.toString(),
    mu: sk.mu.toString(),
    p: sk.p.toString(),
    q: sk.q.toString(),
    publicKey: serializePublicKey(sk.publicKey),
  };
}

export function deserializePrivateKey(ssk: SerializedPrivateKey): PaillierPrivateKey {
  return {
    lambda: BigInt(ssk.lambda),
    mu: BigInt(ssk.mu),
    p: BigInt(ssk.p),
    q: BigInt(ssk.q),
    publicKey: deserializePublicKey(ssk.publicKey),
  };
}

export function serializeKeyPair(kp: PaillierKeyPair): SerializedKeyPair {
  return {
    publicKey: serializePublicKey(kp.publicKey),
    privateKey: serializePrivateKey(kp.privateKey),
    bitLength: kp.bitLength,
  };
}

export function deserializeKeyPair(skp: SerializedKeyPair): PaillierKeyPair {
  return {
    publicKey: deserializePublicKey(skp.publicKey),
    privateKey: deserializePrivateKey(skp.privateKey),
    bitLength: skp.bitLength,
  };
}
