import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../api/config";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp+new pass
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false); // add at top

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}auth/request-password-reset`, {
        email,
      });
      setUserId(res.data.userId);
      setStep(2);
      toast.success(res.data.message || "OTP sent to email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}auth/reset-password`, {
        userId,
        otp,
        newPassword,
      });
      toast.success("Password reset successful! You can now log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-2">
      <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-xl">
        <div className="flex justify-center mb-6">
          <img
            src="/emailLogo.png"
            alt="Twayba Logo"
            className="h-10 w-auto"
            loading="lazy"
          />
        </div>
        <h2 className="text-xl font-semibold mb-3 text-gray-900 text-center">
          Reset Password
        </h2>

        {step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
              className="absolute cursor-pointer right-3 top-2.5 text-gray-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold"
            >
              Reset Password
            </button>
          </form>
        )}

        <p className="text-sm text-center mt-4 text-gray-600">
          <Link
            to="/login"
            className="text-blue-500 hover:underline font-medium"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
