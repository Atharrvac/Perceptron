
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center p-3 my-2 rounded-lg hover:bg-slate-700 transition-colors ${
        isActive ? 'bg-cyan-600 text-white' : 'text-slate-300'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};

const Navbar: React.FC = () => {
  return (
    <nav className="w-64 bg-slate-800 p-4 shadow-lg flex flex-col">
      <div className="text-2xl font-bold text-white mb-10 text-center">HDTN Connect</div>
      <NavItem
        to="/"
        icon={<HomeIcon />}
        label="Home"
      />
      <NavItem
        to="/profile"
        icon={<UserIcon />}
        label="Profile"
      />
      <NavItem
        to="/marketplace"
        icon={<MapIcon />}
        label="Marketplace"
      />
      <NavItem
        to="/dashboard"
        icon={<LayoutIcon />}
        label="Dashboard"
      />
      <div className="mt-auto text-center text-xs text-slate-500">
        © 2024 HDTN Connect
      </div>
    </nav>
  );
};

// SVG Icons (simple placeholders)
const HomeIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const UserIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const MapIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0-6V4a2 2 0 012-2h4a2 2 0 012 2v3m0 9v-6m0 0l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 0h6" />
  </svg>
);
const LayoutIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);

export default Navbar;
