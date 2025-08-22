
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white p-4 rounded-md shadow-lg transition-opacity duration-300 animate-fadeIn`}>
      {message}
      <button onClick={onClose} className="ml-4 text-xl font-semibold">&times;</button>
    </div>
  );
};

export default Toast;
