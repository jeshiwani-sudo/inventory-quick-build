/**
 * Feature: Admin Dashboard
 * Branch: feature/admin-dashboard
 * Changes for new store_products junction table: summary and trend data now aggregate through store_products
 */

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Store Performance</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product_name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity_received" fill="#4F46E5" name="Received" />
              <Bar dataKey="quantity_in_stock" fill="#10B981" name="In Stock" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Trend Over Time</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product_name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="quantity_received" stroke="#4F46E5" strokeWidth={3} />
              <Line type="monotone" dataKey="quantity_in_stock" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
