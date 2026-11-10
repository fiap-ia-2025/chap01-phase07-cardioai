import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/Layout/ProtectedRoute";
import { Header } from "./components/Layout/Header";
import { Sidebar } from "./components/Layout/Sidebar";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Patients } from "./pages/Patients";
import { Appointments } from "./pages/Appointments";
import { NewAppointment } from "./pages/NewAppointment";
import { Chat } from "./pages/Chat";
import "./styles/global.css";

function AppContent() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Header />
                  <div className="main-container">
                    <Sidebar />
                    <main className="content">
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/leituras" replace />}
                        />
                        <Route path="/dashboard" element={<Navigate to="/leituras" replace />} />
                        <Route path="/leituras" element={<Dashboard />} />
                        <Route path="/patients" element={<Patients />} />
                        <Route
                          path="/appointments"
                          element={<Appointments />}
                        />
                        <Route
                          path="/new-appointment"
                          element={<NewAppointment />}
                        />
                        <Route path="/chat" element={<Chat />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

function App() {
  return <AppContent />;
}

export default App;
