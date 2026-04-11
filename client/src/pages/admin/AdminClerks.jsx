import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useSelector } from 'react-redux';
import Table from '../../components/common/Table';

const AdminClerks = () => {
  const [clerks, setClerks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const { user } = useSelector(state => state.auth);

  const fetchClerks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/auth/users?role=clerk&store_id=${user?.store_id}`);
      setClerks(res.data.users || []);
    } catch {
      toast.error('Failed to load clerks');
    } finally {
      setLoading(false);
    }
  }, [user?.store_id]);

  useEffect(() => {
    fetchClerks();
  }, [fetchClerks]);

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

  const columns = [
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone_number' },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const tableData = clerks.map(clerk => ({
    full_name: clerk.full_name,
    email: clerk.email,
    phone_number: clerk.phone_number || '—',
    status: (
      <span className={`px-3 py-1 text-xs rounded-full ${clerk.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {clerk.is_active ? 'Active' : 'Suspended'}
      </span>
    ),
    actions: (
      <div className="flex gap-3">
        <button onClick={() => toggleActive(clerk)} className="text-blue-600 hover:text-blue-700 text-sm">
          {clerk.is_active ? 'Suspend' : 'Activate'}
        </button>
        <button
          onClick={() => handleDelete(clerk)}
          disabled={deletingId === clerk.id}
          className="text-red-600 hover:text-red-700 text-sm"
        >
          {deletingId === clerk.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    ),
  }));

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

        <Table columns={columns} data={tableData} loading={loading} />
      </div>
    </DashboardLayout>
  );
};

export default AdminClerks;