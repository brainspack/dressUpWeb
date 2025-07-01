import React from 'react';

const Loader: React.FC<{ message?: string; className?: string }> = ({ message = 'Loading...', className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
    <p className="text-lg text-gray-600">{message}</p>
  </div>
);

export default Loader; 