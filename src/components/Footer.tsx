import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Github, Twitter, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-20 pb-10 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link to="/home" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="text-zinc-950 w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Lumora</span>
            </Link>
            <p className="text-zinc-500 max-w-sm leading-relaxed">
              Institutional-grade AI sentiment analysis and autonomous trading for the modern investor. 
              Powered by Gemini 3.1 Pro.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={Twitter} href="#" />
              <SocialLink icon={Github} href="#" />
              <SocialLink icon={Linkedin} href="#" />
              <SocialLink icon={Mail} href="#" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><FooterLink to="/">Dashboard</FooterLink></li>
              <li><FooterLink to="/history">Trade History</FooterLink></li>
              <li><FooterLink to="/about">How it Works</FooterLink></li>
              <li><FooterLink to="/login">Login</FooterLink></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><FooterLink to="/about">About Us</FooterLink></li>
              <li><FooterLink to="#">Privacy Policy</FooterLink></li>
              <li><FooterLink to="#">Terms of Service</FooterLink></li>
              <li><FooterLink to="#">Contact</FooterLink></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs">
            © 2026 Lumora AI Technologies. All rights reserved.
          </p>
          <p className="text-zinc-600 text-xs flex items-center gap-2">
            Built with <span className="text-red-500">❤</span> for the future of finance.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string, children: React.ReactNode }) {
  return (
    <Link to={to} className="text-zinc-500 hover:text-emerald-500 transition-colors">
      {children}
    </Link>
  );
}

function SocialLink({ icon: Icon, href }: { icon: any, href: string }) {
  return (
    <a 
      href={href} 
      className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:bg-emerald-500 hover:text-zinc-950 transition-all"
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}
