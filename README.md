# 🎓 Campus Event Management System

A modern web-based **Campus Event Management System** designed to simplify the process of creating, managing, registering, and monitoring college campus events.

The system provides separate functionalities for **Students/Users and Administrators**, along with event registration, notifications, feedback, pass verification, report generation, and AI-powered assistance.

---

## 📌 Project Overview

Managing college events manually can be time-consuming and difficult. Students may have difficulty finding event information, registering for events, and tracking their registrations.

The **Campus Event Management System** provides a centralized platform where students can browse events, view event details, register online, manage registrations, receive notifications, submit feedback, and verify event passes.

Administrators can manage events, registrations, notifications, feedback, and generate reports through the admin panel.

---

## ✨ Key Features

### 👨‍🎓 Student/User Features

- 🔐 User Registration and Login
- 🏠 Interactive Home Page
- 📅 Browse Upcoming Events
- 🔎 View Event Details
- 📝 Online Event Registration
- 🎫 Event Pass Verification
- 📋 View My Registrations
- 🔔 Notifications
- ⭐ Submit Event Feedback
- 🤖 AI-powered Chatbot Assistance
- 📊 User Dashboard

### 👨‍💼 Admin Features

- 🔐 Admin Login
- 📊 Admin Dashboard
- ➕ Create New Events
- ✏️ Manage Events
- 👥 Manage Event Registrations
- 📢 Manage Notifications
- ⭐ View User Feedback
- 📈 Generate Event Reports
- 🎫 Verify Event Passes

---

## 🛠️ Technology Stack

### Frontend
- React.js
- TypeScript
- Vite
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js
- REST API

### Database
- MongoDB
- MongoDB Atlas

### AI Integration
- Google Gemini API

### Development Tools
- Visual Studio Code
- Git
- GitHub
- npm

---

## 🏗️ System Architecture

```text
User / Admin
     │
     ▼
React + TypeScript
     │
     ▼
REST API
     │
     ▼
Node.js + Express.js
     │
     ▼
MongoDB / MongoDB Atlas

Student Workflow
User Registration
       ↓
     Login
       ↓
     Home
       ↓
 Browse Events
       ↓
 Event Details
       ↓
 Register for Event
       ↓
 Registration Confirmation
       ↓
 My Registrations
       ↓
 Attend Event
       ↓
 Submit Feedback

Admin Workflow
Admin Login
     ↓
Admin Dashboard
     ↓
Create / Manage Events
     ↓
Manage Registrations
     ↓
Manage Notifications
     ↓
View Feedback
     ↓
Generate Reports
     ↓
Verify Event Passes

📂 Project Structure
campus-event-management/
│
├── server/
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── events.ts
│   │   ├── feedback.ts
│   │   ├── notifications.ts
│   │   └── registrations.ts
│   │
│   └── utils/
│       └── mailer.ts
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
├── .env.example
├── .gitignore
├── index.html
├── metadata.json
├── package.json
├── package-lock.json
├── server.ts
├── tsconfig.json
├── vite.config.ts
├── viva.md
└── README.md
🗄️ Database

The project uses MongoDB as the primary database.

MongoDB is used to store and manage:

User information
Admin information
Event details
Event registrations
Notifications
Feedback
Event pass/registration information

The application can be connected to MongoDB Atlas for cloud-based database management.
📦 Main Modules
1. Authentication Module
User Registration
User Login
Admin Authentication
Authentication State Management
2. Event Management Module
Create Events
Update Events
Manage Events
View Event Details
3. Event Registration Module
Online Event Registration
Registration Management
My Registrations
4. Notification Module
Event Announcements
Registration Updates
Important Notifications
5. Feedback Module
Submit Event Feedback
View Feedback
6. Pass Verification Module
Event Pass Verification
Registration Verification
7. Report Generation Module
Generate Event Reports
View Registration Data
8. AI Chatbot Module
AI-powered assistance
Event-related queries
Interactive user support
⚙️ Installation & Setup
Prerequisites

Make sure the following are installed:

Node.js
npm
Git
MongoDB / MongoDB Atlas
Visual Studio Code
. Clone the Repository
git clone https://github.com/omkadam2004/campus-event-management.git
2. Open Project Folder
cd campus-event-management
3. Install Dependencies
npm install
4. Configure Environment Variables

Create a local environment file using .env.example.

Add the required configuration:

MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key

⚠️ Never upload real MongoDB credentials or API keys to GitHub.

5. Run the Application
npm run dev

The application will start on the local development server.

🔐 Security

The project follows basic security practices including:

Environment variables for sensitive credentials
.gitignore for sensitive/local files
Authentication for protected areas
Separate admin functionality
Secure MongoDB connection configuration
🎯 Project Objectives

The main objectives of this project are:

To digitize college event management.
To simplify event registration for students.
To provide centralized event information.
To reduce manual event management work.
To provide administrators with better event control.
To maintain registration and feedback data efficiently.
To provide AI-based assistance to users.
To improve communication between students and event organizers.
✅ Advantages
Easy-to-use interface
Centralized event management
Online event registration
Faster access to event information
Reduced paperwork
Easy registration tracking
MongoDB-based data management
Admin dashboard
AI-powered assistance
Online pass verification
Feedback management
Report generation
🔮 Future Enhancements
📱 Mobile Application
📲 QR Code-based Attendance
💳 Online Payment Integration
📧 Automated Email Notifications
📱 SMS Notifications
📊 Advanced Analytics Dashboard
🔔 Push Notifications
🏫 Multi-College Support
☁️ Cloud Deployment
🔐 Advanced Role-Based Access Control
🧪 Testing

The application can be tested for:

User Registration
User Login
Admin Login
Event Creation
Event Updates
Event Registration
Registration Management
Notifications
Feedback Submission
Pass Verification
Report Generation
MongoDB Connectivity
API Functionality
📸 Screenshots

Screenshots of the application can be added here.

Home Page

Add Home Page Screenshot Here

Login Page

Add Login Page Screenshot Here

Event Listing

Add Event Listing Screenshot Here

Event Registration

Add Event Registration Screenshot Here

Admin Dashboard

Add Admin Dashboard Screenshot Here

AI Chatbot

Add AI Chatbot Screenshot Here

📚 Academic Project

Project Title: Campus Event Management System

Project Type: Web Application

Purpose: College / MCA Academic Project

This project demonstrates practical implementation of:

Frontend Development
Backend Development
REST APIs
MongoDB Database
Authentication
Event Management
AI Integration
Git & GitHub
👨‍💻 Developer
OM KADAM

MCA Student | Web Developer

GitHub:
https://github.com/omkadam2004

🔗 Project Repository

GitHub Repository:
https://github.com/omkadam2004/campus-event-management

📄 License

This project is developed for educational and academic purposes.

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
