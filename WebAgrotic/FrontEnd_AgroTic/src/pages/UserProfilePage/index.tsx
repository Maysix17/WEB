import React from 'react';
import ProfileTemplate from '../../components/templates/ProfileTemplate/ProfileTemplate';
import UserModal from '../../components/organisms/UserModal';

const UserProfilePage: React.FC = () => {

  return (
    <ProfileTemplate>
      <UserModal isOpen={true} onClose={() => {}} />
    </ProfileTemplate>
  );
};

export default UserProfilePage;