import React from 'react';

interface ProfileTemplateProps {
  children: React.ReactNode;
}

const ProfileTemplate: React.FC<ProfileTemplateProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f6f8fb] to-[#eef2f6] p-5">
      <div className="max-w-[820px] w-full">
        {children}
      </div>
    </div>
  );
};

export default ProfileTemplate;