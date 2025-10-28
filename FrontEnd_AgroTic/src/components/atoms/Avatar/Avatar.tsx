import React from 'react';
import { Avatar as HeroUIAvatar } from '@heroui/react';
import { UserIcon } from '@heroicons/react/24/outline';
import type { AvatarProps } from '../../../types/Avatar.types';

const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md' }) => {
  return (
    <HeroUIAvatar
      src={src}
      alt={alt}
      size={size}
      fallback={<UserIcon className="w-6 h-6" />}
      className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
      role="img"
      aria-label={alt}
    />
  );
};

export default Avatar;