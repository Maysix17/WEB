import React from 'react';

interface InfoFieldProps {
  label: string;
  value?: string | React.ReactNode;
  full?: boolean;
}

const InfoField: React.FC<InfoFieldProps> = ({ label, value, full = false }) => {
  return (
    <div className={`flex flex-col gap-1 ${full ? 'w-full' : ''}`}>
      <span className="text-xs uppercase text-gray-600">{label}</span>
      <span className="font-bold">{value || '—'}</span>
    </div>
  );
};

export default InfoField;