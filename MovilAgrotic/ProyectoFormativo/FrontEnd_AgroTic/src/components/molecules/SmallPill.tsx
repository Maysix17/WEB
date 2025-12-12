import React from 'react';

interface SmallPillProps {
  children: React.ReactNode;
}

const SmallPill: React.FC<SmallPillProps> = ({ children }) => {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-green-100 border border-gray-300">
      {children}
    </span>
  );
};

export default SmallPill;