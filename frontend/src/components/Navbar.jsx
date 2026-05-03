import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-mist bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand text-white font-bold">
            TT
          </div>
          <div>
            <p className="text-sm font-semibold text-slate">Team Task Manager</p>
            <p className="text-xs text-slate/60">Track projects and momentum</p>
          </div>
        </div>
        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-full px-3 py-1 ${
                  isActive ? "bg-brand text-white" : "text-slate hover:text-brand"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `rounded-full px-3 py-1 ${
                  isActive ? "bg-brand text-white" : "text-slate hover:text-brand"
                }`
              }
            >
              Projects
            </NavLink>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate/70">{user.name}</span>
              <button type="button" className="btn-outline" onClick={logout}>
                Sign out
              </button>
            </div>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
