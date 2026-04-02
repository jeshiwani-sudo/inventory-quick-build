import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useSelector } from 'react-redux';

const AdminClerks = () => {
  const [clerks, setClerks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchClerks();
  }, []);

  const fetchClerks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users?role=clerk');
      setClerks(res.data.users || []);
    } catch {
      toast.error('Failed to load clerks');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return toast.error('Email is required');

    try {
      await api.post('/auth/invite', {
        email: inviteEmail,
        role: 'clerk',
        store_id: user?.store_id
      });
      toast.success(`Invite sent to ${inviteEmail}`);
      setInviteEmail('');
      fetchClerks();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    }
  };

  const toggleActive = async (clerk) => {
    try {
      await api.patch(`/auth/users/${clerk.id}/toggle-active`);
      toast.success(clerk.is_active ? 'Clerk suspended' : 'Clerk activated');
      fetchClerks();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (clerk) => {
    if (!window.confirm(`Delete clerk "${clerk.full_name}"?`)) return;

    setDeletingId(clerk.id);
    try {
      await api.delete(`/auth/users/${clerk.id}`);
      toast.success('Clerk deleted successfully');
      fetchClerks();
    } catch (err) {
      toast.error('Failed to delete clerk');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout title="Manage Clerks 👥">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">All Clerks</h2>
          <form onSubmit={sendInvite} className="flex gap-3">
            <input
              type="email"
              placeholder="Clerk email"
              className="input-field w-72"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary">Send Invite</button>
          </form>
        </div>

        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading clerks...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">Name</th>
                <th className="text-left py-4">Email</th>
                <th className="text-left py-4">Phone</th>
                <th className="text-left py-4">Status</th>
                <th className="text-left py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clerks.map(clerk => (
                <tr key={clerk.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 font-medium">{clerk.full_name}</td>
                  <td className="py-4 text-gray-600">{clerk.email}</td>
                  <td className="py-4 text-gray-600">{clerk.phone_number || '—'}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${clerk.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {clerk.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-4">
                    <button onClick={() => toggleActive(clerk)} className="text-blue-600 hover:text-blue-700 mr-4">
                      {clerk.is_active ? 'Suspend' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(clerk)}
                      className="text-red-600 hover:text-red-700"
                      disabled={deletingId === clerk.id}
                    >
                      {deletingId === clerk.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminClerks;
