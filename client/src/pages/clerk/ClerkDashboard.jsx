import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEntries, fetchSummary } from '../../store/slices/inventorySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';

const ClerkDashboard = () => {
  const dispatch = useDispatch();
  const { entries, summary, loading, pages, currentPage } = useSelector(
    (state) => state.inventory
  );
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchEntries({ page: 1 }));
    dispatch(fetchSummary());
  }, [dispatch]);

  const handlePageChange = (page) => {
    dispatch(fetchEntries({ page }));
  };

  return (
    <DashboardLayout title={`Welcome back, ${user?.full_name} 👋`}>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Items Received"
          value={summary?.total_items_received || 0}
          icon="📥"
          color="bg-blue-500"
        />
        <StatCard
          title="Items In Stock"
          value={summary?.total_items_in_stock || 0}
          icon="📦"
          color="bg-green-500"
        />
        <StatCard
          title="Items Spoilt"
          value={summary?.total_items_spoilt || 0}
          icon="🗑️"
          color="bg-red-500"
        />
        <StatCard
          title="My Entries"
          value={summary?.total_entries || 0}
          icon="📋"
          color="bg-purple-500"
        />
      </div>

      {/* Recent Entries Table */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          My Recent Entries
        </h2>

        {loading ? (
          <LoadingSpinner />
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>No entries yet. Start recording inventory!</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Product</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Received</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">In Stock</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Spoilt</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Buy Price</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Sell Price</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Payment</th>
                    <th className="text-left py-3 px-4 text-gray-500 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {entry.product_name}
                      </td>
                      <td className="py-3 px-4">{entry.quantity_received}</td>
                      <td className="py-3 px-4">{entry.quantity_in_stock}</td>
                      <td className="py-3 px-4 text-red-500">{entry.quantity_spoilt}</td>
                      <td className="py-3 px-4">KES {entry.buying_price}</td>
                      <td className="py-3 px-4">KES {entry.selling_price}</td>
                      <td className="py-3 px-4">
                        <span className={entry.payment_status === 'paid' ? 'badge-paid' : 'badge-unpaid'}>
                          {entry.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{entry.recorded_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalPages={pages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ClerkDashboard;