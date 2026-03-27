import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createEntry } from '../../store/slices/inventorySlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const RecordEntry = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/');
        setProducts(res.data.products);
      } catch {
        toast.error('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    const result = await dispatch(createEntry({
      ...data,
      product_id: parseInt(data.product_id),
      quantity_received: parseInt(data.quantity_received),
      quantity_in_stock: parseInt(data.quantity_in_stock),
      quantity_spoilt: parseInt(data.quantity_spoilt),
      buying_price: parseFloat(data.buying_price),
      selling_price: parseFloat(data.selling_price),
    }));

    if (createEntry.fulfilled.match(result)) {
      toast.success('Entry recorded successfully ✅');
      navigate('/clerk/my-entries');
    } else {
      toast.error(result.payload || 'Failed to record entry');
    }
    setLoading(false);
  };

  return (
    <DashboardLayout title="Record New Entry 📝">
      <div className="max-w-2xl">
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product *
              </label>
              <select
                className="input-field"
                {...register('product_id', { required: 'Please select a product' })}
              >
                <option value="">Select a product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.product_id && (
                <p className="text-red-500 text-sm mt-1">{errors.product_id.message}</p>
              )}
            </div>

            {/* Quantities */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qty Received *
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  {...register('quantity_received', { required: 'Required' })}
                />
                {errors.quantity_received && (
                  <p className="text-red-500 text-sm mt-1">{errors.quantity_received.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buying Price (KES) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  {...register('buying_price', { required: 'Required' })}
                />
                {errors.buying_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.buying_price.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (KES) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input-field"
                  {...register('selling_price', { required: 'Required' })}
                />
                {errors.selling_price && (
                  <p className="text-red-500 text-sm mt-1">{errors.selling_price.message}</p>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Record Entry ✅'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/clerk/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
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