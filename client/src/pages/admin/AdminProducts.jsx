import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', store_id: '' });
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/?page=${page}&per_page=10`);
      setProducts(res.data.products);
      setTotalPages(res.data.pages);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores/');
      setStores(res.data.stores);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/products/', form);
      toast.success('Product created ✅');
      setShowForm(false);
      setForm({ name: '', description: '', store_id: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <DashboardLayout title="Products 📦">
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">All Products</h2>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Product'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Sugar 1kg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                className="input-field"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store *</label>
              <select
                className="input-field"
                value={form.store_id}
                onChange={e => setForm({ ...form, store_id: e.target.value })}
                required
              >
                <option value="">Select store...</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary">Save Product</button>
          </form>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p>No products yet.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Description</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Store ID</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Created</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{p.name}</td>
                    <td className="py-3 px-4 text-gray-500">{p.description || '—'}</td>
                    <td className="py-3 px-4">{p.store_id}</td>
                    <td className="py-3 px-4 text-gray-400">{p.created_at}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
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

export default AdminProducts;