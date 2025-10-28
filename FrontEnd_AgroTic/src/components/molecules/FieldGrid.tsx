import React from 'react';

interface FieldGridProps {
  children: React.ReactNode;
}

const FieldGrid: React.FC<FieldGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  );
};

export default FieldGrid;