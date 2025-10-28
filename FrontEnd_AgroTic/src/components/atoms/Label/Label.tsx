import React from 'react';

interface LabelProps {
  children: React.ReactNode;
}

const Label: React.FC<LabelProps> = ({ children }) => {
  return <label className="text-sm uppercase">{children}</label>;
};

export default Label;