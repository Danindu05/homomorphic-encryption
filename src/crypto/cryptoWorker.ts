// Paillier Crypto Web Worker
// Runs all heavy crypto operations off the main thread

import { generateKeys, encrypt, decrypt, homAdd, homMulConst } from "./paillier";
import { serializeKeyPair, deserializePublicKey, deserializePrivateKey } from "./serialization";
import type { WorkerRequest, WorkerResponse } from "./types";

function postMsg(msg: WorkerResponse) {
  self.postMessage(msg);
}

function postProgress(id: string, message: string) {
  postMsg({ id, type: "progress", message });
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const req = e.data;

  try {
    switch (req.type) {
      case "generateKeys": {
        postProgress(req.id, `Generating ${req.bitLength}-bit primes...`);
        const result = generateKeys(req.bitLength);
        postProgress(
          req.id,
          `Found p after ${result.pCandidates} candidates, q after ${result.qCandidates} candidates`
        );
        postMsg({
          id: req.id,
          type: "generateKeys",
          result: serializeKeyPair(result.keyPair),
        });
        break;
      }

      case "encrypt": {
        const pk = deserializePublicKey(req.publicKey);
        const c = encrypt(BigInt(req.m), pk);
        postMsg({ id: req.id, type: "encrypt", result: c.toString() });
        break;
      }

      case "decrypt": {
        const sk = deserializePrivateKey(req.privateKey);
        const m = decrypt(BigInt(req.c), sk);
        postMsg({ id: req.id, type: "decrypt", result: m.toString() });
        break;
      }

      case "homAdd": {
        const pk = deserializePublicKey(req.publicKey);
        const result = homAdd(BigInt(req.c1), BigInt(req.c2), pk);
        postMsg({ id: req.id, type: "homAdd", result: result.toString() });
        break;
      }

      case "homMulConst": {
        const pk = deserializePublicKey(req.publicKey);
        const result = homMulConst(BigInt(req.c), BigInt(req.k), pk);
        postMsg({ id: req.id, type: "homMulConst", result: result.toString() });
        break;
      }

      case "batchEncrypt": {
        const pk = deserializePublicKey(req.publicKey);
        const results: string[] = [];
        for (let i = 0; i < req.values.length; i++) {
          const c = encrypt(BigInt(req.values[i]), pk);
          results.push(c.toString());
          if (req.values.length > 5) {
            postProgress(req.id, `Encrypting ${i + 1}/${req.values.length}...`);
          }
        }
        postMsg({ id: req.id, type: "batchEncrypt", result: results });
        break;
      }

      case "benchmark": {
        const bits = req.bitLength;

        // Key gen
        const t0 = performance.now();
        const kgResult = generateKeys(bits);
        const keyGenMs = performance.now() - t0;
        const kp = kgResult.keyPair;

        // Encrypt 100 numbers
        const nums = Array.from({ length: 100 }, (_, i) => BigInt(i + 1));
        const t1 = performance.now();
        const encrypted = nums.map((n) => encrypt(n, kp.publicKey));
        const encryptMs = performance.now() - t1;

        // HE Add 99 ops
        const t2 = performance.now();
        let sum = encrypted[0];
        for (let i = 1; i < encrypted.length; i++) {
          sum = homAdd(sum, encrypted[i], kp.publicKey);
        }
        const heAddMs = performance.now() - t2;

        // Decrypt
        const t3 = performance.now();
        const result = decrypt(sum, kp.privateKey);
        const decryptMs = performance.now() - t3;

        // Plain
        const t4 = performance.now();
        let plainSum = 0n;
        for (const n of nums) plainSum += n;
        const plainAddMs = Math.max(performance.now() - t4, 0.001);

        const expected = (100n * 101n) / 2n;

        postMsg({
          id: req.id,
          type: "benchmark",
          result: {
            keyGenMs,
            encryptMs,
            heAddMs,
            decryptMs,
            plainAddMs,
            verified: result === expected,
          },
        });
        break;
      }
    }
  } catch (err) {
    postMsg({
      id: req.id,
      type: "error",
      error: err instanceof Error ? err.message : String(err),
    });
  }
};
