# HE.Compute: Homomorphic Encryption Research Simulation

A research-grade, interactive web simulation demonstrating the architectural flows, cryptographic properties, and real-world implementation challenges of Homomorphic Encryption (HE). 

Built as an educational tool for academic presentations and distinction-level university projects, this system goes beyond traditional text-based explanations to provide a fully functioning zero-knowledge algebraic environment running entirely in the browser.

---

## 🎯 Problem Statement

Traditional cloud computing requires **Data Exfiltration Risk**. When a client outsources computation (like data aggregation or machine learning) to an external cloud server, the standard protocol involves encrypting data in transit (TLS/SSL) and at rest (AES), but **decrypting it in memory (RAM)** to perform the actual calculations.

If the cloud server is breached, or an insider acts maliciously (the "Honest-but-Curious" Threat Model), the raw plaintext data is entirely exposed.

This application demonstrates the solution: **Homomorphic Encryption**, which allows the untrusted server to compute mathematically directly on the ciphertexts *without ever decrypting them*.

---

## 🧠 What is Homomorphic Encryption?

Homomorphic encryption is a revolutionary cryptographic scheme that acts as a structural homomorphism between the plaintext space and ciphertext space. 

It allows specific algebraic operations, such as addition or multiplication, to be performed directly on ciphertext (`C`), generating a manipulated encrypted result which, when decrypted by the Client's private key (`SK`), precisely matches the result of the operations as if they had been performed on the plaintext (`P`).

$$ Dec(Enc(A) \otimes Enc(B)) = A \oplus B $$

---

## ⚖️ PHE vs FHE

HE.Compute strictly differentiates between two major generations of homomorphic encryption:

### 1. Partially Homomorphic Encryption (PHE) - *Paillier Scheme*
- **Capabilities:** Allows only ONE type of operation (e.g., unlimited Addition).
- **Implementation:** This demo uses a Native JavaScript `BigInt` implementation of the asymmetric **Paillier Cryptosystem**.
- **Performance:** Extremely fast. Capable of evaluating simple financial aggregations (like Secure Payroll) or electronic voting tallies in milliseconds.
- **Math:** $E(m_1) \cdot E(m_2) \mod n^2 = E(m_1 + m_2)$

### 2. Fully Homomorphic Encryption (FHE) - *CKKS/BFV Simulated*
- **Capabilities:** Allows arbitrary operations (both Addition and Multiplication), acting as a Turing-complete encrypted compute environment.
- **Implementation:** This demo uses an interactive *Simulation* of an FHE circuit to accurately model the "Noise Growth" penalty.
- **Performance:** Introduces extreme computational latency and ciphertext bloat. Executing multiplications creates exponential algorithmic "noise" that risks corrupting the polynomial vector if it exceeds the decryption threshold limit.

---

## 🏛️ System Architecture

The application implements a strict **Client-Server Split View**:

1. **Trusted Client Domain:** Holds the Private Key (sk). Plaintext data is strictly generated, encrypted, and decrypted here.
2. **Network Interception Zone:** Visualizes exactly what an attacker or Man-In-the-Middle sees (semantically secure random noise).
3. **Untrusted Server Domain (Honest-but-Curious):** Receives ciphertexts. Evaluates instructions blindly. Holds zero key access.

---

## 📸 Screenshots

*(Replace these placeholders with actual screenshots of your deployment)*

![Architecture Models](./docs/architecture.png)
> *System & Threat Models comparison.*

![Paillier Evaluation](./docs/phe-mode.png)
> *Interactive PHE Mode demonstrating homomorphic summation.*

![FHE Noise Visualizer](./docs/fhe-mode.png)
> *FHE Noise Limit tracking visualization utilizing Recharts.*

---

## 🚀 How to Run the Demo

### Demo Presentation Mode (Auto-Play)

Navigate to the **Demo Gallery -> Secure Payroll**. Click the `Demo Presentation Mode (Auto-Play)` button. 
The system will automatically advance through a 6-stage real-world simulation:
1. Encrypting local client salaries.
2. Transmitting ciphertexts across the network.
3. Server receiving meaningless arrays.
4. Server executing the homomorphic circuit.
5. Server returning the encrypted aggregate.
6. Client utilizing the Private Key to decrypt the final company total.

*Toggle between "Beginner" and "Academic" modes in the header to shift the UI from layman terminology to deep algorithmic mathematics!*

---

## ⚠️ Academic Limitations

This application is built for **educational and presentational purposes**. 

1. **PHE (Paillier):** The implementation uses pure JS `BigInt` with simple probabilistic prime generation tools meant for speed and visual demonstration in a browser. It is incredibly effective for university presentations but is **NOT** meant for production cryptographic payloads.
2. **FHE (CKKS/BFV):** The FHE module presented is a carefully constructed **simulation** designed to visually demonstrate the real-world latency, architecture pipeline, and "noise accumulation" characteristic of actual FHE systems. Valid production FHE implementations (e.g., Microsoft SEAL, Zama Concrete) require heavy WebAssembly configurations and server-grade memory.
3. **Key Sizes:** Paillier key generation uses heavily reduced bit-lengths (128/256-bit) to ensure the UI Thread (via Web Workers) processes inputs fast enough for a fluid demonstration.

---

## 🔮 Future Work

- **WASM FHE Implementation:** Replacing the FHE simulator with compiled WebAssembly bindings directly mapping to the `OpenFHE` C++ library to perform real multi-party computations.
- **Relinearization Visualizer:** Adding an interactive step allowing users to manually generate secondary Evaluation Keys to "scrub" noise growth from FHE ciphertexts.
- **Multi-key Homomorphic Encryption (MKHE):** Demonstrating architectures where multiple distinct clients combine ciphertexts strictly encrypted under different keys.

---
*Built with React 18, Tailwind CSS, shadcn/ui, Framer Motion, and Native JS BigInt.*
