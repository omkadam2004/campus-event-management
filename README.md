# 🎓 Campus Event Management System

A modern web-based **Campus Event Management System** designed to simplify the process of creating, managing, discovering, and registering for college campus events.

The system provides separate functionality for **students/users and administrators**, making campus event management more organized, efficient, and accessible.

---

## 📌 Project Overview

Managing college events manually can be time-consuming and difficult to organize.

The **Campus Event Management System** provides a centralized digital platform where students can explore upcoming events, register for events, manage their registrations, and receive important event-related information.

Administrators can manage events, registrations, users, notifications, and other event-related activities through the system.

---

## ✨ Key Features

### 👨‍🎓 User Features

- 🔐 User Registration & Login
- 🏠 User Dashboard
- 🎉 Browse Campus Events
- 📅 View Event Details
- 📝 Register for Events
- 📋 View My Registrations
- 🔍 Event Search & Discovery
- 🔔 Event Notifications
- 📱 Responsive User Interface
- 🤖 AI-powered assistance

### 👨‍💼 Admin Features

- 🔐 Secure Admin Login
- 📊 Admin Dashboard
- ➕ Create & Manage Events
- ✏️ Update Event Information
- 🗑️ Delete Events
- 👥 Manage Event Registrations
- 📢 Manage Notifications
- 📈 View Event-related Reports
- 👤 Manage Users

---

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| React | Frontend UI Development |
| TypeScript | Type-safe Application Development |
| Vite | Frontend Build Tool |
| Node.js | Backend Runtime |
| Express.js | Backend/API Development |
| HTML5 | Web Structure |
| CSS3 | Styling & Responsive Design |
| JavaScript | Application Logic |
| Gemini API | AI-powered Features |
| Git & GitHub | Version Control |

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────┐
│             User / Admin            │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          React + TypeScript         │
│             Frontend                │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          API / Backend Layer        │
│            Node.js + Server         │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│       Event / User / Registration   │
│             Services                │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│        Application Data / APIs      │
└─────────────────────────────────────┘
User Workflow
                ┌───────────────┐
                │     Start     │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │   Register /  │
                │     Login     │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │    Dashboard  │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Browse Events │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Event Details │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │    Register   │
                │   for Event   │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ Registration  │
                │   Confirmed   │
                └───────────────┘
Admin Workflow
                 ┌──────────────┐
                 │  Admin Login │
                 └───────┬──────┘
                         │
                         ▼
                 ┌──────────────┐
                 │   Dashboard  │
                 └───────┬──────┘
                         │
            ┌────────────┼────────────┐
            │            │            │
            ▼            ▼            ▼
       ┌─────────┐ ┌───────────┐ ┌────────────┐
       │ Manage  │ │  Manage   │ │  Manage    │
       │ Events  │ │  Users    │ │Registrations│
       └─────────┘ └───────────┘ └────────────┘
            │            │            │
            └────────────┼────────────┘
                         │
                         ▼
                 ┌──────────────┐
                 │  Reports &   │
                 │ Notifications│
                 └──────────────┘
Project Structure
campus-event-management/
│
├── server/
│   ├── routes/
│   ├── utils/
│   └── ...
│
├── src/
│   ├── components/
│   │   ├── ChatBot.tsx
│   │   └── Navbar.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── lib/
│   │   └── api.ts
│   │
│   ├── pages/
│   │   ├── AdminPanel.tsx
│   │   ├── CreateEvent.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EventDetails.tsx
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── MyRegistrations.tsx
│   │   ├── Register.tsx
│   │   ├── ReportGenerator.tsx
│   │   └── VerifyPass.tsx
│   │
│   ├── services/
│   │   └── gemini.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
│
├── uploads/
│
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
└── README.md
🎯 Project Objectives

The main objectives of this project are:

To digitize the campus event management process.
To provide a centralized platform for college events.
To make event registration easier for students.
To reduce manual event management work.
To provide administrators with better event management tools.
To improve communication through notifications.
To provide AI-powered assistance to users.
Future Enhancements

The system can be further enhanced with:

📱 Mobile Application
📧 Email Notifications
📲 SMS Notifications
🎫 QR Code-based Event Attendance
💳 Online Payment Integration
📊 Advanced Analytics Dashboard
⭐ Event Ratings & Reviews
📅 Calendar Integration
☁️ Cloud Deployment
🔔 Real-time Notifications
🔐 Advanced Security & Role Management
