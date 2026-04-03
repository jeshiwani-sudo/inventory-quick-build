import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const ClerkSupplyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ store_product_id: '', quantity_requested: '', note: '' });

  const fetchRequests = useCallback(async () => {
    try {
      const res = await api.get('/supply-requests/?page=1&per_page=10');
      setRequests(res.data.requests || []);
    } catch {
      toast.error('Failed to load your requests');
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products/store-products');
      setProducts(res.data.store_products || []);
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
    if (!form.store_product_id) return toast.error('Please select a product');

    try {
      await api.post('/supply-requests/', {
        store_product_id: parseInt(form.store_product_id),
        quantity_requested: parseInt(form.quantity_requested),
        note: form.note
      });
      toast.success('Supply request submitted ✅');
      setShowForm(false);
      setForm({ store_product_id: '', quantity_requested: '', note: '' });
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit request');
    }
  };

  return (
    <DashboardLayout title="Supply Requests 🚚">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Supply Requests</h2>
          <button onClick={() => setShowForm(true)} className="btn-primary">+ New Request</button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Product</label>
              <select
                className="input-field"
                value={form.store_product_id}
                onChange={(e) => setForm({ ...form, store_product_id: e.target.value })}
                required
              >
                <option value="">Select Product</option>
                {products.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    {sp.product_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Quantity Requested</label>
              <input
                type="number"
                className="input-field"
                value={form.quantity_requested}
                onChange={(e) => setForm({ ...form, quantity_requested: e.target.value })}
                required
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Note (optional)</label>
              <textarea
                className="input-field"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                rows="3"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button type="submit" className="btn-primary flex-1">Submit Request</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 border border-gray-300 rounded-lg">Cancel</button>
            </div>
          </form>
        )}

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4">Product</th>
              <th className="text-left py-4">Quantity</th>
              <th className="text-left py-4">Status</th>
              <th className="text-left py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-4">{r.product_name}</td>
                <td className="py-4">{r.quantity_requested}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 text-xs rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-4 text-gray-500 text-sm">{r.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default ClerkSupplyRequests;