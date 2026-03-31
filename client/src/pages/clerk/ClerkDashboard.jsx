import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ClerkDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({});
  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClerkData();
  }, []);

  const fetchClerkData = async () => {
    setLoading(true);
    try {
      const [summaryRes, entriesRes] = await Promise.all([
        api.get('/inventory/report/summary'),
        api.get('/inventory/my-entries?limit=6')
      ]);

      setSummary(summaryRes.data.summary || {});
      setRecentEntries(entriesRes.data.entries || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Clerk Dashboard">
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Welcome back 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's what's happening with your store today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card flex items-center gap-4 p-6">
            <div className="bg-blue-500 w-12 h-12 rounded-2xl flex items-center justify-center text-3xl">📥</div>
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-3xl font-bold">{summary.total_items_received || 0}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-6">
            <div className="bg-green-500 w-12 h-12 rounded-2xl flex items-center justify-center text-3xl">📦</div>
            <div>
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="text-3xl font-bold">{summary.total_items_in_stock || 0}</p>
            </div>
          </div>
          <div className="card flex items-center gap-4 p-6">
            <div className="bg-red-500 w-12 h-12 rounded-2xl flex items-center justify-center text-3xl">🗑️</div>
            <div>
              <p className="text-sm text-gray-500">Spoilt</p>
              <p className="text-3xl font-bold text-red-600">{summary.total_items_spoilt || 0}</p>
            </div>
          </div>
          <div 
            className="card flex items-center gap-4 p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/clerk/my-entries')}
          >
            <div className="bg-purple-500 w-12 h-12 rounded-2xl flex items-center justify-center text-3xl">📋</div>
            <div>
              <p className="text-sm text-gray-500">My Entries</p>
              <p className="text-3xl font-bold">{summary.total_entries || 0}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/clerk/record-entry')}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-3 text-lg shadow-sm"
          >
            <span className="text-2xl">+</span> Record New Entry
          </button>
          <button
            onClick={() => navigate('/clerk/supply-requests')}
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-medium flex items-center justify-center gap-3 text-lg shadow-sm"
          >
            🚚 New Supply Request
          </button>
        </div>

        {/* Recent Entries */}
        <div className="card">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-semibold">My Recent Entries</h2>
            <button 
              onClick={() => navigate('/clerk/my-entries')}
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <p className="text-center py-10 text-gray-400">Loading recent entries...</p>
          ) : recentEntries.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📋</p>
              <p>No entries yet. Start recording inventory!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Received</th>
                    <th className="text-left py-3 px-4">In Stock</th>
                    <th className="text-left py-3 px-4">Spoilt</th>
                    <th className="text-left py-3 px-4">Payment</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEntries.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{entry.product_name}</td>
                      <td className="py-3 px-4">{entry.quantity_received}</td>
                      <td className="py-3 px-4">{entry.quantity_in_stock}</td>
                      <td className="py-3 px-4 text-red-500">{entry.quantity_spoilt}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          entry.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {entry.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{entry.recorded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClerkDashboard;