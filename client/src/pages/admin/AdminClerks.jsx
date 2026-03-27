import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useSelector } from 'react-redux';

const AdminClerks = () => {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const { user } = useSelector(state => state.auth);

  const sendInvite = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/invite', {
        email: inviteEmail,
        role: 'clerk',
        store_id: user?.store_id
      });
      toast.success(`Invite sent to ${inviteEmail} ✅`);
      setInviteEmail('');
      setShowInvite(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send invite');
    }
  };

  return (
    <DashboardLayout title="Clerks 📝">
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">Manage Clerks</h2>
          <button className="btn-primary" onClick={() => setShowInvite(!showInvite)}>
            {showInvite ? 'Cancel' : '+ Invite Clerk'}
          </button>
        </div>

        {showInvite && (
          <form onSubmit={sendInvite} className="bg-gray-50 rounded-xl p-5 mb-6 flex gap-3 items-end">
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
            <button type="submit" className="btn-primary whitespace-nowrap">
              Send Invite 📧
            </button>
          </form>
        )}

        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">📝</p>
          <p className="text-lg font-medium text-gray-500 mb-2">Clerk Management</p>
          <p className="text-sm max-w-sm mx-auto">
            Use the <strong>"Invite Clerk"</strong> button above to send email invites to clerks.
            Once they register via the invite link, they will appear here.
          </p>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto text-left">
            <p className="text-sm font-medium text-blue-800 mb-1">💡 How it works:</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Click "Invite Clerk" and enter their email</li>
              <li>They receive an email with a registration link</li>
              <li>They click the link and set their password</li>
              <li>They can now log in as a clerk</li>
            </ol>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminClerks;