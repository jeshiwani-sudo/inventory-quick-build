import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { loginUser, clearError } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      redirectByRole(user.role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const redirectByRole = (role) => {
    if (role === 'merchant') navigate('/merchant/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'clerk') navigate('/clerk/dashboard');
  };

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success(`Welcome back! 👋`);
      redirectByRole(result.payload.user.role);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">📦</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory App</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Invalid email address'
                }
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
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
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-center disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;