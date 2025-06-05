# 🌐 Guess App Web – Real-Time Multiplayer Quiz Game + Socket.IO Server

**Guess-App-Web** is a full-stack real-time quiz game web application built with **Vue.js** for the frontend and **Node.js + Socket.IO** as the backend server.

This application allows users to:
- Create or join quiz game rooms.
- Answer questions in real-time.
- Compete with other players live on the web.

It also acts as the **Socket.IO server** for all connected clients (web + mobile).

---

## 🧠 How It Works

Guess-App-Web serves two purposes:

1. **Frontend** – A Vue.js web interface that replicates the quiz experience available on the mobile app.
2. **Backend** – A Node.js + Socket.IO server that handles:
   - Game room creation and management
   - Real-time event broadcasting
   - Player synchronization across web and mobile
   - Question distribution and answer collection

> 📌 The web app can host games and interact with mobile app clients running **Quiz Arena** via WebSockets.

---

## 🔗 Dependency: Guess-App-Admin

To manage quiz content (Categories, Topics, Questions), you must also deploy:

### 🛠️ [Guess-App-Admin](https://github.com/olajhidey/guess-admin)
This admin portal allows you to:
- Create and organize categories and topics
- Upload questions with image support
- Review game summaries and participant data
- Control quiz content without touching the frontend code

> ❗ This admin panel must be set up and connected to the database before starting games.

---

## 🚀 Getting Started

### ✅ Prerequisites
- Node.js v16+
- npm

### 📦 Install Dependencies
```bash
npm install
``` 

### ⚙️ Environment Setup
rename the `.env.example` file to `.env` in the root with the following:
```env
PORT=3000
ADMIN_URL=<> // URL to the admin dashboard
```

### 🔧 Start the Server
```bash 
node index.js
```

**Test here** -> https://guess-app-web.onrender.com

> 🚨 **Note**: The app is hosted on Render’s free tier, so it may take a moment to start up when first accessed.
