import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';
import { ClipLoader } from 'react-spinners';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login(formData.email, formData.password);

      if (response.token) {
        localStorage.setItem("token", response.token);
        toast.success(response.message);
        navigate("/");
      } else {
        toast.error(response.message);
      }

    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#141319] transition-colors duration-300">
      <Navbar />

      <div className="flex items-center justify-center h-[calc(100vh-90px)] px-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-gray-50 dark:bg-[#09090B] border border-gray-200 dark:border-[#1f1f23] shadow-xl">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-2">Welcome Back</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Enter your credentials to access your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#141319] border border-gray-200 dark:border-[#333] text-black dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>

                <Link 
                  to="/forgot-password" 
                  className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#141319] border border-gray-200 dark:border-[#333] text-black dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <ClipLoader size={20} color="white" /> : "Log In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
