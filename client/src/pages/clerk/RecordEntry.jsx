import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import DashboardLayout from '../../components/layout/DashboardLayout';

const RecordEntry = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products/store-products');
        setProducts(res.data.store_products || []);
      } catch {
        toast.error('Failed to load products');
      }
    };
    fetchProducts();
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/inventory/', {
        store_product_id: parseInt(data.store_product_id),
        quantity_received: parseInt(data.quantity_received),
        quantity_spoilt: parseInt(data.quantity_spoilt || 0),
        buying_price: parseFloat(data.buying_price),
        selling_price: parseFloat(data.selling_price),
        payment_status: data.payment_status
      });
      toast.success('Entry recorded successfully ✅');
      reset();
      navigate('/clerk/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to record entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Record New Entry 📝">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="card">
          <div>
            <label className="block text-sm font-medium mb-1">Product</label>
            <select className="input-field" {...register('store_product_id', { required: 'Product is required' })}>
              <option value="">Select Product</option>
              {products.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.product_name}
                </option>
              ))}
            </select>
            {errors.store_product_id && <p className="text-red-500 text-sm mt-1">{errors.store_product_id.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity Received</label>
              <input type="number" className="input-field" {...register('quantity_received', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity Spoilt</label>
              <input type="number" className="input-field" {...register('quantity_spoilt')} defaultValue={0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Buying Price</label>
              <input type="number" step="0.01" className="input-field" {...register('buying_price', { required: true })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Selling Price</label>
              <input type="number" step="0.01" className="input-field" {...register('selling_price', { required: true })} />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Payment Status</label>
            <select className="input-field" {...register('payment_status')}>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <div className="flex gap-3 pt-6">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
              {loading ? 'Saving...' : 'Record Entry ✅'}
            </button>
            <button type="button" onClick={() => navigate('/clerk/dashboard')} className="px-6 py-3 border border-gray-300 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RecordEntry;