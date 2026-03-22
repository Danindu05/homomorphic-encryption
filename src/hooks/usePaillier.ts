import { useState, useCallback, useRef, useEffect } from "react";
import type {
  PaillierKeyPair,
  PaillierPublicKey,
  PaillierPrivateKey,
  WorkerRequest,
  WorkerResponse,
  BenchmarkData,
} from "@/crypto/types";
import {
  serializePublicKey,
  serializePrivateKey,
  deserializeKeyPair,
} from "@/crypto/serialization";

// Inline worker creation using Vite's worker import
function createWorker(): Worker {
  return new Worker(new URL("@/crypto/cryptoWorker.ts", import.meta.url), {
    type: "module",
  });
}

let globalId = 0;
function nextId(): string {
  return `paillier-${++globalId}-${Date.now()}`;
}

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  onProgress?: (message: string) => void;
}

export function usePaillier() {
  const [keyPair, setKeyPair] = useState<PaillierKeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());

  // Initialize worker
  useEffect(() => {
    const worker = createWorker();
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      const msg = e.data;
      const pending = pendingRef.current.get(msg.id);

      if (msg.type === "progress") {
        if (pending?.onProgress) {
          pending.onProgress(msg.message);
        }
        return; // Don't resolve yet
      }

      if (!pending) return;
      pendingRef.current.delete(msg.id);

      if (msg.type === "error") {
        pending.reject(new Error(msg.error));
      } else {
        pending.resolve(msg);
      }
    };

    worker.onerror = (e) => {
      console.error("Crypto worker error:", e);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const sendRequest = useCallback(
    <T>(req: Record<string, unknown>, onProgress?: (msg: string) => void): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error("Worker not initialized"));
          return;
        }
        const id = nextId();
        pendingRef.current.set(id, {
          resolve: resolve as (v: unknown) => void,
          reject,
          onProgress,
        });
        workerRef.current.postMessage({ ...req, id });
      });
    },
    []
  );

  const generateKeys = useCallback(
    async (bitLength: number): Promise<PaillierKeyPair> => {
      setIsGenerating(true);
      setGenerationProgress(`Generating ${bitLength}-bit key pair...`);
      setError(null);

      try {
        const response = await sendRequest<WorkerResponse & { type: "generateKeys" }>(
          { type: "generateKeys", bitLength },
          (msg) => setGenerationProgress(msg)
        );
        if (response.type === "generateKeys") {
          const kp = deserializeKeyPair(response.result);
          setKeyPair(kp);
          setGenerationProgress("");
          return kp;
        }
        throw new Error("Unexpected response type");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Key generation failed";
        setError(msg);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [sendRequest]
  );

  const encrypt = useCallback(
    async (m: bigint, publicKey?: PaillierPublicKey): Promise<bigint> => {
      const pk = publicKey ?? keyPair?.publicKey;
      if (!pk) throw new Error("No public key available");
      const response = await sendRequest<WorkerResponse & { type: "encrypt" }>({
        type: "encrypt",
        m: m.toString(),
        publicKey: serializePublicKey(pk),
      });
      if (response.type === "encrypt") return BigInt(response.result);
      throw new Error("Unexpected response");
    },
    [keyPair, sendRequest]
  );

  const decrypt = useCallback(
    async (c: bigint, privateKey?: PaillierPrivateKey): Promise<bigint> => {
      const sk = privateKey ?? keyPair?.privateKey;
      if (!sk) throw new Error("No private key available");
      const response = await sendRequest<WorkerResponse & { type: "decrypt" }>({
        type: "decrypt",
        c: c.toString(),
        privateKey: serializePrivateKey(sk),
      });
      if (response.type === "decrypt") return BigInt(response.result);
      throw new Error("Unexpected response");
    },
    [keyPair, sendRequest]
  );

  const homAdd = useCallback(
    async (c1: bigint, c2: bigint, publicKey?: PaillierPublicKey): Promise<bigint> => {
      const pk = publicKey ?? keyPair?.publicKey;
      if (!pk) throw new Error("No public key available");
      const response = await sendRequest<WorkerResponse & { type: "homAdd" }>({
        type: "homAdd",
        c1: c1.toString(),
        c2: c2.toString(),
        publicKey: serializePublicKey(pk),
      });
      if (response.type === "homAdd") return BigInt(response.result);
      throw new Error("Unexpected response");
    },
    [keyPair, sendRequest]
  );

  const homMulConst = useCallback(
    async (c: bigint, k: bigint, publicKey?: PaillierPublicKey): Promise<bigint> => {
      const pk = publicKey ?? keyPair?.publicKey;
      if (!pk) throw new Error("No public key available");
      const response = await sendRequest<WorkerResponse & { type: "homMulConst" }>({
        type: "homMulConst",
        c: c.toString(),
        k: k.toString(),
        publicKey: serializePublicKey(pk),
      });
      if (response.type === "homMulConst") return BigInt(response.result);
      throw new Error("Unexpected response");
    },
    [keyPair, sendRequest]
  );

  const batchEncrypt = useCallback(
    async (values: bigint[], publicKey?: PaillierPublicKey): Promise<bigint[]> => {
      const pk = publicKey ?? keyPair?.publicKey;
      if (!pk) throw new Error("No public key available");
      const response = await sendRequest<WorkerResponse & { type: "batchEncrypt" }>({
        type: "batchEncrypt",
        values: values.map((v) => v.toString()),
        publicKey: serializePublicKey(pk),
      });
      if (response.type === "batchEncrypt") return response.result.map((r) => BigInt(r));
      throw new Error("Unexpected response");
    },
    [keyPair, sendRequest]
  );

  const runBenchmark = useCallback(
    async (bitLength: number): Promise<BenchmarkData> => {
      const response = await sendRequest<WorkerResponse & { type: "benchmark" }>({
        type: "benchmark",
        bitLength,
      });
      if (response.type === "benchmark") return response.result;
      throw new Error("Unexpected response");
    },
    [sendRequest]
  );

  return {
    keyPair,
    isGenerating,
    generationProgress,
    generateKeys,
    encrypt,
    decrypt,
    homAdd,
    homMulConst,
    batchEncrypt,
    runBenchmark,
    error,
    setKeyPair,
  };
}
