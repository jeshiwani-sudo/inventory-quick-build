import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom'; 
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {    
    dispatch(logout());   
    toast.success('Logged out successfully');
    setTimeout(() => {
      navigate('/', { replace: true });
    }, 80);
  };

  const merchantLinks = [
    { to: '/merchant/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/merchant/stores', icon: '🏪', label: 'Stores' },
    { to: '/merchant/admins', icon: '👔', label: 'Admins' },
    { to: '/merchant/reports', icon: '📈', label: 'Reports' },
    { to: '/profile/edit', icon: '👤', label: 'Edit Profile' },
    { to: '/profile/change-password', icon: '🔑', label: 'Change Password' },   
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/admin/products', icon: '📦', label: 'Products' },
    { to: '/admin/inventory', icon: '📋', label: 'Inventory' },
    { to: '/admin/supply-requests', icon: '🚚', label: 'Supply Requests' },
    { to: '/admin/clerks', icon: '📝', label: 'Clerks' },
    { to: '/admin/reports', icon: '📈', label: 'Reports' },
    { to: '/profile/edit', icon: '👤', label: 'Edit Profile' },
    { to: '/profile/change-password', icon: '🔑', label: 'Change Password' },   
  ];

  const clerkLinks = [
    { to: '/clerk/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/clerk/record-entry', icon: '📝', label: 'Record Entry' },
    { to: '/clerk/my-entries', icon: '📋', label: 'My Entries' },
    { to: '/clerk/supply-requests', icon: '🚚', label: 'Supply Requests' },
    { to: '/profile/edit', icon: '👤', label: 'Edit Profile' },
    { to: '/profile/change-password', icon: '🔑', label: 'Change Password' },   
  ];

  const links = user?.role === 'merchant' ? merchantLinks
    : user?.role === 'admin' ? adminLinks
    : clerkLinks;

  const roleColors = {
    merchant: 'bg-purple-100 text-purple-700',
    admin: 'bg-blue-100 text-blue-700',
    clerk: 'bg-green-100 text-green-700',
  };

  return (
    <div className="h-screen w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo / Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center text-xl">📦</div>
          <h1 className="text-2xl font-bold tracking-tight">LocalShop</h1>
        </div>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-3">
        <div className={`w-10 h-10 flex-shrink-0 rounded-2xl flex items-center justify-center ${roleColors[user?.role] || 'bg-gray-700'} text-xl`}>
          {user?.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <p className="text-sm font-medium">{user?.full_name || 'User'}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[user?.role] || 'bg-gray-700'}`}>
            {user?.role || 'Guest'}
          </span>
        </div>
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
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-lg">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
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