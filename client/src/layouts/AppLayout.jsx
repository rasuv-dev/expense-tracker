import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Menu, ReceiptText, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Brand from "../components/Brand";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ReceiptText },
];

// Helper for dynamic navigation link styling
function getNavLinkClass({ isActive }) {
  const baseClass =
    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors";
  const activeClass = "bg-emerald-50 text-emerald-800";
  const inactiveClass = "text-slate-500 hover:bg-slate-50 hover:text-slate-900";

  return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
}

// Sidebar component (used for both desktop and mobile drawer)
function Sidebar({ onClose }) {
  const { logout } = useAuth();

  return (
    <div className="flex h-full flex-col p-4">
      {/* Brand Header */}
      <div className="px-2 pb-6 pt-3">
        <Brand />
      </div>

      {/* Section Label */}
      <p className="px-2 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
        Workspace
      </p>

      {/* Navigation Links */}
      <nav className="space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={getNavLinkClass}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Action at Bottom */}
      <div className="mt-auto pt-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}

// Main App Layout Frame
export default function AppLayout() {
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();

  const pageTitle = location.pathname.startsWith("/transactions")
    ? "Transactions"
    : "Overview";

  function getInitials(user) {
    const name = user?.name || user?.email || "U";
    const parts = name.trim().split(" ");

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    return parts[0][0].toUpperCase();
  }

  const initials = getInitials(user);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <Sidebar />
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <button
            aria-label="Close navigation overlay"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-slate-950/30"
          />
          {/* Drawer Menu */}
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 pt-5">
              <Brand />
              <button
                onClick={() => setMobileNavOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onClose={() => setMobileNavOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Container */}
      <div className="lg:pl-64">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-8 lg:px-10">
          {/* Title & Hamburger button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-xs font-medium text-slate-400">
                Expense Tracker
              </p>
              <h1 className="text-base font-bold text-slate-900">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.name || "Your account"}
              </p>
              <p className="max-w-xs truncate text-xs text-slate-500">
                {user?.email}
              </p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-800">
              {initials}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto max-w-7xl p-4 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
