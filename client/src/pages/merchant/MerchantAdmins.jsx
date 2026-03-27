import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const MerchantAdmins = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInviteAdmin = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    setLoading(true);
    try {
      await api.post('/auth/invite', {
        email,
        role: 'admin'
      });
      toast.success(`Invite sent to ${email}`);
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Manage Admins 👔">
      <div className="card max-w-lg">
        <h2 className="text-lg font-semibold mb-4">Invite New Admin</h2>
        <form onSubmit={handleInviteAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email Address
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3"
          >
            {loading ? 'Sending Invite...' : 'Send Invite'}
          </button>
        </form>
      </div>

      <p className="text-gray-500 mt-6 text-sm">
        Admins will receive an email with a registration link.
      </p>
    </DashboardLayout>
  );
};

export default MerchantAdmins;