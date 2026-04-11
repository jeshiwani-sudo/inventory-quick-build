import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', store_id: '' });
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
    if (!form.name || !form.store_id) return toast.error('Name and Store are required');

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

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Description', accessor: 'description' },
    { header: 'Store', accessor: 'store' },
    { header: 'Created', accessor: 'created_at' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const tableData = products.map(p => ({
    name: p.name,
    description: p.description || '—',
    store: stores.find(s => s.id === p.store_id)?.name || `Store #${p.store_id}`,
    created_at: p.created_at,
    actions: (
      <button
        onClick={() => handleDelete(p.id, p.name)}
        className="text-red-500 hover:text-red-700 text-sm font-medium"
      >
        Delete
      </button>
    )
  }));

  const filteredData = tableData.filter(row =>
    row.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (row.description && row.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout title="Products 📦">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold">All Products</h2>
          
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
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl mb-8 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1">Product Name *</label>
              <input
                className="input-field"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                className="input-field"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store *</label>
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
            <button type="submit" className="btn-primary w-full">Save Product</button>
          </form>
        )}

        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading products...</p>
        ) : filteredData.length === 0 ? (
          <EmptyState title="No products found" message="Try a different search term" icon="📦" />
        ) : (
          <Table columns={columns} data={filteredData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;