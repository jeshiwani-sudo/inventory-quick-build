import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', store_id: '' });
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Memoize fetch functions to avoid exhaustive-deps warnings
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products/?page=${page}&per_page=10`);
      setProducts(res.data.products || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchStores = useCallback(async () => {
    try {
      const res = await api.get('/stores/');
      setStores(res.data.stores || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchStores();
  }, [fetchProducts, fetchStores]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.store_id) {
      return toast.error('Name and Store are required');
    }

    try {
      await api.post('/products/', form);
      toast.success('Product created successfully ✅');
      setShowForm(false);
      setForm({ name: '', description: '', store_id: '' });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product "${name}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const getStoreName = (storeId) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : `Store #${storeId}`;
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout title="Products 📦">
      <div className="space-y-6">
        <div className="card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">All Products</h2>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search products..."
                className="input-field flex-1"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                onClick={() => setShowForm(!showForm)}
                className="btn-primary whitespace-nowrap"
              >
                {showForm ? 'Cancel' : '+ Add Product'}
              </button>
            </div>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sugar 1kg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  className="input-field"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store *</label>
                <select
                  className="input-field"
                  value={form.store_id}
                  onChange={e => setForm({ ...form, store_id: e.target.value })}
                  required
                >
                  <option value="">Select store...</option>
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary w-full sm:w-auto">Save Product</button>
            </form>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">📦</p>
              <p>No products found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Name</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Description</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Store</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Created</th>
                      <th className="text-left py-4 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-4 font-medium text-gray-800 dark:text-white">{p.name}</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{p.description || '—'}</td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-300 font-medium">
                          {getStoreName(p.store_id)}
                        </td>
                        <td className="py-4 px-4 text-gray-400 dark:text-gray-500 text-xs">{p.created_at}</td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
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

export default AdminProducts;