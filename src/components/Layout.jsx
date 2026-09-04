import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  BadgeCheck,
  Bell,
  ClipboardList,
  FileScan,
  House,
  Menu,
  ShieldAlert,
  LogOut,
  User,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../auth";

export function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { token, user, logout } = useAuth();
  const links = [
    ["/", "Home", House],
    ["/verify", "Verify", BadgeCheck],
    ["/scan-bill", "Scan bill", FileScan],
    ["/report", "Report", ShieldAlert],
    ["/my-reports", "My reports", ClipboardList],
    ["/profile", "Profile", User],
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([to, label, Icon]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-teal-50 text-sea" : "text-slate-600 hover:bg-slate-50"}`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={logout}
                className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 md:flex"
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
            <button
              className="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={19} />
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-ink md:hidden"
            >
              <Menu size={22} />
            </button>
            <NavLink to="/profile" className="hidden h-9 w-9 place-items-center overflow-hidden rounded-full bg-saffron/15 text-sm font-bold text-amber-700 sm:grid hover:ring-2 hover:ring-sea transition">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user?.name ? user.name.slice(0, 2).toUpperCase() : (user?.phone ? user.phone.slice(-2) : "ME")
              )}
            </NavLink>
          </div>
        </div>
        {open && (
          <div className="border-t bg-white px-4 py-3 md:hidden">
            {links.map(([to, label, Icon]) => (
              <NavLink
                onClick={() => setOpen(false)}
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700"
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            {token && (
              <button
                onClick={() => { setOpen(false); logout(); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-rose-600"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {children}
      </main>

      <nav className="fixed bottom-0 z-30 flex w-full justify-around border-t border-slate-200 bg-white px-1 py-2 md:hidden">
        {links.slice(0, 4).map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px] font-medium ${isActive ? "text-sea" : "text-slate-500"}`
            }
          >
            <Icon size={19} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
