import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

const ClerkDashboard = () => {
  const [summary, setSummary] = useState({});
  const [recentEntries, setRecentEntries] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchRecentEntries();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/inventory/report/summary');
      setSummary(res.data.summary || {});
    } catch {
      toast.error('Failed to load summary');
    }
  };

  const fetchRecentEntries = async () => {
    try {
      const res = await api.get('/inventory/my-entries?limit=6');
      setRecentEntries(res.data.entries || []);
    } catch {
      toast.error('Failed to load recent entries');
    }
  };

  const columns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Quantity', accessor: 'quantity_received' },
    { header: 'Payment Status', accessor: 'payment_status' },
  ];

  const tableData = recentEntries.map(entry => ({
    product_name: entry.product_name,
    quantity_received: entry.quantity_received,
    payment_status: (
      <span className={`px-3 py-1 text-xs rounded-full ${entry.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {entry.payment_status}
      </span>
    )
  }));

  return (
    <DashboardLayout title="Clerk Dashboard 📋">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Received" value={summary.total_items_received || 0} icon="📥" color="bg-blue-500" />
        <StatCard title="Items In Stock" value={summary.total_items_in_stock || 0} icon="📦" color="bg-green-500" />
        <StatCard title="Spoilt Items" value={summary.total_items_spoilt || 0} icon="⚠️" color="bg-red-500" />
        <StatCard title="Unpaid Amount" value={`KES ${(summary.total_unpaid_amount || 0).toLocaleString()}`} icon="💰" color="bg-orange-500" />
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
        {recentEntries.length === 0 ? (
          <EmptyState title="No recent entries" message="Your recent records will appear here" icon="📋" />
        ) : (
          <Table columns={columns} data={tableData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClerkDashboard;