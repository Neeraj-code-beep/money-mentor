# 💰 Money Mentor — AI Powered Personal Finance Assistant

![Next.js](https://img.shields.io/badge/Frontend-Next.js-black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/API-Express.js-grey)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)
![Neon](https://img.shields.io/badge/DB-Neon-purple)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

🚀 **Live Demo:** https://money-mentor-one.vercel.app/

---

## 🧠 Overview

**Money Mentor** is an AI-powered **personal finance web application** that helps users analyze their financial health, track spending behavior, and get intelligent financial suggestions.

It acts like a **digital financial advisor**, combining:

* 📊 Financial analytics
* 🤖 AI chatbot guidance
* 📈 Smart scoring system

---

## ✨ Key Features

### 💚 Money Health Score

* Calculates a **financial health score**
* Based on:

  * Income
  * Expenses
  * Debt
  * Savings
  * Investments
* Visualized using:

  * Circular progress
  * Radar charts
  * Factor breakdown

---

### 📊 Smart Financial Insights

* Real-time financial calculations
* Expense stability tracking
* Investment awareness
* Savings analysis

---

### 🤖 AI Chatbot Assistant

* Built-in chatbot to:

  * Answer finance-related questions
  * Guide users on better decisions
  * Provide smart suggestions

---

### 📈 FIRE Planner (Financial Independence)

* Helps users plan early financial freedom
* Tracks long-term wealth strategy

---

### 🧾 Additional Modules

* Tax planning (Tax Wizard)
* Life event financial planning
* Financial dashboard

---

## 🖥️ UI Preview

> Clean dashboard with financial inputs, score visualization, and analytics

![App Screenshot](./assets/screenshot.png)

---

## 🛠 Tech Stack

### Frontend

* Next.js (App Router)
* React
* TailwindCSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL (Neon DB)

### Deployment

* Frontend: Vercel
* Backend: Render

---

## ⚙️ How It Works

1. User enters financial details
2. System calculates financial metrics
3. Generates **Money Health Score**
4. Visualizes data using charts
5. AI chatbot assists user decisions

---

## 📂 Project Structure

```bash
money-mentor
│
├── backend
│   ├── routes
│   ├── controllers
│   ├── db
│   └── server.js
│
├── frontend
│   ├── app
│   ├── components
│   ├── lib
│   └── styles
│
├── assets
│   └── screenshot.png
│
├── README.md
└── .env
```

---

## 🚀 Running Locally

### 1️⃣ Clone Repo

```bash
git clone https://github.com/YOUR_USERNAME/money-mentor.git
cd money-mentor
```

---

### 2️⃣ Setup Backend

```bash
cd backend
npm install
```

Create `.env`:

```env
DATABASE_URL=your_neon_postgres_url
PORT=5000
```

Run server:

```bash
npm run dev
```

---

### 3️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on:

```
http://localhost:3000
```

---

## 🔑 Environment Variables

### Backend

```env
DATABASE_URL=
PORT=
```

### Frontend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## ⚠️ Current Limitations

* Limited AI intelligence (rule-based + basic logic)
* No authentication system yet
* No real bank integration
* UI can be enhanced further

---

## 🔮 Future Improvements

* 🔗 Bank API integration
* 🧠 Advanced AI recommendations
* 📊 Detailed analytics dashboards
* 🔐 Authentication (JWT / OAuth)
* 📱 Mobile optimization
* 📉 Expense categorization using AI

---

## 🧑‍💻 Author

**Neeraj Mishra**

Built to explore:

* Full Stack Development
* Financial Systems
* AI Integration
* Real-world problem solving

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
