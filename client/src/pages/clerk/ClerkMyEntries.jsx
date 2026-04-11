import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

const ClerkMyEntries = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEntries();
  }, [page, filter]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      let url = `/inventory/my-entries?page=${page}&per_page=10`;
      if (filter) url += `&payment_status=${filter}`;
      const res = await api.get(url);
      setEntries(res.data.entries || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load your entries');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Received', accessor: 'quantity_received' },
    { header: 'In Stock', accessor: 'quantity_in_stock' },
    { header: 'Spoilt', accessor: 'quantity_spoilt' },
    { header: 'Buy Price', accessor: 'buying_price' },
    { header: 'Sell Price', accessor: 'selling_price' },
    { header: 'Payment', accessor: 'payment_status' },
    { header: 'Date', accessor: 'recorded_at' },
  ];

  const tableData = entries.map(e => ({
    product_name: e.product_name,
    quantity_received: e.quantity_received,
    quantity_in_stock: e.quantity_in_stock,
    quantity_spoilt: e.quantity_spoilt,
    buying_price: `KES ${parseFloat(e.buying_price || 0).toLocaleString()}`,
    selling_price: `KES ${parseFloat(e.selling_price || 0).toLocaleString()}`,
    payment_status: (
      <span className={`px-4 py-1 text-xs font-medium rounded-full ${
        e.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
      }`}>
        {e.payment_status}
      </span>
    ),
    recorded_at: e.recorded_at
  }));

  return (
    <DashboardLayout title="My Entries 📋">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">My Inventory Entries</h2>
          <select
            className="input-field w-full sm:w-52"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Payments</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading your entries...</p>
        ) : entries.length === 0 ? (
          <EmptyState title="No entries yet" message="Go record some inventory!" icon="📋" />
        ) : (
          <Table columns={columns} data={tableData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClerkMyEntries;