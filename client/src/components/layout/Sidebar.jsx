import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const merchantLinks = [
    { to: '/merchant/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/merchant/stores', icon: '🏪', label: 'Stores' },
    { to: '/merchant/admins', icon: '👔', label: 'Admins' },
    { to: '/merchant/reports', icon: '📈', label: 'Reports' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/products', icon: '📦', label: 'Products' },
    { to: '/admin/inventory', icon: '📋', label: 'Inventory' },
    { to: '/admin/supply-requests', icon: '🚚', label: 'Supply Requests' },
    { to: '/admin/clerks', icon: '📝', label: 'Clerks' },
  ];

  const clerkLinks = [
    { to: '/clerk/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/clerk/record-entry', icon: '➕', label: 'Record Entry' },
    { to: '/clerk/my-entries', icon: '📋', label: 'My Entries' },
    { to: '/clerk/supply-requests', icon: '🚚', label: 'Supply Requests' },
  ];

  const links =
    user?.role === 'merchant'
      ? merchantLinks
      : user?.role === 'admin'
      ? adminLinks
      : clerkLinks;

  const roleColors = {
    merchant: 'bg-purple-600',
    admin: 'bg-blue-600',
    clerk: 'bg-green-600',
  };

  return (
    <div className="h-screen w-64 bg-gray-900 dark:bg-gray-950 text-white flex flex-col fixed left-0 top-0 overflow-y-auto">

      {/* Logo */}
      <div className="p-6 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-xl">📦</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Inventory App</h1>
            <p className="text-xs text-gray-400">Stock Management</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full ${roleColors[user?.role]} flex items-center justify-center text-sm font-bold`}>
            {user?.full_name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user?.role]}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="px-4 py-3 border-b border-gray-700 dark:border-gray-800">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </span>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 dark:hover:bg-gray-700 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-600 hover:text-white transition-all duration-200 w-full text-sm font-medium"
        >
          <span className="text-lg">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;