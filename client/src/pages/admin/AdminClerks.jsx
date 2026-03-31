import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useSelector } from 'react-redux';

const AdminClerks = () => {
  const [clerks, setClerks] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchClerks();
  }, []);

  const fetchClerks = async () => {
    setFetching(true);
    try {
      const res = await api.get('/auth/users?role=clerk');
      setClerks(res.data.users || []);
    } catch {
      toast.error('Failed to load clerks');
    } finally {
      setFetching(false);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error('Email is required');

    setLoading(true);
    try {
      await api.post('/auth/invite', {
        email: inviteEmail,
        role: 'clerk',
        store_id: user?.store_id
      });
      toast.success(`Invite sent to ${inviteEmail} ✅`);
      setInviteEmail('');
      fetchClerks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (clerk) => {
    const newStatus = !clerk.is_active;
    if (!window.confirm(
      newStatus 
        ? `Activate ${clerk.full_name}?` 
        : `Suspend ${clerk.full_name}? They will no longer be able to log in.`
    )) return;

    setActionId(clerk.id);
    try {
      await api.patch(`/auth/users/${clerk.id}/toggle-active`);
      toast.success(`${clerk.full_name} has been ${newStatus ? 'activated' : 'suspended'}`);
      setClerks(prev => prev.map(c => 
        c.id === clerk.id ? { ...c, is_active: newStatus } : c
      ));
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (clerk) => {
    if (!window.confirm(`Permanently remove ${clerk.full_name}? This cannot be undone.`)) return;

    setActionId(clerk.id);
    try {
      await api.delete(`/auth/users/${clerk.id}`);
      toast.success(`${clerk.full_name} has been removed ✅`);
      setClerks(prev => prev.filter(c => c.id !== clerk.id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove clerk');
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout title="Manage Clerks 📝">
      <div className="space-y-8">
        {/* Invite Form */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-5 text-gray-800 dark:text-white">Invite New Clerk</h2>
          <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clerk's Email Address *
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="clerk@example.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary whitespace-nowrap disabled:opacity-50 px-8"
            >
              {loading ? 'Sending...' : 'Send Invite 📧'}
            </button>
          </form>
        </div>

        {/* Clerks List */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">All Clerks</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {clerks.length} clerk{clerks.length !== 1 ? 's' : ''} in your store
            </span>
          </div>

          {fetching ? (
            <div className="text-center py-16 text-gray-400">Loading clerks...</div>
          ) : clerks.length === 0 ? (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500">
              <p className="text-5xl mb-4">📝</p>
              <p className="text-lg">No clerks yet. Invite one above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Phone</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Joined</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clerks.map(clerk => (
                    <tr key={clerk.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center text-sm font-bold">
                            {clerk.full_name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">{clerk.full_name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{clerk.email}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{clerk.phone_number || '—'}</td>
                      <td className="py-4 px-4">
                        <span className={`px-4 py-1 text-xs font-medium rounded-full ${
                          clerk.is_active 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {clerk.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 dark:text-gray-500 text-xs">{clerk.created_at}</td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleActive(clerk)}
                            disabled={actionId === clerk.id}
                            className={`text-xs px-4 py-1.5 rounded-lg font-medium transition-colors ${
                              clerk.is_active 
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300'
                            }`}
                          >
                            {actionId === clerk.id 
                              ? 'Updating...' 
                              : clerk.is_active ? 'Suspend' : 'Activate'}
                          </button>

                          <button
                            onClick={() => handleDelete(clerk)}
                            disabled={actionId === clerk.id}
                            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                          >
                            {actionId === clerk.id ? 'Removing...' : 'Delete'}
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

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 text-sm text-blue-700 dark:text-blue-300">
          <strong>💡 Note:</strong> Suspending a clerk prevents them from logging in. Deleting is permanent but their records are preserved.
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminClerks;