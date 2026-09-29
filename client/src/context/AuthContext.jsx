import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, signInWithEmailAndPassword, signOut as fbSignOut } from "../services/firebase";
import api from "../services/api";

const AuthContext = createContext(null);

const defaultOfficer = {
  uid: "officer_tn_001",
  email: "inspector.subramaniam@police.gov.in",
  name: "Insp. R. Subramaniam",
  rank: "Inspector of Police (SHO)",
  station: "Anna Nagar Police Station (K-4)",
  district: "Chennai City Police",
  badgeNumber: "TN-POL-8842",
  role: "police",
  state: "Tamil Nadu"
};

export function AuthProvider({ children }) {
  const [officer, setOfficer] = useState(() => {
    const saved = localStorage.getItem("voicefir_officer");
    return saved ? JSON.parse(saved) : defaultOfficer;
  });
  const [availableOfficers, setAvailableOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOfficers() {
      try {
        const res = await api.getAvailableOfficers();
        if (res.success && res.data) {
          setAvailableOfficers(res.data);
        }
      } catch (err) {
        console.warn("Could not fetch available officers list:", err.message);
      } finally {
        setLoading(false);
      }
    }
    loadOfficers();
  }, []);

  const loginWithOfficer = (selectedOfficer) => {
    setOfficer(selectedOfficer);
    localStorage.setItem("voicefir_officer", JSON.stringify(selectedOfficer));
    localStorage.setItem("voicefir_token", `mock_token_${selectedOfficer.uid}`);
  };

  const loginWithEmail = async (email, password) => {
    if (auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const profile = {
          uid: user.uid,
          email: user.email,
          name: user.displayName || "Duty Officer",
          rank: "Inspector",
          station: "Central Police Station",
          district: "Metropolitan Police",
          badgeNumber: "POL-" + user.uid.substring(0, 4).toUpperCase(),
          role: "police"
        };
        setOfficer(profile);
        localStorage.setItem("voicefir_officer", JSON.stringify(profile));
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    } else {
      // Local fallback: find matching or use default
      const matched = availableOfficers.find(o => o.email.toLowerCase() === email.toLowerCase()) || {
        ...defaultOfficer,
        email
      };
      loginWithOfficer(matched);
      return { success: true };
    }
  };

  const logout = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn("Firebase signout error:", err);
      }
    }
    localStorage.removeItem("voicefir_officer");
    localStorage.removeItem("voicefir_token");
    setOfficer(null);
  };

  return (
    <AuthContext.Provider value={{
      officer,
      availableOfficers,
      loading,
      loginWithOfficer,
      loginWithEmail,
      logout,
      isAuthenticated: !!officer
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
