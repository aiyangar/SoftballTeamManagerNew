import React from 'react';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-700 rounded ${className}`} />
);

export default Skeleton;
