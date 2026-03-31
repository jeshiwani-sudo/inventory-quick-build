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
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores/');
      setStores(res.data.stores || []);
    } catch (err) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.location) {
      return toast.error('Name and location are required');
    }

    setActionId('save');
    try {
      if (editingStore) {
        await api.put(`/stores/${editingStore.id}`, form);
        toast.success('Store updated successfully');
      } else {
        await api.post('/stores/', form);
        toast.success('Store created successfully');
      }
      setShowForm(false);
      setEditingStore(null);
      setForm({ name: '', location: '' });
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save store');
    } finally {
      setActionId(null);
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setForm({ name: store.name, location: store.location });
    setShowForm(true);
  };

  const handleDelete = async (store) => {
    if (!window.confirm(`Delete store "${store.name}"? This cannot be undone.`)) return;

    setActionId(store.id);
    try {
      await api.delete(`/stores/${store.id}`);
      toast.success('Store deleted successfully');
      fetchStores();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete store. It may have users or products.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout title="Manage Stores 🏪">
      <div className="space-y-6">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">All Stores</h2>
            <button
              onClick={() => {
                setEditingStore(null);
                setForm({ name: '', location: '' });
                setShowForm(true);
              }}
              className="btn-primary"
            >
              + Add New Store
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 mb-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name *</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Westlands Branch"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
                <input
                  className="input-field"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Westlands, Waiyaki Way"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1" disabled={actionId === 'save'}>
                  {actionId === 'save' ? 'Saving...' : editingStore ? 'Update Store' : 'Create Store'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingStore(null); }}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="text-center py-16 text-gray-400">Loading stores...</div>
          ) : stores.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🏪</p>
              <p>No stores yet. Add one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Store Name</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Location</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stores.map(store => (
                    <tr key={store.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-4 font-medium text-gray-800 dark:text-white">{store.name}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{store.location}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(store)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(store)}
                            disabled={actionId === store.id}
                            className="text-red-600 hover:text-red-700 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 disabled:opacity-50"
                          >
                            {actionId === store.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MerchantStores;