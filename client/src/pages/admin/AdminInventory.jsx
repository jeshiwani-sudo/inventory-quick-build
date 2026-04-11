import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Table from '../../components/common/Table';

const AdminInventory = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/');
      setEntries(res.data.entries || []);
    } catch {
      toast.error('Failed to load inventory entries');
    } finally {
      setLoading(false);
    }
  };

  const togglePayment = async (entry) => {
    const newStatus = entry.payment_status === 'paid' ? 'unpaid' : 'paid';
    try {
      await api.patch(`/inventory/${entry.id}/payment`, { payment_status: newStatus });
      toast.success(`Marked as ${newStatus}`);
      fetchEntries();
    } catch {
      toast.error('Failed to update payment status');
    }
  };

  const columns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Quantity', accessor: 'quantity_received' },
    { header: 'Payment Status', accessor: 'payment_status' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const tableData = entries.map(entry => ({
    product_name: entry.product_name,
    quantity_received: entry.quantity_received,
    payment_status: (
      <span className={`px-3 py-1 text-xs rounded-full ${entry.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {entry.payment_status}
      </span>
    ),
    actions: (
      <button
        onClick={() => togglePayment(entry)}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        Toggle Payment
      </button>
    )
  }));

  return (
    <DashboardLayout title="Inventory Entries 📋">
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">All Inventory Entries</h2>
        <Table columns={columns} data={tableData} />
      </div>
    </DashboardLayout>
  );
};

export default AdminInventory;