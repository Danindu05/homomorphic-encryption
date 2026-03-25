import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Briefcase,
  Calculator,
  ChevronRight,
  FileSignature,
  LucideIcon,
  RefreshCw,
  Send,
  Server,
  Shield,
} from 'lucide-react';
import { PaillierAsync } from '../lib/crypto/paillier-client';
import { PaillierKeyPair } from '../lib/crypto/paillier';
import { ClientServerSplit } from '../components/shared/ClientServerSplit';
import { DataFlowArrow } from '../components/shared/DataFlowArrow';

type ScenarioId = 'PAYROLL' | 'VOTING';
type InputMode = 'number' | 'binary';

interface ScenarioConfig {
  id: ScenarioId;
  icon: LucideIcon;
  label: string;
  headline: string;
  computeSummary: string;
  inputLabels: string[];
  defaultInputs: string[];
  inputMode: InputMode;
  inputSymbol: string;
  binaryLabels?: {
    zero: string;
    one: string;
  };
  encryptButtonLabel: string;
  transmitButtonLabel: string;
  awaitingPayloadLabel: string;
  computeButtonLabel: string;
  computedCipherLabel: string;
  returnCipherLabel: string;
  resultTitle: string;
  resultDescription: string;
  zeroKnowledgeText: string;
  serverFormula: string;
  narration: Record<number, string>;
  formatResult: (value: bigint, inputs: string[]) => string;
  resultCaption: (value: bigint, inputs: string[]) => string;
}

const stepLabels = ['Input', 'Encrypt', 'Transit', 'Server', 'Compute', 'Return', 'Decrypt'];

const scenarioConfigs: Record<ScenarioId, ScenarioConfig> = {
  PAYROLL: {
    id: 'PAYROLL',
    icon: Briefcase,
    label: 'Secure Payroll',
    headline: 'Encrypt employee salaries, let the payroll cloud aggregate them blindly, then decrypt only the company total.',
    computeSummary: 'Homomorphic sum over four encrypted salary records.',
    inputLabels: ['Employee #1', 'Employee #2', 'Employee #3', 'Employee #4'],
    defaultInputs: ['65000', '82000', '54000', '91000'],
    inputMode: 'number',
    inputSymbol: 'S',
    encryptButtonLabel: 'Encrypt Salaries',
    transmitButtonLabel: 'Transmit to Payroll Cloud',
    awaitingPayloadLabel: 'Awaiting HR Payload...',
    computeButtonLabel: 'Compute Encrypted Total',
    computedCipherLabel: 'Computed E(Total)',
    returnCipherLabel: 'E(Total)',
    resultTitle: 'Decrypted Company Total',
    resultDescription: 'The client recovers only the final payroll total. Individual salary records never appear in plaintext on the cloud server.',
    zeroKnowledgeText: 'Zero-Knowledge State. The server does not possess the private key.',
    serverFormula: 'E(Total) = E(S_1) x E(S_2) x E(S_3) x E(S_4) mod n^2',
    narration: {
      0: 'Input plaintext salary values. The client device will generate a distinct ciphertext for each value.',
      1: 'Salaries successfully encrypted via Paillier. Each ciphertext is indistinguishable from random noise.',
      2: 'Transmitting ciphertexts over the untrusted network. Interceptors see nothing of value.',
      3: 'Server received the payload. The server does not possess the private key and therefore cannot decrypt the data. Zero-Knowledge state established.',
      4: 'Homomorphic property applied: Enc(S_1) x Enc(S_2) x ... mod n^2. The server computed the encrypted total without decryption.',
      5: 'Returning E(Total) ciphertext along the untrusted network back to the secure client perimeter.',
      6: 'Client uses private key to decrypt E(Total). Complete mathematical privacy of all individual inputs guaranteed.',
    },
    formatResult: (value) => `$${value.toLocaleString()}`,
    resultCaption: (_, inputs) => `${inputs.length} encrypted salaries were aggregated without exposing any individual compensation.`,
  },
  VOTING: {
    id: 'VOTING',
    icon: FileSignature,
    label: 'E-Voting',
    headline: 'Encrypt binary ballots, let the election server tally them blindly, then decrypt only the final approval count.',
    computeSummary: 'Homomorphic tally over encrypted yes/no ballots.',
    inputLabels: ['Ballot #1', 'Ballot #2', 'Ballot #3', 'Ballot #4'],
    defaultInputs: ['1', '0', '1', '1'],
    inputMode: 'binary',
    inputSymbol: 'V',
    binaryLabels: {
      zero: 'Reject',
      one: 'Approve',
    },
    encryptButtonLabel: 'Encrypt Ballots',
    transmitButtonLabel: 'Transmit to Election Server',
    awaitingPayloadLabel: 'Awaiting ballot batch...',
    computeButtonLabel: 'Tally Encrypted Votes',
    computedCipherLabel: 'Computed E(Tally)',
    returnCipherLabel: 'E(Tally)',
    resultTitle: 'Decrypted Election Tally',
    resultDescription: 'The election authority decrypts only the final tally. Each individual ballot remains hidden from the transport layer and the counting server.',
    zeroKnowledgeText: 'Blind ballot tally. The server cannot inspect any individual vote.',
    serverFormula: 'E(Tally) = E(V_1) x E(V_2) x E(V_3) x E(V_4) mod n^2, where V_i is 0 or 1',
    narration: {
      0: 'Ballots are encoded as binary values before encryption. A 1 means approve, and a 0 means reject.',
      1: 'Each ballot is encrypted independently, hiding individual voter intent behind randomized Paillier ciphertexts.',
      2: 'Encrypted ballots move through the untrusted network. Interceptors can copy packets but cannot infer any vote.',
      3: 'The election server receives only ciphertexts and therefore cannot read or alter the underlying ballot choices.',
      4: 'The tally is computed homomorphically. Multiplying encrypted ballots yields an encrypted approval count with no ballot ever decrypted on the server.',
      5: 'The encrypted tally is returned to the election authority over the same untrusted path.',
      6: 'Only the trusted authority decrypts E(Tally), revealing the final result while preserving ballot secrecy.',
    },
    formatResult: (value) => `${value.toString()} YES`,
    resultCaption: (value, inputs) => `${Math.round((Number(value) / inputs.length) * 100)}% approval across ${inputs.length} encrypted ballots.`,
  },
};

const initialScenarioInputs: Record<ScenarioId, string[]> = {
  PAYROLL: [...scenarioConfigs.PAYROLL.defaultInputs],
  VOTING: [...scenarioConfigs.VOTING.defaultInputs],
};

export default function UseCases() {
  const [activeTab, setActiveTab] = useState<ScenarioId>('PAYROLL');

  const paillierRef = useRef<PaillierAsync | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [keys, setKeys] = useState<PaillierKeyPair | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [step, setStep] = useState(0);
  const [scenarioInputs, setScenarioInputs] = useState<Record<ScenarioId, string[]>>(initialScenarioInputs);
  const [encryptedInputs, setEncryptedInputs] = useState<string[]>([]);
  const [encryptedResult, setEncryptedResult] = useState<string | null>(null);
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  const activeScenario = scenarioConfigs[activeTab];
  const activeInputs = scenarioInputs[activeTab];
  const inputsAreValid = activeInputs.every((value) => /^[0-9]+$/.test(value));
  const decryptedValue = decryptedResult !== null ? BigInt(decryptedResult) : null;

  const receivedCiphertextLabels = activeScenario.inputLabels.map((_, i) => ({
    label: `E(${activeScenario.inputSymbol}_${i + 1})`,
    ciphertext: encryptedInputs[i],
  }));

  const incomingPacketLabel = `[ ${receivedCiphertextLabels.map(({ label }) => label).join(', ')} ]`;

  useEffect(() => {
    paillierRef.current = new PaillierAsync();
    paillierRef.current.generateKeys(128).then((k) => {
      setKeys(k);
      setIsInitializing(false);
    });

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      paillierRef.current?.destroy();
    };
  }, []);

  const clearTransitionTimer = () => {
    if (!transitionTimerRef.current) return;
    clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  };

  const resetStory = () => {
    clearTransitionTimer();
    setStep(0);
    setEncryptedInputs([]);
    setEncryptedResult(null);
    setDecryptedResult(null);
    setIsAutoPlaying(false);
  };

  const scheduleStep = (nextStep: number, delayMs: number) => {
    clearTransitionTimer();
    transitionTimerRef.current = setTimeout(() => {
      setStep(nextStep);
      transitionTimerRef.current = null;
    }, delayMs);
  };

  const updateInput = (index: number, nextValue: string) => {
    setScenarioInputs((prev) => ({
      ...prev,
      [activeTab]: prev[activeTab].map((value, valueIndex) => (valueIndex === index ? nextValue : value)),
    }));
  };

  const handleEncryptAll = async () => {
    if (!paillierRef.current || !keys || !inputsAreValid) return;

    setStep(1);
    const ciphers: string[] = [];

    for (const value of activeInputs) {
      const cipher = await paillierRef.current.encrypt(BigInt(value), keys.publicKey);
      ciphers.push(cipher.toString());
      setEncryptedInputs([...ciphers]);
    }
  };

  const transmitToServer = () => {
    setStep(2);
    scheduleStep(3, 2000);
  };

  const handleCompute = async () => {
    if (!paillierRef.current || !keys || encryptedInputs.length === 0) return;

    let runningResult: bigint | null = null;

    for (let i = 0; i < encryptedInputs.length; i++) {
      const operand = BigInt(encryptedInputs[i]);

      runningResult =
        runningResult === null
          ? operand
          : await paillierRef.current.add(runningResult, operand, keys.publicKey);
    }

    if (runningResult === null) return;

    setEncryptedResult(runningResult.toString());
    setStep(4);
  };

  const transmitToClient = () => {
    setStep(5);
    scheduleStep(6, 2000);
  };

  const handleDecrypt = async () => {
    if (!paillierRef.current || !keys || !encryptedResult) return;

    const decrypted = await paillierRef.current.decrypt(BigInt(encryptedResult), keys.publicKey, keys.privateKey);
    setDecryptedResult(decrypted.toString());
  };

  const handleTabChange = (nextTab: ScenarioId) => {
    if (nextTab === activeTab) return;
    resetStory();
    setActiveTab(nextTab);
  };

  const handleStartAutoPlay = () => {
    resetStory();
    setIsAutoPlaying(true);
  };

  useEffect(() => {
    if (step === 6) {
      void handleDecrypt();
    }
  }, [step]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (step === 0) timer = setTimeout(() => void handleEncryptAll(), 1500);
    else if (step === 1) timer = setTimeout(() => transmitToServer(), 2000);
    else if (step === 3) timer = setTimeout(() => void handleCompute(), 2000);
    else if (step === 4) timer = setTimeout(() => transmitToClient(), 2000);
    else if (step === 6) setIsAutoPlaying(false);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [step, isAutoPlaying, activeTab, encryptedInputs, keys]);

  const clientContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-2.5">
        {activeScenario.inputLabels.map((label, i) => (
          <div
            key={label}
            className={`flex flex-col gap-1.5 rounded-xl border p-3 transition-all ${
              step >= 1 ? 'border-emerald-500/15 bg-emerald-500/[0.03]' : 'border-white/5 bg-black/20'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
              </div>

              {activeScenario.inputMode === 'binary' && activeScenario.binaryLabels ? (
                <div className="flex items-center rounded-lg border border-white/10 bg-black/20 p-1">
                  <button
                    type="button"
                    onClick={() => updateInput(i, '0')}
                    disabled={step > 0}
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-80 ${
                      activeInputs[i] === '0'
                        ? 'bg-white/10 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {activeScenario.binaryLabels.zero}
                  </button>
                  <button
                    type="button"
                    onClick={() => updateInput(i, '1')}
                    disabled={step > 0}
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors disabled:cursor-not-allowed disabled:opacity-80 ${
                      activeInputs[i] === '1'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {activeScenario.binaryLabels.one}
                  </button>
                </div>
              ) : (
                <input
                  type="text"
                  inputMode="numeric"
                  value={activeInputs[i]}
                  disabled={step > 0}
                  onChange={(e) => updateInput(i, e.target.value.replace(/[^\d]/g, ''))}
                  className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-right font-mono text-xs transition-colors focus:border-primary/30 focus:outline-none disabled:opacity-40"
                />
              )}
            </div>

            {step >= 1 && encryptedInputs[i] && (
              <div className="rounded-lg bg-emerald-500/[0.04] p-1.5 font-mono text-[8px] text-emerald-400/70 break-all">
                E({activeScenario.inputSymbol}_{i + 1}): {encryptedInputs[i].substring(0, 40)}...
              </div>
            )}
          </div>
        ))}
      </div>

      {!inputsAreValid && step === 0 && (
        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] px-3 py-2 font-mono text-[10px] text-red-300/80">
          All inputs must be non-negative integers before encryption.
        </div>
      )}

      {step === 0 && (
        <button
          onClick={() => void handleEncryptAll()}
          disabled={isAutoPlaying || !inputsAreValid}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/15 bg-amber-500/10 px-3 py-2 font-mono text-[11px] font-semibold text-amber-400 transition-all hover:bg-amber-500/15 disabled:opacity-50"
        >
          {isAutoPlaying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
          {activeScenario.encryptButtonLabel}
        </button>
      )}

      {step === 1 && (
        <button
          onClick={transmitToServer}
          disabled={isAutoPlaying}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-blue-500/15 bg-blue-500/10 px-3 py-2 font-mono text-[11px] font-semibold text-blue-400 transition-all hover:bg-blue-500/15 disabled:opacity-50"
        >
          {isAutoPlaying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          {activeScenario.transmitButtonLabel}
        </button>
      )}

      {step === 6 && decryptedValue !== null && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-5 text-center"
        >
          <div className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-500/70">
            {activeScenario.resultTitle}
          </div>
          <div className="text-3xl font-display font-bold text-emerald-400">
            {activeScenario.formatResult(decryptedValue, activeInputs)}
          </div>
          <div className="mt-2 font-mono text-[10px] text-emerald-300/70">
            {activeScenario.resultCaption(decryptedValue, activeInputs)}
          </div>
          <p className="mx-auto mt-3 max-w-sm font-mono text-[9px] leading-relaxed text-muted-foreground">
            {activeScenario.resultDescription}
          </p>
          <button
            onClick={resetStory}
            className="mt-3 rounded-lg border border-emerald-500/20 px-3 py-1 font-mono text-[9px] text-emerald-400/70 transition-colors hover:bg-emerald-500/10"
          >
            Restart Scenario
          </button>
        </motion.div>
      )}
    </div>
  );

  const serverContent = (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center space-y-4">
      {step < 3 ? (
        <div className="py-8 text-center font-mono text-xs text-orange-400/25">
          <Server className="mx-auto mb-3 h-10 w-10 opacity-40" />
          {activeScenario.awaitingPayloadLabel}
        </div>
      ) : (
        <div className="w-full space-y-3">
          <div className="rounded-xl border border-orange-500/10 bg-black/20 p-3">
            <h4 className="mb-2 border-b border-orange-500/10 pb-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-orange-400">
              Received Ciphertexts
            </h4>
            <div className="space-y-1">
              {receivedCiphertextLabels.map(({ label, ciphertext }, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 rounded-lg border border-orange-500/10 bg-orange-500/[0.06] px-2 py-1.5"
                >
                  <span className="font-mono text-[9px] text-orange-300">{label}</span>
                  <span className="max-w-[7rem] truncate font-mono text-[8px] text-orange-400/45 sm:max-w-[10rem]">
                    {ciphertext ? `${ciphertext.substring(0, 14)}...` : 'received'}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 font-mono text-[8px] text-orange-400/30">{activeScenario.zeroKnowledgeText}</div>
          </div>

          <div className="rounded-xl border border-orange-500/10 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h4 className="font-mono text-[9px] font-semibold uppercase tracking-wider text-orange-400">
                Homomorphic Compute
              </h4>
              <span className="font-mono text-[8px] text-orange-300/60">{activeScenario.computeSummary}</span>
            </div>

            {step === 3 && (
              <button
                onClick={() => void handleCompute()}
                disabled={isAutoPlaying}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/15 bg-amber-500/10 px-3 py-2 font-mono text-[11px] font-semibold text-amber-400 transition-all hover:bg-amber-500/15 disabled:opacity-50"
              >
                {isAutoPlaying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Calculator className="h-3.5 w-3.5" />}
                {activeScenario.computeButtonLabel}
              </button>
            )}

            <details className="group mt-3 cursor-pointer">
              <summary className="flex items-center gap-1 font-mono text-[9px] text-orange-400/60 transition-colors hover:text-orange-400 [&::-webkit-details-marker]:hidden">
                <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                View Homomorphic Formula
              </summary>
              <div className="mt-2 rounded-lg border border-orange-500/10 bg-orange-500/[0.04] p-2 font-mono text-[8px] leading-relaxed text-orange-300/70">
                {activeScenario.serverFormula}
              </div>
            </details>

            {step >= 4 && encryptedResult && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.04] p-3"
              >
                <h4 className="mb-1.5 border-b border-emerald-500/10 pb-1 font-mono text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
                  {activeScenario.computedCipherLabel}
                </h4>
                <div className="max-h-20 overflow-hidden break-all font-mono text-[8px] text-emerald-300/60">
                  {encryptedResult}
                </div>
                {step === 4 && (
                  <button
                    onClick={transmitToClient}
                    disabled={isAutoPlaying}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-blue-500/15 bg-blue-500/10 px-3 py-1.5 font-mono text-[10px] font-semibold text-blue-400 transition-all hover:bg-blue-500/15 disabled:opacity-50"
                  >
                    {isAutoPlaying ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3 rotate-180 transform" />
                    )}
                    Dispatch to Client
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const attackerView = (
    <AnimatePresence>
      <div className="flex w-full flex-col items-center justify-center gap-3">
        {step === 2 && (
          <DataFlowArrow direction="left-to-right" label={incomingPacketLabel} isEncrypted={true} />
        )}
        {step === 5 && (
          <DataFlowArrow direction="right-to-left" label={activeScenario.returnCipherLabel} isEncrypted={true} />
        )}
      </div>
    </AnimatePresence>
  );

  const tabs = (Object.keys(scenarioConfigs) as ScenarioId[]).map((scenarioId) => ({
    id: scenarioId,
    icon: scenarioConfigs[scenarioId].icon,
    label: scenarioConfigs[scenarioId].label,
  }));

  const ActiveScenarioIcon = activeScenario.icon;

  return (
    <div className="flex w-full flex-col items-center overflow-hidden">
      <section className="w-full max-w-6xl px-4 pb-8 pt-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="mb-3 text-3xl font-display font-bold">Real-World Guided Scenarios</h2>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A step-by-step interactive journey revealing how Homomorphic Encryption fundamentally alters cloud processing architectures.
          </p>
        </motion.div>
      </section>

      <section className="w-full max-w-6xl px-4">
        <div className="mb-8 flex justify-center gap-2 border-b border-white/5 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 font-mono text-xs transition-all ${
                  isActive
                    ? 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                    : 'border-transparent text-muted-foreground hover:bg-white/[0.03] hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" /> {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="w-full max-w-6xl space-y-5 px-4 pb-20">
        <div className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10">
              <ActiveScenarioIcon className="h-5 w-5 text-amber-400" />
            </div>
            <div className="min-w-0">
              <h3 className="font-display text-xl font-bold">{activeScenario.label}</h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {activeScenario.headline}
              </p>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-amber-400/70">
                {activeScenario.computeSummary}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={isAutoPlaying ? resetStory : handleStartAutoPlay}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2 font-mono text-[10px] font-semibold transition-all ${
                isAutoPlaying
                  ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/15'
                  : 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15'
              }`}
            >
              {isAutoPlaying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
              {isAutoPlaying ? 'Stop' : '🚀 Auto-Play Demo'}
            </button>
          </div>
        </div>

        <motion.div
          key={`${activeTab}-${step}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 rounded-2xl border border-amber-500/15 bg-amber-500/[0.03] p-5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/15">
            <span className="font-mono text-sm font-bold text-amber-400">{step}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-400">
              System State
            </h4>
            <p className="text-xs leading-relaxed text-amber-200/70">{activeScenario.narration[step]}</p>
          </div>
        </motion.div>

        <div className="mx-auto flex w-full max-w-xl items-center gap-1 py-2">
          {stepLabels.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full font-mono text-[8px] font-bold transition-all ${
                    step >= i
                      ? 'bg-amber-500 text-black'
                      : 'border border-amber-500/15 bg-black/30 text-amber-500/30'
                  }`}
                >
                  {i}
                </div>
                <span className={`font-mono text-[7px] ${step >= i ? 'text-amber-400/60' : 'text-white/15'}`}>
                  {label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`h-[1.5px] flex-1 ${step > i ? 'bg-amber-500/60' : 'bg-amber-500/10'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {isInitializing ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 font-mono text-xs text-amber-500/30">
            <RefreshCw className="h-6 w-6 animate-spin" />
            Bootstrapping Cryptosystem Engine...
          </div>
        ) : (
          <ClientServerSplit
            key={activeTab}
            clientContent={clientContent}
            serverContent={serverContent}
            attackerContent={attackerView}
          />
        )}
      </section>
    </div>
  );
}
