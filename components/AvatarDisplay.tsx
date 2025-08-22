
import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const AvatarDisplay: React.FC<AvatarProps> = ({ src, alt, size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16 md:w-24 md:h-24',
    large: 'w-32 h-32 md:w-48 md:h-48',
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`rounded-full object-cover border-2 border-teal-500 shadow-lg ${sizeClasses[size]} ${className}`}
    />
  );
};

export default AvatarDisplay;
