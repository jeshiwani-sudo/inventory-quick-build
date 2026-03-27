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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = `/supply-requests/?page=${page}&per_page=10`;
      if (filter) url += `&status=${filter}`;
      const res = await api.get(url);
      setRequests(res.data.requests);
      setTotalPages(res.data.pages);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id, status) => {
    try {
      await api.patch(`/supply-requests/${id}/respond`, { status });
      toast.success(`Request ${status} ✅`);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed');
    }
  };

  const statusBadge = (status) => {
    if (status === 'approved') return 'badge-approved';
    if (status === 'declined') return 'badge-declined';
    return 'badge-pending';
  };

  return (
    <DashboardLayout title="Supply Requests 🚚">
      <div className="card">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-800">All Supply Requests</h2>
          <select
            className="input-field w-48"
            value={filter}
            onChange={e => { setFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </select>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">🚚</p>
            <p>No supply requests found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Clerk</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Qty Requested</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Note</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{r.product_name}</td>
                      <td className="py-3 px-4 text-gray-500">{r.clerk_name}</td>
                      <td className="py-3 px-4">{r.quantity_requested}</td>
                      <td className="py-3 px-4 text-gray-400">{r.note || '—'}</td>
                      <td className="py-3 px-4">
                        <span className={statusBadge(r.status)}>{r.status}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{r.created_at}</td>
                      <td className="py-3 px-4">
                        {r.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => respond(r.id, 'approved')}
                              className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg hover:bg-green-200 font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => respond(r.id, 'declined')}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg hover:bg-red-200 font-medium"
                            >
                              Decline
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40">← Prev</button>
                <span className="px-3 py-1 text-sm">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSupplyRequests;