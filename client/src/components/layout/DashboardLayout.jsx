import React, { useState } from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-950
        transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0
      `}>
        <Sidebar />
      </div>

      {/* Main Content  */}
      <div className="flex-1 min-h-screen w-full lg:ml-0">
        
        {/* Mobile Top Bar  */}
        <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            ☰
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xl">📦</span>
            <h1 className="font-semibold text-lg text-gray-800 dark:text-white truncate">
              {title || "Inventory App"}
            </h1>
          </div>

          <div className="w-8" />
        </div>

        {/* Page Content  */}
        <div className="p-4 lg:p-8">
          {title && (
            <h1 className="hidden lg:block text-2xl font-bold text-gray-800 dark:text-white mb-6">
              {title}
            </h1>
          )}
          {children}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;