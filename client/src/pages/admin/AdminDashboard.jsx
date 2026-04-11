import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Chart from '../../components/common/Chart';

const AdminDashboard = () => {
  const [summary, setSummary] = useState({});
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchTrend();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/inventory/report/summary');
      setSummary(res.data.summary || {});
    } catch {
      toast.error('Failed to load summary');
    }
  };

  const fetchTrend = async () => {
    try {
      const res = await api.get('/inventory/report/trend');
      setTrendData(res.data.trend || []);
    } catch {
      toast.error('Failed to load trend data');
    }
  };

  return (
    <DashboardLayout title="Admin Dashboard 📊">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500">Total Received</p>
          <p className="text-3xl font-bold mt-2">{summary.total_items_received || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">In Stock</p>
          <p className="text-3xl font-bold mt-2 text-green-600">{summary.total_items_in_stock || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Spoilt</p>
          <p className="text-3xl font-bold mt-2 text-red-600">{summary.total_items_spoilt || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Unpaid (KES)</p>
          <p className="text-3xl font-bold mt-2 text-orange-600">
            {(summary.total_unpaid_amount || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Chart title="Store Performance" data={trendData} dataKey="quantity_received" color="#4F46E5" />
        <Chart title="Trend Over Time" data={trendData} dataKey="quantity_in_stock" color="#10B981" />
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;