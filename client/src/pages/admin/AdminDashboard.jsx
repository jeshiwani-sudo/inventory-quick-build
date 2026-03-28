import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntries, fetchSummary } from '../../store/slices/inventorySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { entries, summary, loading } = useSelector((state) => state.inventory);

  useEffect(() => {
    dispatch(fetchEntries({ page: 1, per_page: 20 }));
    dispatch(fetchSummary());
  }, [dispatch]);

  const chartData = entries.slice(0, 7).map((entry) => ({
    name: entry.product_name?.slice(0, 10),
    received: entry.quantity_received,
    inStock: entry.quantity_in_stock,
    spoilt: entry.quantity_spoilt,
  }));

  return (
    <DashboardLayout title="Admin Dashboard 👔">

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Received"
          value={summary?.total_items_received || 0}
          icon="📥"
          color="bg-blue-500"
        />
        <StatCard
          title="In Stock"
          value={summary?.total_items_in_stock || 0}
          icon="📦"
          color="bg-green-500"
        />
        <StatCard
          title="Total Spoilt"
          value={summary?.total_items_spoilt || 0}
          icon="🗑️"
          color="bg-red-500"
        />
        <StatCard
          title="Unpaid Amount"
          value={`KES ${summary?.total_unpaid_amount || 0}`}
          icon="💰"
          color="bg-yellow-500"
          subtitle="Pending payment"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Stock Overview (Bar Chart)
          </h2>
          {loading ? <LoadingSpinner /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="received" fill="#4F46E5" name="Received" radius={[4,4,0,0]} />
                <Bar dataKey="inStock" fill="#10B981" name="In Stock" radius={[4,4,0,0]} />
                <Bar dataKey="spoilt" fill="#EF4444" name="Spoilt" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Stock Trend (Line Chart)
          </h2>
          {loading ? <LoadingSpinner /> : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="received" stroke="#4F46E5" strokeWidth={2} dot={{ r: 4 }} name="Received" />
                <Line type="monotone" dataKey="inStock" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="In Stock" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-green-700">
                KES {summary?.total_paid_amount || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⏳</span>
            <div>
              <p className="text-sm text-gray-500">Total Unpaid</p>
              <p className="text-2xl font-bold text-red-700">
                KES {summary?.total_unpaid_amount || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
};

export default AdminDashboard;