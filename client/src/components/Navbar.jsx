import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function TopAppBar() {
  const { isAuthenticated, officer, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const publicRoutes = ["/login", "/privacy-policy", "/terms-and-conditions", "/cookie-policy", "/refund-policy"];
  const isPublicPage = publicRoutes.includes(location.pathname);

  return (
    <header className="bg-[#f7f9fb] border-b border-[#E2E8F0] shadow-xs fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-[64px]">
      <div className="flex items-center gap-4">
        <Link to={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center gap-2">
          <span className="font-['Hanken_Grotesk'] text-xl font-bold text-[#0051d5] tracking-tight">
            Sentinel FIR
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#dbe1ff] text-[#0051d5] border border-[#b4c5ff]">
            AI Police
          </span>
        </Link>
      </div>

      <div className="flex-1 flex justify-end items-center gap-6">
        {isAuthenticated && !isPublicPage && (
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            <Link
              to="/dashboard"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/dashboard"
                  ? "text-[#0051d5] font-bold border-b-2 border-[#0051d5] rounded-b-none"
                  : "text-[#45464d] hover:bg-[#f2f4f6]"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/create"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/create"
                  ? "text-[#0051d5] font-bold border-b-2 border-[#0051d5] rounded-b-none"
                  : "text-[#45464d] hover:bg-[#f2f4f6]"
              }`}
            >
              Record FIR
            </Link>
            <Link
              to="/vault"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/vault"
                  ? "text-[#0051d5] font-bold border-b-2 border-[#0051d5] rounded-b-none"
                  : "text-[#45464d] hover:bg-[#f2f4f6]"
              }`}
            >
              Records Vault
            </Link>
            <Link
              to="/analytics"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === "/analytics"
                  ? "text-[#0051d5] font-bold border-b-2 border-[#0051d5] rounded-b-none"
                  : "text-[#45464d] hover:bg-[#f2f4f6]"
              }`}
            >
              Analytics
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <Link
              to="/login"
              className="bg-[#0051d5] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#003ea8] transition-colors"
            >
              Police Login
            </Link>
          ) : (
            <>
              <Link
                to="/vault"
                title="Records Vault Notifications"
                aria-label="View Records Notifications"
                className="p-2 text-[#45464d] hover:bg-[#f2f4f6] rounded-full transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[22px]" aria-hidden="true">notifications</span>
              </Link>
              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  aria-label="Toggle Officer Profile Menu"
                  className="p-1.5 text-[#45464d] hover:bg-[#f2f4f6] rounded-full transition-colors flex items-center justify-center gap-1.5"
                >
                  <div className="w-8 h-8 rounded-full bg-[#dbe1ff] text-[#0051d5] font-bold text-xs flex items-center justify-center border border-[#b4c5ff]">
                    {officer?.badgeNumber ? officer.badgeNumber.substring(0, 2) : "OS"}
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-11 w-64 rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-3 z-50 text-xs">
                    <div className="border-b border-[#E2E8F0] pb-2 mb-2">
                      <p className="font-bold text-[#191c1e] text-sm">{officer?.name || "Officer Singh"}</p>
                      <p className="text-[#45464d]">{officer?.rank || "Inspector"} • {officer?.station || "Precinct 04"}</p>
                      <p className="font-mono text-[#0051d5] text-[11px] mt-0.5">{officer?.badgeNumber || "TN-POL-8842"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        await logout();
                        navigate("/login");
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffdad6] font-semibold flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[16px]" aria-hidden="true">logout</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function SideNavBar() {
  const { isAuthenticated, officer } = useAuth();
  const location = useLocation();

  const publicRoutes = ["/login", "/privacy-policy", "/terms-and-conditions", "/cookie-policy", "/refund-policy"];
  if (!isAuthenticated || publicRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <aside
      aria-label="Side Navigation Bar"
      className="bg-[#f2f4f6] text-[#000000] border-r border-[#E2E8F0] hidden md:flex flex-col h-[calc(100vh-64px)] w-64 p-4 gap-1 fixed left-0 top-[64px] z-40 overflow-y-auto"
    >
      {/* Officer Avatar Header */}
      <div className="mb-6 px-1 py-2 flex items-center gap-3 border-b border-[#E2E8F0] pb-4">
        <div className="w-10 h-10 rounded-full bg-[#dbe1ff] border border-[#b4c5ff] flex items-center justify-center text-[#0051d5] font-['Hanken_Grotesk'] font-bold text-sm">
          {officer?.badgeNumber ? officer.badgeNumber.substring(0, 2) : "OS"}
        </div>
        <div>
          <div className="font-['Hanken_Grotesk'] font-bold text-sm text-[#191c1e]">
            {officer?.name || "Officer Singh"}
          </div>
          <div className="text-[11px] font-semibold tracking-wider text-[#45464d] uppercase">
            {officer?.station || "Precinct 04"} - Active
          </div>
        </div>
      </div>

      {/* New Recording Action Button */}
      <Link
        to="/create"
        className="bg-[#0051d5] text-white font-semibold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 mb-4 hover:bg-[#316bf3] transition-all duration-200 w-full shadow-xs active:scale-95"
      >
        <span className="material-symbols-outlined fill-icon text-[20px]" aria-hidden="true">add</span>
        New Recording
      </Link>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Portal Services">
        <Link
          to="/dashboard"
          className={`rounded-lg p-3 flex items-center gap-3 text-sm font-semibold transition-all duration-100 ${
            location.pathname === "/dashboard"
              ? "bg-[#316bf3] text-white"
              : "text-[#45464d] hover:text-[#191c1e] hover:bg-[#e0e3e5]"
          }`}
        >
          <span className={`material-symbols-outlined ${location.pathname === "/dashboard" ? "icon-fill" : ""}`} aria-hidden="true">
            dashboard
          </span>
          Dashboard
        </Link>

        <Link
          to="/create"
          className={`rounded-lg p-3 flex items-center gap-3 text-sm font-semibold transition-all duration-100 ${
            location.pathname === "/create"
              ? "bg-[#316bf3] text-white"
              : "text-[#45464d] hover:text-[#191c1e] hover:bg-[#e0e3e5]"
          }`}
        >
          <span className={`material-symbols-outlined ${location.pathname === "/create" ? "fill-icon" : ""}`} aria-hidden="true">
            mic
          </span>
          Record FIR
        </Link>

        <Link
          to="/vault"
          className={`rounded-lg p-3 flex items-center gap-3 text-sm font-semibold transition-all duration-100 ${
            location.pathname === "/vault"
              ? "bg-[#316bf3] text-white"
              : "text-[#45464d] hover:text-[#191c1e] hover:bg-[#e0e3e5]"
          }`}
        >
          <span className={`material-symbols-outlined ${location.pathname === "/vault" ? "icon-fill" : ""}`} aria-hidden="true">
            folder_shared
          </span>
          Records Vault
        </Link>

        <Link
          to="/analytics"
          className={`rounded-lg p-3 flex items-center gap-3 text-sm font-semibold transition-all duration-100 ${
            location.pathname === "/analytics"
              ? "bg-[#316bf3] text-white"
              : "text-[#45464d] hover:text-[#191c1e] hover:bg-[#e0e3e5]"
          }`}
        >
          <span className={`material-symbols-outlined ${location.pathname === "/analytics" ? "icon-fill" : ""}`} aria-hidden="true">
            query_stats
          </span>
          Analytics
        </Link>
      </nav>

      {/* Legal & Statutory Footer Links */}
      <div className="mt-auto border-t border-[#E2E8F0] pt-3 flex flex-col gap-1.5 text-xs text-[#45464d]">
        <Link to="/privacy-policy" className="hover:text-[#0051d5] hover:underline">
          Privacy Policy
        </Link>
        <Link to="/terms-and-conditions" className="hover:text-[#0051d5] hover:underline">
          Terms of Service
        </Link>
        <Link to="/cookie-policy" className="hover:text-[#0051d5] hover:underline">
          Cookie Policy
        </Link>
      </div>

    </aside>
  );
}

export default function Navbar() {
  return (
    <>
      <TopAppBar />
      <SideNavBar />
    </>
  );
}
