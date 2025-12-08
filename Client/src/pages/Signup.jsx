import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';
import { ClipLoader } from 'react-spinners';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.signup(
        formData.username,
        formData.email,
        formData.password
      );

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("tokenTime", Date.now());
        localStorage.setItem(
          "profileComplete",
          String(response.isProfileComplete)
        );

        navigate("/setup-profile");
      }


    } catch (error) {
      toast.error("An error occurred during signup");
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
            <h2 className="text-3xl font-bold text-black dark:text-white mb-2">Create Account</h2>
            <p className="text-gray-500 dark:text-gray-400">Join GenUI to start generating components</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#141319] border border-gray-200 dark:border-[#333] text-black dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
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
              {loading ? <ClipLoader size={20} color="white" /> : "Sign Up"}
            </button>

          </form>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-600 dark:text-purple-400 font-medium hover:underline">
              Log in
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;