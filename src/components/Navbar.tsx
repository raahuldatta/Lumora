import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';
import { User } from '../types';

export default function Navbar({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const publicLinks = [
    { name: 'Home', path: '/home' },
    { name: 'About', path: '/about' },
    { name: 'Pricing', path: '/pricing' },
  ];

  const authLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'History', path: '/history' },
    { name: 'Backtest', path: '/backtest' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 z-[100]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/home" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <TrendingUp className="text-zinc-950 w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Lumora</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {publicLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={clsx(
                "text-sm font-medium transition-colors",
                location.pathname === link.path ? "text-emerald-500" : "text-zinc-400 hover:text-white"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          {user && (
            <>
              <div className="w-px h-4 bg-zinc-800"></div>
              {authLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={clsx(
                    "text-sm font-medium transition-colors",
                    location.pathname === link.path ? "text-emerald-500" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold text-white">{user.name}</p>
                <p className="text-[10px] text-zinc-500">{user.email}</p>
              </div>
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                Log in
              </Link>
              <Link 
                to="/login" 
                className="px-5 py-2.5 bg-emerald-500 text-zinc-950 text-sm font-bold rounded-xl hover:bg-emerald-400 transition-all"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-zinc-400 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-900 px-6 py-8 space-y-6 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-4">
            {publicLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-zinc-400 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            {user && authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg font-bold text-zinc-400 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-6 border-t border-zinc-900 flex flex-col gap-4">
            {user ? (
              <button 
                onClick={() => { onLogout(); setIsOpen(false); }}
                className="w-full py-3 bg-red-500/10 text-red-400 font-bold rounded-xl"
              >
                Logout
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-zinc-900 text-white font-bold rounded-xl text-center"
                >
                  Log in
                </Link>
                <Link 
                  to="/login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 bg-emerald-500 text-zinc-950 font-bold rounded-xl text-center"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
