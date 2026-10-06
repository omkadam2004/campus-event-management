import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import MyRegistrations from './pages/MyRegistrations';
import AdminPanel from './pages/AdminPanel';
import ReportGenerator from './pages/ReportGenerator';
import VerifyPass from './pages/VerifyPass';
import ChatBot from './components/ChatBot';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: string }> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role && user.role !== 'admin') return <Navigate to="/" />;

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/event/:id" element={<EventDetails />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/create-event" element={
            <ProtectedRoute role="organizer">
              <CreateEvent />
            </ProtectedRoute>
          } />
          
          <Route path="/my-registrations" element={
            <ProtectedRoute role="student">
              <MyRegistrations />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute role="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />

          <Route path="/generate-report" element={
            <ProtectedRoute role="organizer">
              <ReportGenerator />
            </ProtectedRoute>
          } />

          <Route path="/verify-pass" element={
            <ProtectedRoute role="organizer">
              <VerifyPass />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Toaster position="top-right" />
      <ChatBot />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
