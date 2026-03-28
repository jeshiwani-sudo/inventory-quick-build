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
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchClerks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClerks = async () => {
    setFetching(true);
    try {
      const res = await api.get('/auth/users');
      setClerks(res.data.users || []);
    } catch {
      toast.error('Failed to load clerks');
    } finally {
      setFetching(false);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/invite', {
        email: inviteEmail,
        role: 'clerk',
        store_id: user?.store_id
      });
      toast.success(`Invite sent to ${inviteEmail} ✅`);
      setInviteEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (clerk) => {
    if (!window.confirm(`Remove ${clerk.full_name} as clerk? This cannot be undone.`)) return;
    setDeletingId(clerk.id);
    try {
      await api.delete(`/auth/users/${clerk.id}`);
      toast.success(`${clerk.full_name} has been removed ✅`);
      setClerks(prev => prev.filter(c => c.id !== clerk.id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to remove clerk');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout title="Clerks 📝">

      {/* Invite form — always visible, no toggle button */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4">Invite New Clerk</h2>
        <form onSubmit={sendInvite} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            className="btn-primary whitespace-nowrap disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Invite 📧'}
          </button>
        </form>
      </div>

      {/* Clerks list */}
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">All Clerks</h2>
          <span className="text-sm text-gray-400">{clerks.length} clerk{clerks.length !== 1 ? 's' : ''} in your store</span>
        </div>

        {fetching ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : clerks.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <p className="text-4xl mb-3">📝</p>
            <p>No clerks in your store yet. Invite one above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Name</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Email</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clerks.map(clerk => (
                  <tr key={clerk.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">
                          {clerk.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        {clerk.full_name || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{clerk.email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        clerk.is_verified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {clerk.is_verified ? 'Active' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{clerk.created_at}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDelete(clerk)}
                        disabled={deletingId === clerk.id}
                        className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingId === clerk.id ? 'Removing...' : 'Remove'}
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
          <strong>💡 Note:</strong> Removing a clerk is permanent. Their inventory entries and supply requests will be preserved but they will no longer be able to log in.
        </p>
      </div>

    </DashboardLayout>
  );
};

export default AdminClerks;