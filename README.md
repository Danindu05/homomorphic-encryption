<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=flat-square&logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-FF0055?style=flat-square&logo=framer" />
</p>

<h1 align="center">🔐 HE.Compute</h1>
<h3 align="center">Homomorphic Encryption — Interactive Research Simulation</h3>

<p align="center">
  <em>A browser-based, research-grade demonstration of secure outsourced computation<br/>using Partially and Fully Homomorphic Encryption schemes.</em>
</p>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [What is Homomorphic Encryption?](#-what-is-homomorphic-encryption)
- [Key Comparison](#-traditional-encryption-vs-homomorphic-encryption)
- [PHE vs FHE](#-phe-vs-fhe)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Getting Started](#-getting-started)
- [Demo Walkthrough](#-demo-walkthrough)
- [Academic Limitations](#-academic-limitations)
- [Future Work](#-future-work)
- [Tech Stack](#-tech-stack)

---

## 🎯 Problem Statement

Modern cloud computing demands that clients outsource data processing to external servers. Traditional security protocols protect data **at rest** (AES disk encryption) and **in transit** (TLS/SSL), but require the server to **decrypt data in memory** to perform any computation.

This creates a fundamental vulnerability:

> If the cloud server is compromised — whether by an external breach, insider threat, or the **"Honest-but-Curious"** adversarial model — the raw plaintext data is entirely exposed.

**HE.Compute** demonstrates the solution: **Homomorphic Encryption**, a cryptographic paradigm that allows an untrusted server to compute directly on encrypted data, without ever decrypting it.

---

## 🧠 What is Homomorphic Encryption?

Homomorphic Encryption (HE) is a class of encryption schemes that preserves a **structural homomorphism** between the plaintext algebraic space and the ciphertext algebraic space.

This means specific operations (addition, multiplication) can be performed on ciphertexts, producing an encrypted result which — when decrypted with the private key — exactly matches the result of the same operations on the original plaintexts:

```
Dec( Enc(A) ⊕ Enc(B) ) = A + B
Dec( Enc(A) ⊗ Enc(B) ) = A × B
```

The server **does not possess the private key** and therefore **cannot decrypt the data** at any stage of computation.

---

## ⚖️ Traditional Encryption vs Homomorphic Encryption

| Property | Traditional Encryption | Homomorphic Encryption |
|---|---|---|
| **Data at rest** | ✅ Protected | ✅ Protected |
| **Data in transit** | ✅ Protected | ✅ Protected |
| **Data in use (computation)** | ❌ **Exposed** — must decrypt | ✅ **Protected** — compute on ciphertext |
| **Server trust required** | Full trust required | Zero trust required |

> **Key takeaway:** Traditional encryption protects data at rest and in transit, but not during computation. Homomorphic encryption extends protection to **data in use**.

---

## 🔬 PHE vs FHE

HE.Compute implements and compares two generations of homomorphic encryption:

### Partially Homomorphic Encryption (PHE) — Paillier Cryptosystem

| Aspect | Detail |
|---|---|
| **Supported operations** | Unlimited **addition** only |
| **Implementation** | Native JavaScript `BigInt` with Web Workers |
| **Performance** | Fast — millisecond-range computation |
| **Use cases** | Secure payroll aggregation, e-voting tallies, financial ledgers |
| **Core formula** | `Enc(a + b) = Enc(a) × Enc(b) mod n²` |

### Fully Homomorphic Encryption (FHE) — BFV/CKKS Simulation

| Aspect | Detail |
|---|---|
| **Supported operations** | Arbitrary **addition + multiplication** (Turing-complete) |
| **Implementation** | Algorithmic simulation with accurate noise modelling |
| **Performance** | Extreme latency — orders of magnitude slower than plaintext |
| **Critical challenge** | **Noise accumulation** — multiplications grow ciphertext noise exponentially; exceeding the threshold corrupts decryption |
| **Core formula** | `Enc(a × b) = Enc(a) ⊗ Enc(b)` (requires Relinearization keys) |

---

## 🏛️ System Architecture

The application implements a strict **three-domain Client–Server split**:

```
┌─────────────────────┐     ┌───────────────┐     ┌─────────────────────────┐
│   TRUSTED CLIENT    │     │   NETWORK     │     │   UNTRUSTED SERVER      │
│                     │────▶│   ATTACKER    │────▶│   (Honest-but-Curious)  │
│  • Key Generation   │     │               │     │                         │
│  • Encryption       │     │  Sees ONLY    │     │  • Receives ciphertexts │
│  • Decryption       │◀────│  random noise │◀────│  • Homomorphic compute  │
│                     │     │               │     │  • Zero key access      │
│  Holds: sk, pk      │     └───────────────┘     │  Holds: pk, evk only    │
└─────────────────────┘                           └─────────────────────────┘
```

- **Trusted Client** — Generates the key pair `(pk, sk)`. All plaintext operations (encryption and decryption) occur exclusively within this boundary. The private key **never** leaves this domain.
- **Network Interception Zone** — Visualises what a Man-in-the-Middle attacker observes: semantically secure, statistically indistinguishable random noise.
- **Untrusted Server** — Receives only ciphertexts and evaluation keys. Executes homomorphic circuits blindly. The server does not possess the private key and therefore cannot decrypt the data.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Interactive PHE Demo** | Real Paillier encryption/decryption using BigInt + Web Workers |
| **FHE Noise Simulator** | Accurate noise-growth visualisation with Recharts line graphs |
| **Client–Server Split View** | Three-panel UI showing Trusted Client, Network Attacker, and Untrusted Server |
| **Guided Payroll Scenario** | End-to-end auto-play demo simulating secure cloud payroll processing |
| **Progressive Math Disclosure** | Collapsible "View Math" panels for core cryptographic formulas |
| **Real-time Narration Panel** | Step-by-step explanation of what is happening and why it matters |
| **Critical Step Highlighting** | Visual emphasis (glow, animation) during the server computation step |
| **System & Threat Model Page** | Formal comparison of traditional vs. homomorphic security architectures |
| **Performance Analytics** | Stacked bar chart comparing plaintext, PHE, and FHE latency profiles |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Danindu05/homomorphic-encryption.git
cd homomorphic-encryption/encrypt-compute-main

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🎬 Demo Walkthrough

### Auto-Play Presentation Mode

Navigate to **Demo Gallery → Secure Payroll** and click **🚀 Demo Presentation Mode (Auto-Play)**.

The system automatically advances through a 7-stage real-world simulation:

| Step | Action | Domain |
|------|--------|--------|
| 0 | Input plaintext salary values | Client |
| 1 | Encrypt each salary into a distinct ciphertext | Client |
| 2 | Transmit ciphertexts over untrusted network | Network |
| 3 | Server receives encrypted payload (zero-knowledge state) | Server |
| 4 | **⚠️ Critical step:** Server computes encrypted total WITHOUT decrypting | Server |
| 5 | Return encrypted result to client | Network |
| 6 | Client decrypts using private key — total matches exactly | Client |

> **💡 Key Insight:** Computation is performed without revealing the underlying data.

---

## ⚠️ Academic Limitations

This application is built for **educational demonstration and academic presentation purposes**.

| Limitation | Explanation |
|---|---|
| **Reduced key sizes** | Paillier uses 128/256-bit keys (instead of 2048-bit) to ensure fluid browser performance via JavaScript BigInt. These are **not** cryptographically secure for production use. |
| **FHE is simulated** | The FHE module is an algorithmic simulation designed to accurately model noise accumulation, latency, and architecture — not a binding to real FHE libraries (e.g., Microsoft SEAL, OpenFHE). |
| **PHE is addition-only** | The Paillier cryptosystem supports strictly additive homomorphism. Multiplicative operations require fundamentally different schemes (e.g., ElGamal) or FHE. |
| **Single-threaded compute** | Web Workers are used for key generation, but homomorphic operations run on the main thread for UI responsiveness. |

---

## 🔮 Future Work

- **WebAssembly FHE:** Compile OpenFHE/Microsoft SEAL via Emscripten to run legitimate CKKS/BFV operations entirely in the browser.
- **Hardware Acceleration:** Leverage WebGPU APIs for polynomial multiplication and RNS transformation offloading.
- **Relinearization Visualiser:** Interactive step allowing users to generate Evaluation Keys and observe noise reduction in real time.
- **Multi-Key HE (MKHE):** Demonstrate architectures where multiple clients combine ciphertexts encrypted under distinct keys.
- **Distributed Server:** Deploy a real Express.js backend to physically isolate the untrusted computation environment from the client.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build tool** | Vite 5 |
| **Styling** | Tailwind CSS 3, shadcn/ui |
| **Animations** | Framer Motion 11 |
| **Charts** | Recharts |
| **Cryptography** | Native JavaScript BigInt (Paillier), Algorithmic FHE Simulation |
| **Concurrency** | Web Workers for key generation |
| **Icons** | Lucide React |

---

<p align="center">
  <sub>Built for academic research and presentation purposes.</sub><br/>
  <sub>© 2026 — HE.Compute</sub>
</p>
