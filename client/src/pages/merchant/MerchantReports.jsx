import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const MerchantReports = () => {
  return (
    <DashboardLayout title="Reports 📈">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Overall Performance</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-400">Overall Report Chart (Coming Soon)</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Store-wise Performance</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-gray-400">Store Comparison Chart (Coming Soon)</p>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold mb-4">Download Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-secondary py-4">Weekly Report</button>
          <button className="btn-secondary py-4">Monthly Report</button>
          <button className="btn-secondary py-4">Annual Report</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MerchantReports;