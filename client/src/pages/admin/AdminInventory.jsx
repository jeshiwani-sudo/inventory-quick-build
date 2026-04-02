import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

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

  return (
    <DashboardLayout title="Inventory Entries 📋">
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">All Inventory Entries</h2>

        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading entries...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">Product</th>
                <th className="text-left py-4">Quantity</th>
                <th className="text-left py-4">Payment Status</th>
                <th className="text-left py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} className="border-b hover:bg-gray-50">
                  <td className="py-4">{entry.product_name}</td>
                  <td className="py-4">{entry.quantity_received}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${entry.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {entry.payment_status}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => togglePayment(entry)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Toggle Payment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminInventory;
