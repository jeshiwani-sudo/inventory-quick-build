import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

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

  const columns = [
    { header: 'Store Name', accessor: 'name' },
    { header: 'Location', accessor: 'location' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const tableData = stores.map(store => ({
    name: store.name,
    location: store.location,
    actions: (
      <div className="flex gap-3">
        <button onClick={() => handleEdit(store)} className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
        <button onClick={() => handleDelete(store)} className="text-red-600 hover:text-red-700 text-sm">Delete</button>
      </div>
    )
  }));

  return (
    <DashboardLayout title="Manage Stores 🏪">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Stores</h2>
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
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-2xl mb-8">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input 
                className="input-field" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                required 
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Location</label>
              <input 
                className="input-field" 
                value={form.location} 
                onChange={e => setForm({...form, location: e.target.value})} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary mt-6">
              {editingStore ? 'Update Store' : 'Create Store'}
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading stores...</p>
        ) : stores.length === 0 ? (
          <EmptyState 
            title="No stores yet" 
            message="Create your first store to get started" 
            icon="🏪" 
          />
        ) : (
          <Table columns={columns} data={tableData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MerchantStores;