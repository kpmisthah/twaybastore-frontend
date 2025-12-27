import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import BASE_URL from "../../api/config";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
  });

  const [adConsent, setAdConsent] = useState(true); // ✅ default checked
  const [otpSent, setOtpSent] = useState(false);
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ----------------- SIGNUP ----------------- */
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    const allowedDomains = [
      "@gmail.com",
      "@hotmail.com",
      "@outlook.com",
      "@yahoo.com",
      "@icloud.com",
      "@me.com",
      "@mac.com",
    ];

    const email = formData.email.toLowerCase();
    const isAllowed = allowedDomains.some((domain) => email.endsWith(domain));

    if (!isAllowed) {
      toast.error(
        "Only Gmail, Hotmail, Outlook, or Yahoo addresses are allowed for registration."
      );
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData, sendAdsEmail: adConsent }; // ✅ correct key
      const res = await axios.post(`${BASE_URL}auth/signup`, payload);
      toast.success(res.data.message || "OTP sent to your email");
      setUserId(res.data.userId);
      setOtpSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------- VERIFY OTP ----------------- */
  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}auth/verify-otp`, {
        userId,
        otp,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(res.data.message || "Verified!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`${BASE_URL}auth/resend-otp`, { userId });
      toast.success("OTP resent successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/emailLogo.png" alt="Twayba" className="h-10 w-auto" />
        </div>

        {/* Title */}
        <h2 className="text-center text-2xl font-semibold text-gray-900">
          {otpSent ? "Verify your email" : "Create your Twayba account"}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          {otpSent
            ? "Enter the OTP sent to your email"
            : "Join us to shop smarter and faster"}
        </p>

        {/* Form */}
        {!otpSent ? (
          <form onSubmit={handleSignup} className="space-y-4">
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Full name"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />

            <input
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={(e) => {
                // Remove everything except 0–9
                const v = e.target.value.replace(/\D/g, "");
                setFormData((prev) => ({ ...prev, mobile: v }));
              }}
              placeholder="Mobile number"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5"
              maxLength="10"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700 text-lg"
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>
            </div>

            {/* ✅ Marketing Consent */}
            <label className="flex items-start gap-2 text-sm text-gray-700 leading-tight">
              <input
                type="checkbox"
                checked={adConsent}
                onChange={(e) => setAdConsent(e.target.checked)}
                className="mt-0.5 accent-blue-600"
              />
              <span>
                I agree to receive <strong>Twayba</strong> offers, promotions,
                and updates by email.
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-md font-semibold text-white transition ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
              }`}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOTPVerify} className="space-y-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-md font-semibold text-white transition ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 active:scale-[0.99]"
              }`}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-50 transition"
            >
              Resend OTP
            </button>
          </form>
        )}

        {/* Divider */}
        {!otpSent && (
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-200" />
            <span className="mx-3 text-xs text-gray-400 uppercase">or</span>
            <div className="flex-grow border-t border-gray-200" />
          </div>
        )}

        {/* Already have account */}
        {!otpSent && (
          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        )}

        {/* Footer */}
        <p className="text-[11px] text-center text-gray-400 mt-6 leading-snug">
          By signing up, you agree to Twayba’s{" "}
          <NavLink
            to="/terms-of-use"
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Terms of Service
          </NavLink>{" "}
          and{" "}
          <NavLink
            to="/Privacy"
            className="text-blue-500 hover:underline cursor-pointer"
          >
            Privacy Policy
          </NavLink>
          .
        </p>
      </div>
    </div>
  );
}
