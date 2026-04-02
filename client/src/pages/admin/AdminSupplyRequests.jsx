/**
 * Feature: Supply Requests (Admin)
 * Branch: feature/admin-supply-requests
 * Changes for new store_products junction table: supply requests now use store_product_id
 */

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const AdminSupplyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/supply-requests/');
      setRequests(res.data.requests || []);
    } catch {
      toast.error('Failed to load supply requests');
    } finally {
      setLoading(false);
    }
  };

  const respond = async (id, status) => {
    if (!window.confirm(`Mark this request as ${status}?`)) return;

    try {
      await api.patch(`/supply-requests/${id}/respond`, { status });
      toast.success(`Request marked as ${status}`);
      fetchRequests();
    } catch {
      toast.error('Failed to update request');
    }
  };

  return (
    <DashboardLayout title="Supply Requests 🚚">
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Supply Requests</h2>

        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading requests...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4">Product</th>
                <th className="text-left py-4">Quantity</th>
                <th className="text-left py-4">Note</th>
                <th className="text-left py-4">Status</th>
                <th className="text-left py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 font-medium">{r.product_name}</td>
                  <td className="py-4">{r.quantity_requested}</td>
                  <td className="py-4 text-gray-600">{r.note || '—'}</td>
                  <td className="py-4">
                    <span className={`px-3 py-1 text-xs rounded-full ${r.status === 'approved' ? 'bg-green-100 text-green-700' : r.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-4">
                    {r.status === 'pending' && (
                      <>
                        <button onClick={() => respond(r.id, 'approved')} className="text-green-600 hover:text-green-700 mr-3">Approve</button>
                        <button onClick={() => respond(r.id, 'declined')} className="text-red-600 hover:text-red-700">Decline</button>
                      </>
                    )}
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

export default AdminSupplyRequests;
