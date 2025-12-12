import React from 'react';
import type { HeadingProps } from '../../../types/Heading.types';

const Heading: React.FC<HeadingProps> = ({ children, level = 1 }) => {
  return React.createElement(`h${level}`, {}, children);
};

export default Heading;