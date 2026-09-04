import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Building2,
  Menu,
  LogOut,
  User,
} from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../auth";

export function InspectorLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  
  const links = [
    ["/inspector", "Dashboard", LayoutDashboard],
    ["/inspector/reports", "Reports", ShieldCheck],
    ["/inspector/heatmap", "Heat Map", Map],
    ["/inspector/businesses", "Businesses", Building2],
  ];

  if (user?.role === "government") {
    links.push(["/inspector/analytics", "Analytics", LayoutDashboard]);
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-slate-900 shadow-sm">
        <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldCheck size={28} className="text-teal-400" />
            <span className="text-xl font-black tracking-tight text-white">YatraSetu <span className="text-teal-400 font-medium text-sm ml-1 px-2 py-0.5 rounded-full bg-teal-900/50">Inspector</span></span>
          </div>
          
          <nav className="hidden items-center gap-1 md:flex">
            {links.map(([to, label, Icon]) => (
              <NavLink
                end={to === "/inspector"}
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"}`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-slate-300 md:flex">
              <span className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-teal-400">
                📍 {user?.region || "No Region"}
              </span>
            </div>

            <div className="relative">
              <button onClick={() => setOpen(!open)} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 relative">
                <Bell size={19} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500"></span>
              </button>
            </div>
            
            <button onClick={() => setOpen(!open)} className="rounded-lg p-2 text-slate-300 md:hidden">
              <Menu size={22} />
            </button>
            
            <NavLink to="/profile" className="hidden h-9 w-9 place-items-center overflow-hidden rounded-full bg-slate-700 text-sm font-bold text-slate-200 sm:grid hover:ring-2 hover:ring-teal-400 transition" title="My Profile">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                user?.name ? user.name.slice(0, 2).toUpperCase() : "IN"
              )}
            </NavLink>
            
            <button 
              onClick={logout}
              className="hidden items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white md:flex"
              title="Logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
        
        {/* Mobile Dropdown */}
        {open && (
          <div className="border-t border-slate-700 bg-slate-900 px-4 py-3 md:hidden">
            <div className="mb-3 px-3">
              <span className="flex items-center gap-1 rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-teal-400 inline-flex">
                📍 {user?.region || "No Region"}
              </span>
            </div>
            {links.map(([to, label, Icon]) => (
              <NavLink
                end={to === "/inspector"}
                onClick={() => setOpen(false)}
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-300"
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-rose-400"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {children || <Outlet />}
      </main>

      <nav className="fixed bottom-0 z-30 flex w-full justify-around border-t border-slate-200 bg-white px-1 py-2 md:hidden">
        {links.slice(0, 4).map(([to, label, Icon]) => (
          <NavLink
            end={to === "/inspector"}
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-lg px-3 py-1 text-[10px] font-medium ${isActive ? "text-slate-900" : "text-slate-500"}`
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
