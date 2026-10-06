# CampusEvent Pro - Viva Questions & Answers

### 1. What is the architecture of this application?
**Answer:** This is a full-stack application using the **MERN-like stack** (replacing MongoDB with SQLite for this environment). It uses **React.js** for the frontend, **Node.js with Express** for the backend, and **SQLite** as the relational database. It follows the **MVC (Model-View-Controller)** pattern on the backend to separate concerns.

### 2. How is authentication handled in the system?
**Answer:** Authentication is handled using **JWT (JSON Web Tokens)**. When a user logs in, the server verifies their credentials (password is hashed using **bcryptjs**), generates a token containing the user's ID and role, and sends it to the client. The client stores this token in `localStorage` and includes it in the `Authorization` header for subsequent API requests.

### 3. Explain Role-Based Access Control (RBAC) in your project.
**Answer:** RBAC is implemented using middleware on the backend. Certain routes are restricted based on the role stored in the JWT. For example, only users with the 'admin' role can approve events, and only 'organizers' can create them. On the frontend, the `AuthContext` and `ProtectedRoute` component ensure that users only see and access pages relevant to their role.

### 4. How does the QR Code and PDF generation work?
**Answer:** We use the `qrcode` library to generate a DataURL from a JSON string containing the event and student IDs. This QR code is stored in the database upon registration and can be viewed in the student's dashboard.

### 5. Why did you use SQLite instead of MongoDB?
**Answer:** While MongoDB is a great NoSQL choice, **SQLite** was chosen for this specific implementation because it is a self-contained, serverless database engine that runs perfectly within the application's container without requiring external service configuration. It provides ACID compliance and is excellent for projects of this scale.

### 6. How are real-time updates handled?
**Answer:** The project uses **Socket.io** to establish a persistent connection between the client and server. This allows the server to push notifications (like event approvals or new registrations) to users instantly without them needing to refresh the page.

### 7. What is the future scope of this project?
**Answer:**
- **Payment Integration:** Adding Stripe or Razorpay for paid event tickets.
- **Email Service:** Integrating Nodemailer for automated email reminders.
- **Mobile App:** Developing a React Native version for better on-ground attendance scanning.
- **AI Recommendations:** Using the Gemini API to suggest events to students based on their interests.
