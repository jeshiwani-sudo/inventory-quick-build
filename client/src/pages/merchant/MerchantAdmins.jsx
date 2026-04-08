import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const MerchantAdmins = () => {
  const [email, setEmail] = useState('');
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [stores, setStores] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [actionId, setActionId] = useState(null); // For loading states on buttons

  useEffect(() => {
    fetchAdmins();
    fetchStores();
  }, []);

  // FIXED: Only fetch Admins
  const fetchAdmins = async () => {
    setFetching(true);
    try {
      const res = await api.get('/auth/users?role=admin');
      setAdmins(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load admins');
    } finally {
      setFetching(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores/');
      setStores(res.data.stores || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    if (!storeId) return toast.error('Please select a store');

    setLoading(true);
    try {
      await api.post('/auth/invite', {
        email,
        role: 'admin',
        store_id: parseInt(storeId)
      });
      toast.success(`Invite sent to ${email} ✅`);
      setEmail('');
      setStoreId('');
      fetchAdmins(); // Refresh list
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (admin) => {
    const newStatus = !admin.is_active;
    if (!window.confirm(
      newStatus 
        ? `Activate ${admin.full_name}?` 
        : `Suspend ${admin.full_name}? They won't be able to login.`
    )) return;

    setActionId(admin.id);
    try {
      await api.patch(`/auth/users/${admin.id}/toggle-active`);
      toast.success(`${admin.full_name} has been ${newStatus ? 'activated' : 'suspended'}`);
      // Optimistic update
      setAdmins(prev => prev.map(a => 
        a.id === admin.id ? { ...a, is_active: newStatus } : a
      ));
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Permanently remove ${admin.full_name}? This action cannot be undone.`)) return;

    setActionId(admin.id);
    try {
      await api.delete(`/auth/users/${admin.id}`);
      toast.success(`${admin.full_name} has been removed`);
      setAdmins(prev => prev.filter(a => a.id !== admin.id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete admin');
    } finally {
      setActionId(null);
    }
  };

  const getStoreName = (store_id) => {
    const store = stores.find(s => s.id === store_id);
    return store ? store.name : 'No store assigned';
  };

  return (
    <DashboardLayout title="Manage Admins 👔">
      {/* Invite Form */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Invite New Admin</h2>
        <form onSubmit={handleInviteAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              className="input-field"
              placeholder="admin@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Store *</label>
            <select
              className="input-field"
              value={storeId}
              onChange={e => setStoreId(e.target.value)}
              required
            >
              <option value="">Select Store</option>
              {stores.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>

      {/* Admins List */}
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">All Admins</h2>
          <span className="text-sm text-gray-500">{admins.length} Admin{admins.length !== 1 ? 's' : ''}</span>
        </div>

        {fetching ? (
          <p className="text-center py-10 text-gray-400">Loading admins...</p>
        ) : admins.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-4">👔</p>
            <p>No admins yet. Send an invitation above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Phone</th>
                  <th className="text-left py-3 px-4">Store</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium">{admin.full_name || '—'}</td>
                    <td className="py-4 px-4 text-gray-600">{admin.email}</td>
                    <td className="py-4 px-4 text-gray-600">{admin.phone_number || '—'}</td>
                    <td className="py-4 px-4 text-gray-600">{getStoreName(admin.store_id)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        admin.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {admin.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleToggleActive(admin)}
                          disabled={actionId === admin.id}
                          className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors ${
                            admin.is_active 
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {actionId === admin.id 
                            ? 'Updating...' 
                            : admin.is_active ? 'Suspend' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleDelete(admin)}
                          disabled={actionId === admin.id}
                          className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                          {actionId === admin.id ? 'Removing...' : 'Delete'}
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
    </DashboardLayout>
  );
};

export default MerchantAdmins;