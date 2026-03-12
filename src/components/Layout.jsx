import { Link, NavLink } from "react-router-dom";
import WalletConnectPanel from "./WalletConnectPanel";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? "bg-amber-300 text-slate-950" : "text-slate-300 hover:bg-white/10"
  }`;

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 theme-noise" />
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/" className="font-display text-2xl font-bold tracking-tight text-white">
          TipJar<span className="text-amber-300">OP</span>
        </Link>
        <div className="flex items-center gap-3">
          <nav className="glass flex items-center gap-2 rounded-full border border-white/10 px-2 py-2 shadow-panel">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/create" className={navLinkClass}>
              Create
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </nav>
          <WalletConnectPanel compact />
        </div>
      </header>
      <main className="relative z-10 pb-16">{children}</main>
    </div>
  );
}
