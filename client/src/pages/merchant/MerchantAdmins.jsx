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
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAdmins();
    fetchStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAdmins = async () => {
    setFetching(true);
    try {
      const res = await api.get('/auth/users');
      setAdmins(res.data.users || []);
    } catch {
      toast.error('Failed to load admins');
    } finally {
      setFetching(false);
    }
  };

  const fetchStores = async () => {
    try {
      const res = await api.get('/stores/');
      setStores(res.data.stores || []);
    } catch {}
  };

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Email is required');
    setLoading(true);
    try {
      await api.post('/auth/invite', {
        email,
        role: 'admin',
        store_id: storeId ? parseInt(storeId) : null
      });
      toast.success(`Invite sent to ${email} ✅`);
      setEmail('');
      setStoreId('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Remove ${admin.full_name} as admin? This cannot be undone.`)) return;
    setDeletingId(admin.id);
    try {
      await api.delete(`/auth/users/${admin.id}`);
      toast.success(`${admin.full_name} has been removed ✅`);
      setAdmins(prev => prev.filter(a => a.id !== admin.id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove admin');
    } finally {
      setDeletingId(null);
    }
  };

  const getStoreName = (store_id) => {
    const store = stores.find(s => s.id === store_id);
    return store ? store.name : 'No store assigned';
  };

  return (
    <DashboardLayout title="Manage Admins 👔">

      {/* Invite form — always visible, no toggle button */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Invite New Admin</h2>
        <form onSubmit={handleInviteAdmin} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin Email Address *
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assign to Store
              </label>
              <select
                className="input-field"
                value={storeId}
                onChange={e => setStoreId(e.target.value)}
              >
                <option value="">Select a store (optional)</option>
                {stores.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50"
          >
            {loading ? 'Sending Invite...' : 'Send Invite 📧'}
          </button>
        </form>
      </div>

      {/* Admins list */}
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">All Admins</h2>
          <span className="text-sm text-gray-400">{admins.length} admin{admins.length !== 1 ? 's' : ''} total</span>
        </div>

        {fetching ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : admins.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <p className="text-4xl mb-3">👔</p>
            <p>No admins yet. Invite one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Store</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(admin => (
                  <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold">
                          {admin.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        {admin.full_name || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{admin.email}</td>
                    <td className="py-3 px-4 text-gray-500">{getStoreName(admin.store_id)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        admin.is_verified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {admin.is_verified ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{admin.created_at}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(admin)}
                        disabled={deletingId === admin.id}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingId === admin.id ? 'Removing...' : 'Remove'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>💡 Note:</strong> Removing an admin is permanent. Their records will be preserved but they will no longer be able to log in.
        </p>
      </div>

    </DashboardLayout>
  );
};

export default MerchantAdmins;