import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginWithEmail, loginWithOfficer, availableOfficers } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await loginWithEmail(email, password);
    setLoading(false);

    if (res.success) {
      navigate("/dashboard");
    } else {
      setError(res.error || "Authentication failed. Please verify credentials.");
    }
  };

  const handleQuickLogin = (officer) => {
    loginWithOfficer(officer);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Inter'] text-[#191c1e] antialiased selection:bg-[#dbe1ff] selection:text-[#00174b] relative overflow-hidden">
      
      {/* Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-[#0051d5] fill-icon text-[32px]">
            shield
          </span>
          <span className="font-['Hanken_Grotesk'] text-3xl font-bold text-[#000000] tracking-tight">
            VoiceFIR
          </span>
        </div>
        <h2 className="text-2xl font-['Hanken_Grotesk'] font-bold text-[#000000]">
          Police Login
        </h2>
        <p className="mt-1 text-sm text-[#45464d]">
          Secure access for authorized personnel only.
        </p>
      </div>

      {/* Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] sm:rounded-xl border border-[#E2E8F0] relative z-10">
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block font-semibold text-sm text-[#000000] mb-1.5" htmlFor="email">
                Police Email
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#45464d] text-[20px]">badge</span>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@precinct.gov"
                  className="block w-full pl-10 bg-white border border-[#E2E8F0] rounded-lg py-2.5 text-sm text-[#191c1e] placeholder-[#76777d] focus:ring-2 focus:ring-[#0051d5] focus:border-[#0051d5] focus:outline-none transition-shadow"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-semibold text-sm text-[#000000] mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-[#45464d] text-[20px]">lock</span>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 bg-white border border-[#E2E8F0] rounded-lg py-2.5 text-sm text-[#191c1e] placeholder-[#76777d] focus:ring-2 focus:ring-[#0051d5] focus:border-[#0051d5] focus:outline-none transition-shadow"
                />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#0051d5] focus:ring-[#0051d5] border-[#E2E8F0] rounded cursor-pointer"
                />
                <label className="ml-2 block text-xs text-[#45464d] cursor-pointer" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <div className="text-xs">
                <a href="#" className="font-semibold text-[#0051d5] hover:text-[#003ea8] transition-colors">
                  Forgot Password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-xs font-semibold text-sm text-white bg-[#0051d5] hover:bg-[#003ea8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0051d5] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {loading ? "Authenticating..." : "Login"}
              </button>
            </div>

          </form>

          {/* Quick Preset Selector */}
          <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#45464d] mb-2 text-center">
              Or 1-Click Fast Login:
            </p>
            <div className="space-y-1.5">
              {availableOfficers.map((off) => (
                <button
                  key={off.uid}
                  type="button"
                  onClick={() => handleQuickLogin(off)}
                  className="w-full text-left p-2 rounded-lg bg-[#f7f9fb] hover:bg-[#eceef0] border border-[#E2E8F0] text-xs flex items-center justify-between transition-colors group"
                >
                  <div>
                    <span className="font-semibold text-[#191c1e] group-hover:text-[#0051d5]">
                      {off.name}
                    </span>
                    <span className="text-[#76777d] text-[11px] ml-1.5">({off.rank})</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#dbe1ff] text-[#0051d5]">
                    {off.badgeNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Legal Notice & Policy Links */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] text-center text-[11px] text-[#76777d] space-y-2">
            <p>
              By signing in, you agree to Sentinel VoiceFIR's{" "}
              <a href="/terms-and-conditions" className="text-[#0051d5] hover:underline font-medium">Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy-policy" className="text-[#0051d5] hover:underline font-medium">Privacy Policy</a>.
            </p>
            <p className="text-[10px] text-[#45464d]">
              Compliant with India DPDP Act 2023 & BNSS Guidelines • Authorized Officer Access Only
            </p>
          </div>

          {/* Decorative Structural Line */}
          <div className="mt-4 pt-4 border-t border-[#E2E8F0] relative">
            <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-white px-2 text-[#76777d] text-[10px] font-semibold tracking-wider uppercase">
              SYSTEM SECURED
            </div>
            <div className="flex justify-center gap-4 text-[#76777d] pt-1">
              <span className="material-symbols-outlined text-[18px]" title="Encrypted Connection" aria-label="Encrypted Connection">lock</span>
              <span className="material-symbols-outlined text-[18px]" title="Government Node" aria-label="Government Node">account_balance</span>
              <span className="material-symbols-outlined text-[18px]" title="Audit Log Active" aria-label="Audit Log Active">policy</span>
            </div>
          </div>

        </div>
      </div>

      {/* Subtle Background Glow */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#b4c5ff] opacity-20 blur-[100px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#bec6e0] opacity-20 blur-[100px]"></div>
      </div>

    </div>
  );
}
