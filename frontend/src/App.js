import React, { useEffect } from "react";
import "./App.css";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navigation from "./components/Navigation";
import HomePage from "./components/HomePage";
import StudentView from "./components/StudentView";
import AdminView from "./components/AdminView";
import Login from "./components/Login";
import Register from "./components/Register";
import { Toaster } from "./components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

function App() {
  // Ensure correct title is always set
  useEffect(() => {
    document.title = "Students Feedback System";
    // Also update meta description if needed
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Students Feedback Collection System - A comprehensive platform for collecting and managing student feedback on teaching effectiveness');
    }
  }, []);

  return (
    <div className="App min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full" style={{width: '100vw', maxWidth: '100vw', margin: 0, padding: 0}}>
      <AuthProvider>
        <HashRouter>
          <Navigation />
          <main className="flex-1">
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/admin-login" element={<Login role="admin" />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Form Access (Public with form validation) */}
            <Route 
              path="/student/:formId" 
              element={<StudentView />}
            />
            
            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminView />
                </ProtectedRoute>
              }
            />
            
            {/* Redirect old routes */}
            <Route path="/login" element={<Navigate to="/admin-login" replace />} />
            
            {/* 404 Fallback */}
            <Route 
              path="*" 
              element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                    <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                    <button 
                      onClick={() => window.location.href = '/#/'}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              }
            />
            </Routes>
          </main>
          <Toaster />
          <SonnerToaster 
            position="top-right" 
            richColors 
            theme="light"
            closeButton
            expand
          />
        </HashRouter>
      </AuthProvider>
    </div>
  );
}

export default App;