import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Projects from "./pages/Projects.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import TaskDetail from "./pages/TaskDetail.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppLayout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Projects />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProjectDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks/:id"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TaskDetail />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
