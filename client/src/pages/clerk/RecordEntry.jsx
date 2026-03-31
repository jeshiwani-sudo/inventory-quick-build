import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const RecordEntry = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      quantity_spoilt: 0,
      payment_status: 'unpaid'
    }
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data.products || []);
      } catch {
        toast.error('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await api.post('/inventory/', {
        product_id: parseInt(data.product_id),
        quantity_received: parseInt(data.quantity_received),
        quantity_in_stock: parseInt(data.quantity_in_stock),
        quantity_spoilt: parseInt(data.quantity_spoilt || 0),
        buying_price: parseFloat(data.buying_price),
        selling_price: parseFloat(data.selling_price),
        payment_status: data.payment_status
      });

      toast.success('Entry recorded successfully ✅');
      reset();
      navigate('/clerk/my-entries');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record entry');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Record New Entry 📝">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product *
              </label>
              <select
                className="input-field"
                {...register('product_id', { required: 'Please select a product' })}
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.product_id && (
                <p className="text-red-500 text-sm mt-1">{errors.product_id.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qty Received *
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  {...register('quantity_received', { required: 'Required', min: 1 })}
                />
                {errors.quantity_received && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity_received.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qty In Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  {...register('quantity_in_stock', { required: 'Required' })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Qty Spoilt
                </label>
                <input
                  type="number"
                  min="0"
                  defaultValue={0}
                  className="input-field"
                  {...register('quantity_spoilt')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Buying Price (KES) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  {...register('buying_price', { required: 'Required', min: 0 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selling Price (KES) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  {...register('selling_price', { required: 'Required', min: 0 })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Payment Status
              </label>
              <select
                className="input-field"
                {...register('payment_status')}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary disabled:opacity-50 flex-1 py-3 text-base font-medium"
              >
                {submitting ? 'Recording Entry...' : 'Record Entry ✅'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/clerk/dashboard')}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RecordEntry;