import { PaillierPublicKey, PaillierPrivateKey, PaillierKeyPair } from './paillier';

export class PaillierAsync {
  private worker: Worker;
  
  constructor() {
    this.worker = new Worker(new URL('../../workers/paillier.worker.ts', import.meta.url), {
      type: 'module'
    });
  }

  private runTask<T>(msg: Record<string, unknown>): Promise<T> {
    return new Promise((resolve, reject) => {
      const handler = (e: MessageEvent) => {
        if (e.data.type === 'ERROR') {
          this.worker.removeEventListener('message', handler);
          reject(new Error(e.data.error));
          return;
        }
        // Cleanup listener after single response
        this.worker.removeEventListener('message', handler);
        resolve(e.data as T);
      };
      this.worker.addEventListener('message', handler);
      this.worker.postMessage(msg);
    });
  }

  async generateKeys(bits: number = 256): Promise<PaillierKeyPair> {
    const res = await this.runTask<Record<string, unknown>>({ type: 'GENERATE_KEYS', bits });
    return { publicKey: res.pk as PaillierPublicKey, privateKey: res.sk as PaillierPrivateKey };
  }

  async encrypt(m: bigint, pk: PaillierPublicKey): Promise<bigint> {
    const res = await this.runTask<Record<string, unknown>>({ type: 'ENCRYPT', m: m.toString(), pk });
    return BigInt(res.result as string);
  }

  async decrypt(c: bigint, pk: PaillierPublicKey, sk: PaillierPrivateKey): Promise<bigint> {
    const res = await this.runTask<Record<string, unknown>>({ type: 'DECRYPT', c: c.toString(), pk, sk });
    return BigInt(res.result as string);
  }

  async add(c1: bigint, c2: bigint, pk: PaillierPublicKey): Promise<bigint> {
    const res = await this.runTask<Record<string, unknown>>({ type: 'ADD', c1: c1.toString(), c2: c2.toString(), pk });
    return BigInt(res.result as string);
  }

  async multiply(c: bigint, k: bigint, pk: PaillierPublicKey): Promise<bigint> {
    const res = await this.runTask<Record<string, unknown>>({ type: 'MULTIPLY', c: c.toString(), k: k.toString(), pk });
    return BigInt(res.result as string);
  }
  
  destroy() {
    this.worker.terminate();
  }
}
