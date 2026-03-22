import { Paillier, PaillierPublicKey, PaillierPrivateKey } from '../lib/crypto/paillier';

export type PaillierWorkerRequest =
  | { type: 'GENERATE_KEYS'; bits?: number }
  | { type: 'ENCRYPT'; m: string; pk: PaillierPublicKey }
  | { type: 'DECRYPT'; c: string; pk: PaillierPublicKey; sk: PaillierPrivateKey }
  | { type: 'ADD'; c1: string; c2: string; pk: PaillierPublicKey }
  | { type: 'MULTIPLY'; c: string; k: string; pk: PaillierPublicKey };

export type PaillierWorkerResponse =
  | { type: 'GENERATE_KEYS_DONE'; pk: PaillierPublicKey; sk: PaillierPrivateKey }
  | { type: 'ENCRYPT_DONE'; result: string }
  | { type: 'DECRYPT_DONE'; result: string }
  | { type: 'ADD_DONE'; result: string }
  | { type: 'MULTIPLY_DONE'; result: string }
  | { type: 'ERROR'; error: string };

self.onmessage = (e: MessageEvent<PaillierWorkerRequest>) => {
  try {
    const data = e.data;
    switch (data.type) {
      case 'GENERATE_KEYS': {
        const keys = Paillier.generateKeys(data.bits || 256);
        self.postMessage({
          type: 'GENERATE_KEYS_DONE',
          pk: keys.publicKey,
          sk: keys.privateKey
        });
        break;
      }
      case 'ENCRYPT': {
        const c = Paillier.encrypt(BigInt(data.m), data.pk);
        self.postMessage({
          type: 'ENCRYPT_DONE',
          result: c.toString()
        });
        break;
      }
      case 'DECRYPT': {
        const m = Paillier.decrypt(BigInt(data.c), data.pk, data.sk);
        self.postMessage({
          type: 'DECRYPT_DONE',
          result: m.toString()
        });
        break;
      }
      case 'ADD': {
        const res = Paillier.add(BigInt(data.c1), BigInt(data.c2), data.pk);
        self.postMessage({
          type: 'ADD_DONE',
          result: res.toString()
        });
        break;
      }
      case 'MULTIPLY': {
        const res = Paillier.multiply(BigInt(data.c), BigInt(data.k), data.pk);
        self.postMessage({
          type: 'MULTIPLY_DONE',
          result: res.toString()
        });
        break;
      }
      default:
        throw new Error('Unknown operation');
    }
  } catch (error) {
    self.postMessage({ type: 'ERROR', error: (error as Error).message });
  }
};
