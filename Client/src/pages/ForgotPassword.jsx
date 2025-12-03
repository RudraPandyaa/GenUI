import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../services/auth';
import { ClipLoader } from 'react-spinners';
import { IoArrowBack } from 'react-icons/io5';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('EMAIL');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");

    setLoading(true);
    try {
      const response = await authService.sendOtp(email);
      if (response.message === "OTP sent to email") {
        toast.success(response.message);
        setStep('OTP');
      }else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) return toast.error("Please complete all fields");

    setLoading(true);
    try {
      const response = await authService.verifyOtpAndResetPassword(email, otp, newPassword);
      if (response.message === "Password has been reset successfully") {
        toast.success(response.message);
        navigate('/login');
      }else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#141319] transition-colors duration-300">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-90px)] px-4">
        <div className="w-full max-w-md p-8 rounded-2xl bg-gray-50 dark:bg-[#09090B] border border-gray-200 dark:border-[#1f1f23] shadow-xl relative">
          
          <Link to="/login" className="absolute top-8 left-8 text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            <IoArrowBack size={20} />
          </Link>

          <div className="text-center mb-8 mt-6">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-2">
                {step === 'EMAIL' ? 'Forgot Password?' : 'Enter OTP'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm px-4">
                {step === 'EMAIL' 
                    ? "Enter your email address and we'll send you an OTP to reset your password." 
                    : `We've sent a 6-digit OTP to ${email}. Please enter it below.`}
            </p>
          </div>

          {step === 'EMAIL' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#141319] border border-gray-200 dark:border-[#333] text-black dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="name@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <ClipLoader size={20} color="white" /> : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  One-Time Password (OTP)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#141319] border border-gray-200 dark:border-[#333] text-black dark:text-white focus:outline-none focus:border-purple-500 transition-colors tracking-widest text-center text-lg"
                  placeholder="------"
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-[#141319] border border-gray-200 dark:border-[#333] text-black dark:text-white focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="New strong password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? <ClipLoader size={20} color="white" /> : "Reset Password"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('EMAIL')}
                  className="text-sm text-purple-600 hover:underline"
                >
                  Change Email
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;