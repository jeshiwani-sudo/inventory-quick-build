import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import Table from '../../components/common/Table';
import EmptyState from '../../components/common/EmptyState';

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

  const columns = [
    { header: 'Product', accessor: 'product_name' },
    { header: 'Quantity', accessor: 'quantity_requested' },
    { header: 'Note', accessor: 'note' },
    { header: 'Status', accessor: 'status' },
    { header: 'Actions', accessor: 'actions' },
  ];

  const tableData = requests.map(r => ({
    product_name: r.product_name,
    quantity_requested: r.quantity_requested,
    note: r.note || '—',
    status: (
      <span className={`px-3 py-1 text-xs rounded-full ${
        r.status === 'approved' ? 'bg-green-100 text-green-700' : 
        r.status === 'declined' ? 'bg-red-100 text-red-700' : 
        'bg-yellow-100 text-yellow-700'
      }`}>
        {r.status}
      </span>
    ),
    actions: r.status === 'pending' ? (
      <div className="flex gap-2">
        <button onClick={() => respond(r.id, 'approved')} className="text-green-600 hover:text-green-700 text-sm">Approve</button>
        <button onClick={() => respond(r.id, 'declined')} className="text-red-600 hover:text-red-700 text-sm">Decline</button>
      </div>
    ) : (
      <span className="text-gray-400 text-xs">Done</span>
    )
  }));

  return (
    <DashboardLayout title="Supply Requests 🚚">
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Supply Requests</h2>

        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading requests...</p>
        ) : requests.length === 0 ? (
          <EmptyState title="No supply requests" message="All supply requests will appear here" icon="🚚" />
        ) : (
          <Table columns={columns} data={tableData} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSupplyRequests;