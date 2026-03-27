import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        {title && (
          <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
        )}
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;