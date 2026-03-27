import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AdminInventory = () => {
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
      let url = `/inventory/?page=${page}&per_page=10`;
      if (filter) url += `&payment_status=${filter}`;
      const res = await api.get(url);
      setEntries(res.data.entries);
      setTotalPages(res.data.pages);
    } catch {
      toast.error('Failed to load entries');
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
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  return (
    <DashboardLayout title="Inventory Entries 📋">
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">All Entries</h2>
          <select
            className="input-field w-48"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>No entries found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Clerk</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Received</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">In Stock</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Spoilt</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Buy Price</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Sell Price</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Payment</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{e.product_name}</td>
                      <td className="py-3 px-4 text-gray-500">{e.clerk_name}</td>
                      <td className="py-3 px-4">{e.quantity_received}</td>
                      <td className="py-3 px-4">{e.quantity_in_stock}</td>
                      <td className="py-3 px-4 text-red-500">{e.quantity_spoilt}</td>
                      <td className="py-3 px-4">KES {e.buying_price}</td>
                      <td className="py-3 px-4">KES {e.selling_price}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => togglePayment(e)}
                          className={`text-xs font-medium px-2.5 py-0.5 rounded-full cursor-pointer ${
                            e.payment_status === 'paid'
                              ? 'badge-paid'
                              : 'badge-unpaid'
                          }`}
                        >
                          {e.payment_status} (click to toggle)
                        </button>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{e.recorded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40">← Prev</button>
                <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminInventory;