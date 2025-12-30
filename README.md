# GenUI – AI Component Generator

GenUI is an AI-powered web application that generates modern, responsive UI code from natural language prompts using Google Gemini models.

This project focuses on turning an AI demo into a **real, job-ready product** with authentication, user-managed API keys, and customizable UI generation.

---

## 🚀 Features

- 🔐 User authentication (Signup / Login / JWT-based auth)
- 👤 Profile setup with avatar upload & edit profile
- 🤖 AI-powered UI generation using Google Gemini
- 🔑 Bring-your-own Gemini API key (secure, user-controlled)
- 🧠 Multiple model support:
  - Gemini 2.5 Flash
  - Gemini 2.5 Pro
  - Gemini 2.0 Flash
  - Gemini Flash (Latest)
  - Gemini Pro (Latest)
- 🎨 Dark / Light mode
- 🔤 Font style & layout customization
- 💻 Live code editor with preview
- 📱 Fully responsive (mobile & desktop friendly)

---

## 🛠 Tech Stack

**Frontend**
- React
- Tailwind CSS
- Monaco Editor
- React Router

**Backend**
- Node.js
- Express.js
- MongoDB
- JWT Authentication

**AI**
- Google Gemini API

---

## ⚙️ How It Works

1. User signs up / logs in
2. Completes profile setup (or skips)
3. Adds their own Gemini API key
4. Enters a prompt describing the UI component
5. Selects framework, model, font, and layout
6. GenUI generates production-ready UI code with live preview

---

## 🧪 Local Setup

```bash
# Clone repository
git clone https://github.com/RudraPandyaa/GenUI

# Install dependencies
npm install

# Start frontend
npm run dev
