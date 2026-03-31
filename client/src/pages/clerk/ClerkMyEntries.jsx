import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

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

  return (
    <DashboardLayout title="My Entries 📋">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Inventory Entries</h2>
          
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
          <div className="text-center py-16 text-gray-400">Loading your entries...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">📋</p>
            <p>No entries yet. Go record some inventory!</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Product</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Received</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">In Stock</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Spoilt</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Buy Price</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Sell Price</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Payment</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-4 font-medium text-gray-800 dark:text-white">{e.product_name}</td>
                      <td className="py-4 px-4">{e.quantity_received}</td>
                      <td className="py-4 px-4">{e.quantity_in_stock}</td>
                      <td className="py-4 px-4 text-red-500">{e.quantity_spoilt}</td>
                      <td className="py-4 px-4">KES {parseFloat(e.buying_price || 0).toLocaleString()}</td>
                      <td className="py-4 px-4">KES {parseFloat(e.selling_price || 0).toLocaleString()}</td>
                      <td className="py-4 px-4">
                        <span className={`px-4 py-1 text-xs font-medium rounded-full ${
                          e.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                        }`}>
                          {e.payment_status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 dark:text-gray-500 text-xs">{e.recorded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClerkMyEntries;