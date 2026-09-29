import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateFIR from "./pages/CreateFIR";
import FIRReview from "./pages/FIRReview";
import FIRResult from "./pages/FIRResult";
import RecordsVault from "./pages/RecordsVault";
import Analytics from "./pages/Analytics";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CookiePolicy from "./pages/CookiePolicy";
import RefundPolicy from "./pages/RefundPolicy";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <div className="w-8 h-8 rounded-full border-2 border-[#0051d5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] flex flex-col selection:bg-[#dbe1ff] selection:text-[#00174b]">
          <Navbar />
          <div className="flex-1 flex flex-col pt-[64px] md:pl-64">
            <main className="flex-1">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Navigate to="/dashboard" replace />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <CreateFIR />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vault"
                  element={
                    <ProtectedRoute>
                      <RecordsVault />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fir/:id/review"
                  element={
                    <ProtectedRoute>
                      <FIRReview />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/fir/:id/result"
                  element={
                    <ProtectedRoute>
                      <FIRResult />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <CookieConsent />
        </div>
      </Router>
    </AuthProvider>
  );
}
