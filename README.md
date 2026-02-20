# AgroDetect-AI-Plant-Disease-Classification-Engine
# 🌌 Antigravity AI Explorer

A sleek, serverless web application that leverages **Antigravity AI** to generate physics-defying imagery. Built with **Next.js**, secured by **Firebase**, and deployed on **Vercel**.

## 🚀 Features

* **Secure Authentication:** Powered by Firebase Auth (Google/Email).
* **AI Generation:** Direct integration with the Antigravity AI API.
* **Cloud Storage:** Prompt history and image metadata stored in Firestore.
* **Edge Performance:** Deployed on Vercel for lightning-fast global access.

## 🛠️ Tech Stack

* **Frontend:** Next.js (React)
* **Backend:** Serverless API Routes (Node.js)
* **Database:** Google Firestore
* **Auth:** Firebase Authentication
* **Deployment:** Vercel

## 📦 Setup Instructions

### 1. Prerequisites

* Node.js installed.
* A [Firebase](https://console.firebase.google.com/) project.
* An [Antigravity AI](https://antigravity.ai) API Key.

### 2. Environment Variables

Create a `.env.local` file in the root directory and add your credentials:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id

# AI API Keys
ANTIGRAVITY_API_KEY=your_secret_api_key

```

### 3. Installation

```bash
npm install
npm run dev

```

## 🎨 Prompting Guide

To get the best results from the Antigravity model, focus on **kinetic energy** and **lighting**.

**Recommended Prompt Structure:**

> `[Subject] + [Action/Motion] + [Surreal Lighting] + [Resolution]`

*Example:* *"A glass of red wine shattering in zero gravity, droplets suspended like rubies, dramatic volumetric lighting, 8k photo-realistic."*

## 🌐 Deployment

This project is optimized for **Vercel**.

1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Add the Environment Variables in the Vercel Dashboard.
4. Deploy!

---

## 📝 License

MIT License - feel free to use this for your own AI projects!
