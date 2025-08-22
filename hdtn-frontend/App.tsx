
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import MarketplacePage from './pages/MarketplacePage';
import DashboardPage from './pages/DashboardPage';
import { ToastMessage } from './types';
import Toast from './components/Toast';

const App: React.FC = () => {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const location = useLocation();

  useEffect(() => {
    setToast(null); // Clear toast on route change
  }, [location]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-200">
      <Navbar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/marketplace" element={<MarketplacePage showToast={showToast} />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </main>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
