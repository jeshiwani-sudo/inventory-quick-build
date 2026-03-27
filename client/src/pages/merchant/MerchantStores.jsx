import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const MerchantStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreLocation, setNewStoreLocation] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores/');
      setStores(res.data.stores || []);
    } catch (err) {
      toast.error('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!newStoreName) return toast.error('Store name is required');

    try {
      await api.post('/stores/', {
        name: newStoreName,
        location: newStoreLocation
      });
      toast.success('Store created successfully');
      setNewStoreName('');
      setNewStoreLocation('');
      fetchStores();
    } catch (err) {
      toast.error('Failed to create store');
    }
  };

  return (
    <DashboardLayout title="Stores 🏪">
      {/* Create New Store Form */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Create New Store</h2>
        <form onSubmit={handleCreateStore} className="flex gap-4">
          <input
            type="text"
            placeholder="Store Name"
            className="input-field flex-1"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Location (Optional)"
            className="input-field flex-1"
            value={newStoreLocation}
            onChange={(e) => setNewStoreLocation(e.target.value)}
          />
          <button type="submit" className="btn-primary px-6">
            Create Store
          </button>
        </form>
      </div>

      {/* Stores List */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">All Stores</h2>
        {loading ? (
          <p>Loading stores...</p>
        ) : stores.length === 0 ? (
          <p className="text-gray-500">No stores yet. Create your first store above.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="border border-gray-200 rounded-xl p-6 hover:border-primary transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🏪</span>
                  <div>
                    <h3 className="font-semibold text-lg">{store.name}</h3>
                    <p className="text-gray-500">{store.location || 'No location'}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${store.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MerchantStores;