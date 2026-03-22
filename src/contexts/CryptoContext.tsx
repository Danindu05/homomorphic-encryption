import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import type { PaillierKeyPair, PaillierPublicKey, PaillierPrivateKey } from "@/crypto/types";
import { encrypt, decrypt, homAdd, homMulConst } from "@/crypto/paillier";
import { bigintToHex, truncateHex } from "@/crypto/bigintHelpers";
import { usePaillier } from "@/hooks/usePaillier";

// --- Crypto Log ---
export interface CryptoLogEntry {
  timestamp: Date;
  type: "encrypt" | "decrypt" | "homAdd" | "homMulConst" | "verify" | "error";
  message: string;
  durationMs?: number;
}

interface CryptoLogContextValue {
  entries: CryptoLogEntry[];
  log: (type: CryptoLogEntry["type"], message: string, durationMs?: number) => void;
  clearLog: () => void;
}

const CryptoLogContext = createContext<CryptoLogContextValue>({
  entries: [],
  log: () => {},
  clearLog: () => {},
});

export const useCryptoLog = () => useContext(CryptoLogContext);

// --- Crypto Context ---
interface CryptoContextValue {
  keyPair: PaillierKeyPair | null;
  isGenerating: boolean;
  generationProgress: string;
  generateNewKeys: (bits: number) => Promise<PaillierKeyPair>;
  setKeyPair: (kp: PaillierKeyPair) => void;
  // Sync operations using current keys
  encryptValue: (m: bigint, pk?: PaillierPublicKey) => bigint;
  decryptValue: (c: bigint, sk?: PaillierPrivateKey) => bigint;
  homomorphicAdd: (c1: bigint, c2: bigint, pk?: PaillierPublicKey) => bigint;
  homomorphicMulConst: (c: bigint, k: bigint, pk?: PaillierPublicKey) => bigint;
  // Worker-based async
  runBenchmark: (bits: number) => Promise<import("@/crypto/types").BenchmarkData>;
  // Key metadata
  keyGeneratedAt: Date | null;
  pendingKeyReset: boolean;
  setPendingKeyReset: (v: boolean) => void;
}

const CryptoContext = createContext<CryptoContextValue | null>(null);

export const useCrypto = () => {
  const ctx = useContext(CryptoContext);
  if (!ctx) throw new Error("useCrypto must be used within CryptoProvider");
  return ctx;
};

export const CryptoProvider = ({ children }: { children: React.ReactNode }) => {
  const paillier = usePaillier();
  const [keyGeneratedAt, setKeyGeneratedAt] = useState<Date | null>(null);
  const [pendingKeyReset, setPendingKeyReset] = useState(false);
  const [logEntries, setLogEntries] = useState<CryptoLogEntry[]>([]);

  // Auto-generate 512-bit key on mount
  useEffect(() => {
    if (!paillier.keyPair && !paillier.isGenerating) {
      paillier.generateKeys(512).then(() => {
        setKeyGeneratedAt(new Date());
      }).catch(console.error);
    }
  }, []);

  const logFn = useCallback((type: CryptoLogEntry["type"], message: string, durationMs?: number) => {
    setLogEntries(prev => [...prev.slice(-200), { timestamp: new Date(), type, message, durationMs }]);
  }, []);

  const clearLog = useCallback(() => setLogEntries([]), []);

  const generateNewKeys = useCallback(async (bits: number) => {
    const kp = await paillier.generateKeys(bits);
    setKeyGeneratedAt(new Date());
    setPendingKeyReset(false);
    return kp;
  }, [paillier]);

  const encryptValue = useCallback((m: bigint, pk?: PaillierPublicKey) => {
    const key = pk ?? paillier.keyPair?.publicKey;
    if (!key) throw new Error("No public key");
    const t0 = performance.now();
    const c = encrypt(m, key);
    const ms = performance.now() - t0;
    logFn("encrypt", `Enc(${m.toString()}) → 0x${truncateHex(bigintToHex(c), 24)} [${ms.toFixed(1)}ms]`, ms);
    return c;
  }, [paillier.keyPair, logFn]);

  const decryptValue = useCallback((c: bigint, sk?: PaillierPrivateKey) => {
    const key = sk ?? paillier.keyPair?.privateKey;
    if (!key) throw new Error("No private key");
    const t0 = performance.now();
    const m = decrypt(c, key);
    const ms = performance.now() - t0;
    logFn("decrypt", `Dec(0x${truncateHex(bigintToHex(c), 16)}) → ${m.toString()} [${ms.toFixed(1)}ms]`, ms);
    return m;
  }, [paillier.keyPair, logFn]);

  const homomorphicAdd = useCallback((c1: bigint, c2: bigint, pk?: PaillierPublicKey) => {
    const key = pk ?? paillier.keyPair?.publicKey;
    if (!key) throw new Error("No public key");
    const t0 = performance.now();
    const r = homAdd(c1, c2, key);
    const ms = performance.now() - t0;
    logFn("homAdd", `0x${truncateHex(bigintToHex(c1), 8)} ⊕ 0x${truncateHex(bigintToHex(c2), 8)} → 0x${truncateHex(bigintToHex(r), 16)} [${ms.toFixed(1)}ms]`, ms);
    return r;
  }, [paillier.keyPair, logFn]);

  const homomorphicMulConst = useCallback((c: bigint, k: bigint, pk?: PaillierPublicKey) => {
    const key = pk ?? paillier.keyPair?.publicKey;
    if (!key) throw new Error("No public key");
    const t0 = performance.now();
    const r = homMulConst(c, k, key);
    const ms = performance.now() - t0;
    logFn("homMulConst", `0x${truncateHex(bigintToHex(c), 8)} ⊗ ${k.toString()} → 0x${truncateHex(bigintToHex(r), 16)} [${ms.toFixed(1)}ms]`, ms);
    return r;
  }, [paillier.keyPair, logFn]);

  return (
    <CryptoLogContext.Provider value={{ entries: logEntries, log: logFn, clearLog }}>
      <CryptoContext.Provider value={{
        keyPair: paillier.keyPair,
        isGenerating: paillier.isGenerating,
        generationProgress: paillier.generationProgress,
        generateNewKeys,
        setKeyPair: (kp) => { paillier.setKeyPair(kp); setKeyGeneratedAt(new Date()); },
        encryptValue,
        decryptValue,
        homomorphicAdd,
        homomorphicMulConst,
        runBenchmark: paillier.runBenchmark,
        keyGeneratedAt,
        pendingKeyReset,
        setPendingKeyReset,
      }}>
        {children}
      </CryptoContext.Provider>
    </CryptoLogContext.Provider>
  );
};
