import React from 'react';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center p-4">
      <div className="w-full max-w-4xl">{children}</div>
    </div>
  );
}

