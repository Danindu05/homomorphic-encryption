# HE.Compute - Homomorphic Encryption Web Demo

HE.Compute is a visually impressive, production-quality educational web application designed to demonstrate the mechanics and applications of **Homomorphic Encryption (HE)**. 

Built as a research-level interactive demo suitable for academic presentations, it showcases side-by-side comparisons of Partially Homomorphic Encryption (PHE) and Fully Homomorphic Encryption (FHE) with real mathematics and rich visual feedback.

## 🚀 Features

- **Interactive PHE Engine (Paillier)**
  - Real JavaScript `BigInt` implementation of the Paillier cryptosystem.
  - Interactive key generation offloaded to Web Workers for 60fps UI performance.
  - Live homomorphic addition of encrypted payloads.
  
- **Educational FHE Simulation (BFV/CKKS)**
  - High-fidelity simulated tracker demonstrating the extreme computational latency and noise expansion associated with polynomial FHE operations.
  - Interactive noise budget tracking.
  
- **Real-World Application Demos**
  - **Secure Payroll**: Computes aggregate financial sums entirely on encrypted data using the native Paillier implementation.
  - **Electronic Voting**: Conceptual demonstration of secure 0/1 tallying.
  - **Medical Compute**: Conceptual demonstration for processing private metrics.
  
- **Performance Architecture Charts**
  - `Recharts`-based data visualization comparing theoretical / simulated latency between Plaintext, PHE, and FHE execution.

- **Premium Cyber/Security UI**
  - Built with Tailwind CSS, shadcn/ui, and Framer Motion.
  - Deep dark cyber theme, neon accent glowing bounds, and glassmorphism.

## 🛠️ Tech Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS + shadcn/ui**: For a highly polished, consistent cyber aesthetic.
- **Framer Motion**: Smooth entry animations and micro-interactions.
- **Recharts**: Performance data visualization.
- **Web Workers**: Native parallel processing to handle heavy 256-bit prime generation and BigInt math without crashing the DOM.
- Native `BigInt` for secure mathematical precision up to hundreds of bits.

## 🧠 What is Homomorphic Encryption?

Homomorphic encryption is a revolutionary cryptographic method that allows mathematical operations to be performed directly on ciphertext, generating an encrypted result which, when decrypted, matches the result of the operations as if they had been performed on the plaintext.

- **PHE (Partially Homomorphic Encryption)**: Allows only ONE type of operation (e.g., only Addition OR only Multiplication). In this app, we demonstrate **Paillier**, which allows encrypted addition. It is fast enough for practical, specific use cases today (like electronic voting).
- **FHE (Fully Homomorphic Encryption)**: Allows arbitrary operations (both addition and multiplication), theoretically allowing massive computers to process all cloud data securely. FHE introduces extreme latency and "noise" which must be managed via costly relinearization/bootstrapping operations.

## ⚙️ Setup & Installation

Ensure you have Node.js installed.

```bash
# Clone the project (if applicable)

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173` to interact with the system.

## ⚠️ Disclaimer

This application is built for **educational and presentational purposes**. 
- The Paillier implementation uses pure JS `BigInt` with simple probabilistic prime generation tools meant for speed and visual demonstration in a browser. It is incredibly effective for university presentations but is **NOT** secure for production cryptographic payloads (requires vetted cryptographic libraries).
- The FHE module presented is a carefully constructed **simulation** designed to demonstrate the real-world latency, architecture pipeline, and "noise accumulation" characteristic of actual FHE systems like Microsoft SEAL (which require heavy WebAssembly configurations). 

## 🖼️ User Flows

1. **Dashboard Home**: Review the Recharts latency metrics.
2. **PHE Tab**: Walk through Key Generate -> Encrypt -> Homomorphic Add -> Decrypt.
3. **FHE Tab**: Observe artificial noise growth on multiplication vs addition.
4. **Use Cases**: Watch the Secure Payroll automatically manage client-side encryption and server-side encrypted aggregation.
