import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const isMerchantMode = !token; // No token = Merchant self-registration

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const [loading, setLoading] = useState(false);

  // Simple email validation for merchant self-registration
  const isValidTestEmail = (email) => {
    const allowed = /@(gmail\.com|yahoo\.com|outlook\.com|test\.com)$/i;
    return allowed.test(email);
  };

  useEffect(() => {
    if (token) {
      // Invited user mode (Admin/Clerk)
      console.log('Invited registration mode');
    } else {
      // Merchant self-registration mode
      console.log('Merchant self-registration mode');
    }
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      if (isMerchantMode) {
        // === MERCHANT SELF-REGISTRATION ===
        if (!isValidTestEmail(data.email)) {
          toast.error('Only test emails ending with @gmail.com, @yahoo.com, @outlook.com or @test.com are allowed for merchant registration.');
          setLoading(false);
          return;
        }

        await api.post('/auth/register-merchant', {
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number,
          password: data.password,
          store_name: data.store_name,   // Bank name / Store name
        });

        toast.success('Merchant account created successfully! 🎉 Please login.');
        navigate('/login');
      } else {
        // === INVITED USER REGISTRATION (Admin/Clerk) ===
        await api.post('/auth/register', {
          token,
          full_name: data.full_name,
          phone_number: data.phone_number,
          password: data.password,
        });

        toast.success('Registration complete! Please login 🎉');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-3xl">{isMerchantMode ? '👑' : '🎉'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isMerchantMode ? 'Register as Merchant' : 'Complete Registration'}
          </h1>
          <p className="text-gray-500 mt-1">
            {isMerchantMode
              ? 'Create your account and a new store'
              : 'You have been invited to join LocalShop'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Merchant-only fields */}
          {isMerchantMode && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="merchant1@gmail.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store / Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Shop Name"
                  {...register('store_name', { required: 'Store name is required' })}
                />
                {errors.store_name && (
                  <p className="text-red-500 text-sm mt-1">{errors.store_name.message}</p>
                )}
              </div>
            </>
          )}

          {/* Common fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="John Doe"
              {...register('full_name', { required: 'Full name is required' })}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="input-field"
              placeholder="+254 712 345 678"
              {...register('phone_number', { required: 'Phone number is required' })}
            />
            {errors.phone_number && (
              <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
            />
            {errors.confirm_password && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm_password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            {loading
              ? 'Creating Account...'
              : isMerchantMode
              ? 'Create Merchant Account'
              : 'Complete Registration'}
          </button>
        </form>

        {/* Back to login link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;