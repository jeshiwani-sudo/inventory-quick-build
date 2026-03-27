import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSummary } from '../../store/slices/inventorySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/common/StatCard';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import api from '../../utils/api';

const MerchantDashboard = () => {
  const dispatch = useDispatch();
  const { summary } = useSelector((state) => state.inventory);
  
  const [stores, setStores] = useState([]);
  const [storeReports, setStoreReports] = useState([]);

  useEffect(() => {
    dispatch(fetchSummary());
    loadStores();
  }, [dispatch]);

  const loadStores = async () => {
    try {
      const res = await api.get('/stores/');
      setStores(res.data.stores);

      // Load report for each store
      const reports = await Promise.all(
        res.data.stores.map(async (store) => {
          const r = await api.get(`/inventory/report/summary?store_id=${store.id}`);
          return {
            name: store.name,
            ...r.data.summary
          };
        })
      );
      setStoreReports(reports);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <DashboardLayout title={`Merchant Overview 👑`}>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Stores"
          value={stores.length}
          icon="🏪"
          color="bg-purple-500"
        />
        <StatCard
          title="Total Items in Stock"
          value={summary?.total_items_in_stock || 0}
          icon="📦"
          color="bg-blue-500"
        />
        <StatCard
          title="Total Paid"
          value={`KES ${summary?.total_paid_amount || 0}`}
          icon="✅"
          color="bg-green-500"
        />
        <StatCard
          title="Total Unpaid"
          value={`KES ${summary?.total_unpaid_amount || 0}`}
          icon="⏳"
          color="bg-red-500"
        />
      </div>

      {/* Store by Store Report */}
      {storeReports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Bar Chart - Store Comparison */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Store Stock Comparison
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={storeReports}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_items_in_stock" fill="#4F46E5" name="In Stock" radius={[4,4,0,0]} />
                <Bar dataKey="total_items_spoilt" fill="#EF4444" name="Spoilt" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart - Payment Status */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Payment Status per Store
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={storeReports}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total_paid_amount" stroke="#10B981" strokeWidth={2} name="Paid (KES)" dot={{ r: 5 }} />
                <Line type="monotone" dataKey="total_unpaid_amount" stroke="#EF4444" strokeWidth={2} name="Unpaid (KES)" dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      )}

      {/* Stores List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">All Stores</h2>
        {stores.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">🏪</p>
            <p>No stores yet. Create your first store!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              <div key={store.id} className="border border-gray-200 rounded-xl p-4 hover:border-primary transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🏪</span>
                  <div>
                    <p className="font-semibold text-gray-800">{store.name}</p>
                    <p className="text-sm text-gray-400">{store.location}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${store.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </DashboardLayout>
  );
};

export default MerchantDashboard;