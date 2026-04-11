import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import StatCard from '../../components/common/StatCard';
import Chart from '../../components/common/Chart';

const MerchantDashboard = () => {
  const [summary, setSummary] = useState({});
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchSummary();
    fetchTrend();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/inventory/report/summary');
      setSummary(res.data.summary || {});
    } catch (err) {
      toast.error('Failed to load summary');
    }
  };

  const fetchTrend = async () => {
    try {
      const res = await api.get('/inventory/report/trend');
      const cleaned = (res.data.trend || []).map(item => ({
        ...item,
        quantity_received: Number(item.quantity_received || item.received || 0),
        quantity_in_stock: Number(item.quantity_in_stock || item.inStock || 0),
      }));
      setTrendData(cleaned);
    } catch (err) {
      toast.error('Failed to load trend data');
      console.error(err);
    }
  };

  return (
    <DashboardLayout title="Merchant Dashboard 📊">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Received" value={summary.total_items_received || 0} icon="📥" color="bg-blue-500" />
        <StatCard title="In Stock" value={summary.total_items_in_stock || 0} icon="📦" color="bg-green-500" />
        <StatCard title="Spoilt" value={summary.total_items_spoilt || 0} icon="⚠️" color="bg-red-500" />
        <StatCard title="Unpaid (KES)" value={`KES ${(summary.total_unpaid_amount || 0).toLocaleString()}`} icon="💰" color="bg-orange-500" />
      </div>

      {/* Combined charts  */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Chart
          title="Store Performance"
          data={trendData}
          dataKey1="quantity_received"
          dataKey2="quantity_in_stock"
          name1="Received"
          name2="In Stock"
          color1="#4F46E5"
          color2="#10B981"
          type="bar"
          xDataKey="product_name"
        />

        <Chart
          title="Trend Over Time"
          data={trendData}
          dataKey1="quantity_received"
          dataKey2="quantity_in_stock"
          name1="Received"
          name2="In Stock"
          color1="#4F46E5"
          color2="#10B981"
          type="line"
          xDataKey="product_name"
        />
      </div>
    </DashboardLayout>
  );
};

export default MerchantDashboard;