import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ClerkSupplyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id: '', quantity_requested: '', note: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRequests();
    fetchProducts();
  }, [page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/supply-requests/?page=${page}&per_page=10`);
      setRequests(res.data.requests);
      setTotalPages(res.data.pages);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products/');
      setProducts(res.data.products);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/supply-requests/', {
        product_id: parseInt(form.product_id),
        quantity_requested: parseInt(form.quantity_requested),
        note: form.note
      });
      toast.success('Supply request submitted ✅');
      setShowForm(false);
      setForm({ product_id: '', quantity_requested: '', note: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    }
  };

  const statusBadge = (status) => {
    if (status === 'approved') return 'badge-approved';
    if (status === 'declined') return 'badge-declined';
    return 'badge-pending';
  };

  return (
    <DashboardLayout title="Supply Requests 🚚">
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">My Supply Requests</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Request'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select
                className="input-field"
                value={form.product_id}
                onChange={e => setForm({ ...form, product_id: e.target.value })}
                required
              >
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Requested *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
              <input
                className="input-field"
                value={form.note}
                onChange={e => setForm({ ...form, note: e.target.value })}
                placeholder="e.g. Running low on stock"
              />
            </div>
            <button type="submit" className="btn-primary">Submit Request</button>
          </form>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🚚</p>
            <p>No supply requests yet.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Qty Requested</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Note</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{r.product_name}</td>
                    <td className="py-3 px-4">{r.quantity_requested}</td>
                    <td className="py-3 px-4 text-gray-400">{r.note || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={statusBadge(r.status)}>{r.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{r.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default ClerkSupplyRequests;