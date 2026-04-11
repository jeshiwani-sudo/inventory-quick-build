import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

const MerchantAdmins = () => {
  const [email, setEmail] = useState('');
  const [storeId, setStoreId] = useState('');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [stores, setStores] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchAdmins();
    fetchStores();
  }, []);

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
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (admin) => {
    const newStatus = !admin.is_active;
    if (!window.confirm(newStatus ? `Activate ${admin.full_name}?` : `Suspend ${admin.full_name}?`)) return;

    setActionId(admin.id);
    try {
      await api.patch(`/auth/users/${admin.id}/toggle-active`);
      toast.success(`${admin.full_name} has been ${newStatus ? 'activated' : 'suspended'}`);
      setAdmins(prev => prev.map(a => a.id === admin.id ? { ...a, is_active: newStatus } : a));
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (admin) => {
    if (!window.confirm(`Permanently remove ${admin.full_name}?`)) return;

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

  const columns = [
    { header: 'Name', accessor: 'full_name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone_number' },
    { header: 'Store', accessor: 'store' },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const tableData = admins.map(admin => ({
    full_name: admin.full_name || '—',
    email: admin.email,
    phone_number: admin.phone_number || '—',
    store: stores.find(s => s.id === admin.store_id)?.name || 'No store',
    status: (
      <span className={`px-3 py-1 text-xs rounded-full ${admin.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {admin.is_active ? 'Active' : 'Suspended'}
      </span>
    ),
    actions: (
      <div className="flex gap-3">
        <button onClick={() => handleToggleActive(admin)} className="text-blue-600 hover:text-blue-700 text-sm">
          {admin.is_active ? 'Suspend' : 'Activate'}
        </button>
        <button onClick={() => handleDelete(admin)} className="text-red-600 hover:text-red-700 text-sm">
          Delete
        </button>
      </div>
    ),
  }));

  return (
    <DashboardLayout title="Manage Admins 👔">
      <div className="card mb-8">
        <h2 className="text-lg font-semibold mb-4">Invite New Admin</h2>
        <form onSubmit={handleInviteAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Store *</label>
            <select className="input-field" value={storeId} onChange={e => setStoreId(e.target.value)} required>
              <option value="">Select Store</option>
              {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-1 flex items-end">
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold">All Admins</h2>
          <span className="text-sm text-gray-500">{admins.length} Admin{admins.length !== 1 ? 's' : ''}</span>
        </div>

        {fetching ? (
          <p className="text-center py-10 text-gray-400">Loading admins...</p>
        ) : admins.length === 0 ? (
          <EmptyState title="No admins yet" message="Send an invitation above to get started" icon="👔" />
        ) : (
          <Table columns={columns} data={tableData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default MerchantAdmins;