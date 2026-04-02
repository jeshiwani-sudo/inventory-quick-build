
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const MerchantStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [form, setForm] = useState({ name: '', location: '' });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores/');
      setStores(res.data.stores || []);
    } catch {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStore) {
        await api.put(`/stores/${editingStore.id}`, form);
        toast.success('Store updated');
      } else {
        await api.post('/stores/', form);
        toast.success('Store created');
      }
      setShowForm(false);
      setEditingStore(null);
      fetchStores();
    } catch (err) {
      toast.error('Failed to save store');
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setForm({ name: store.name, location: store.location });
    setShowForm(true);
  };

  const handleDelete = async (store) => {
    if (!window.confirm(`Delete store "${store.name}"?`)) return;

    try {
      await api.delete(`/stores/${store.id}`);
      toast.success('Store deleted');
      fetchStores();
    } catch (err) {
      toast.error('Cannot delete store with linked products or users');
    }
  };

  return (
    <DashboardLayout title="Manage Stores 🏪">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Stores</h2>
          <button onClick={() => { setEditingStore(null); setForm({ name: '', location: '' }); setShowForm(true); }} className="btn-primary">
            + Add New Store
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Location</label>
              <input className="input-field" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
            </div>
            <button type="submit" className="btn-primary mt-6">
              {editingStore ? 'Update Store' : 'Create Store'}
            </button>
          </form>
        )}

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-4">Store Name</th>
              <th className="text-left py-4">Location</th>
              <th className="text-left py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store.id} className="border-b hover:bg-gray-50">
                <td className="py-4 font-medium">{store.name}</td>
                <td className="py-4">{store.location}</td>
                <td className="py-4">
                  <button onClick={() => handleEdit(store)} className="text-blue-600 hover:text-blue-700 mr-4">Edit</button>
                  <button onClick={() => handleDelete(store)} className="text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default MerchantStores;
