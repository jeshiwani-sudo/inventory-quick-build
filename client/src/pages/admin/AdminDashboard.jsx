import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/report/summary');
      setSummary(res.data.summary || {});
    } catch (err) {
      toast.error('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Received", value: summary.total_items_received || 0, icon: "📥", color: "bg-blue-500" },
    { title: "In Stock", value: summary.total_items_in_stock || 0, icon: "📦", color: "bg-green-500" },
    { title: "Total Spoilt", value: summary.total_items_spoilt || 0, icon: "🗑️", color: "bg-red-500" },
    { title: "Unpaid Amount", value: `KES ${(summary.total_unpaid_amount || 0).toLocaleString()}`, icon: "⏳", color: "bg-orange-500" }
  ];

  return (
    <DashboardLayout title="Admin Dashboard 👔">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="card flex items-center gap-4 p-6">
              <div className={`${card.color} w-12 h-12 rounded-2xl flex items-center justify-center text-2xl text-white`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
                  {card.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-3xl">✅</div>
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Total Paid</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  KES {(summary.total_paid_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-3xl">⏳</div>
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Total Unpaid</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                  KES {(summary.total_unpaid_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 dark:text-gray-500 py-8">
          Charts coming soon (trend endpoint needs backend work)
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;