import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AdminSupplyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchRequests();
  }, [page, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = `/supply-requests/?page=${page}&per_page=10`;
      if (filter) url += `&status=${filter}`;
      const res = await api.get(url);
      setRequests(res.data.requests || []);
      setTotalPages(res.data.pages || 1);
    } catch {
      toast.error('Failed to load supply requests');
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id, status) => {
    const action = status === 'approved' ? 'approve' : 'decline';
    if (!window.confirm(`Are you sure you want to ${action} this request?`)) return;

    try {
      await api.patch(`/supply-requests/${id}/respond`, { status });
      toast.success(`Request ${status} successfully ✅`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update request');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
    if (status === 'declined') return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
  };

  return (
    <DashboardLayout title="Supply Requests 🚚">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">All Supply Requests</h2>
          
          <select
            className="input-field w-full sm:w-52"
            value={filter}
            onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">Loading supply requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-16 text-gray-400 dark:text-gray-500">
            <p className="text-5xl mb-4">🚚</p>
            <p className="text-lg">No supply requests found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[850px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Product</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Clerk</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Qty Requested</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Note</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="text-left py-4 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-4 px-4 font-medium text-gray-800 dark:text-white">{r.product_name}</td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-300">{r.clerk_name}</td>
                      <td className="py-4 px-4 font-medium">{r.quantity_requested}</td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">{r.note || '—'}</td>
                      <td className="py-4 px-4">
                        <span className={`px-4 py-1 text-xs font-medium rounded-full ${getStatusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 dark:text-gray-500 text-xs">{r.created_at}</td>
                      <td className="py-4 px-4">
                        {r.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => respond(r.id, 'approved')}
                              className="text-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 px-4 py-1.5 rounded-lg font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => respond(r.id, 'declined')}
                              className="text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 px-4 py-1.5 rounded-lg font-medium transition-colors"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500 text-xs">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSupplyRequests;