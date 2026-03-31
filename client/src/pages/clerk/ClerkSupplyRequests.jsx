import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ClerkSupplyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id: '', quantity_requested: '', note: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/supply-requests/?page=${page}&per_page=10`);
      setRequests(res.data.requests || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load your requests');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data.products || []);
    } catch {
      toast.error('Failed to load products');
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchProducts();
  }, [fetchRequests, fetchProducts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product_id || !form.quantity_requested) {
      return toast.error('Product and quantity are required');
    }

    try {
      await api.post('/supply-requests/', {
        product_id: parseInt(form.product_id),
        quantity_requested: parseInt(form.quantity_requested),
        note: form.note.trim()
      });
      toast.success('Supply request submitted successfully ✅');
      setShowForm(false);
      setForm({ product_id: '', quantity_requested: '', note: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (status === 'declined') return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
  };

  return (
    <DashboardLayout title="Supply Requests 🚚">
      <div className="space-y-6">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">My Supply Requests</h2>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              {showForm ? 'Cancel' : '+ New Request'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product *</label>
                <select
                  className="input-field"
                  value={form.product_id}
                  onChange={e => setForm({ ...form, product_id: e.target.value })}
                  required
                >
                  <option value="">Select product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity Requested *</label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  value={form.quantity_requested}
                  onChange={e => setForm({ ...form, quantity_requested: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Note (optional)</label>
                <textarea
                  className="input-field h-24 resize-y"
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                  placeholder="e.g. Running low on stock this week"
                />
              </div>

              <button type="submit" className="btn-primary w-full">Submit Request</button>
            </form>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading your requests...</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🚚</p>
              <p>No supply requests yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Product</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Qty Requested</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Note</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-4 font-medium">{r.product_name}</td>
                        <td className="py-4 px-4 font-medium">{r.quantity_requested}</td>
                        <td className="py-4 px-4 text-gray-500 max-w-xs truncate">{r.note || '—'}</td>
                        <td className="py-4 px-4">
                          <span className={`px-4 py-1 text-xs font-medium rounded-full ${getStatusBadge(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-400 dark:text-gray-500 text-xs">{r.created_at}</td>
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
      </div>
    </DashboardLayout>
  );
};

export default ClerkSupplyRequests;