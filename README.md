# ⚖️ The Arbiter - Decentralized AI Judge

The Arbiter is a Web3 mini-game where two players submit arguments, and an AI Judge determines the winner.

Unlike standard AI implementations, this project runs on **OpenGradient's decentralized architecture**. Every verdict is executed inside a Trusted Execution Environment (TEE), ensuring that the judgment is unbiased, private, and cryptographically verified on-chain.

## 🚀 How It Works
1. **Topic Generation:** The system generates random, controversial debate topics via a secure AI proxy.
2. **The Debate:** Players submit their arguments via the UI.
3. **The Verdict:** Arguments are sent to a secure Python backend running on Base Sepolia.
4. **Verification:** The OpenGradient TEE evaluates the logic, declares a winner, and returns a transaction hash proving the inference occurred securely.

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Vite
* **Backend:** Python, FastAPI
* **AI Infrastructure:** OpenGradient SDK, TEE
