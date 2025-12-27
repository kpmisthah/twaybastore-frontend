import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import BASE_URL from "../../api/config";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${BASE_URL}auth/login`, formData);

      // 🚫 If backend flags banned user
      if (res.data?.banned) {
        localStorage.clear();
        toast.error("Your account has been banned.");
        navigate("/banned", { state: { reason: res.data.reason } });
        return;
      }

      // ✅ Normal successful login
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(res.data.message || "Welcome back!");
      navigate("/");
    } catch (err) {
      // 🚫 If banned error came via 403 response
      if (err.response?.data?.banned) {
        localStorage.clear();
        toast.error("Your account has been banned.");
        navigate("/banned", { state: { reason: err.response.data.reason } });
      } else {
        toast.error(err.response?.data?.message || "Login failed");
      }
    } finally {
      setLoading(false);
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
          Sign in
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Access your Twayba account
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={formData.email}
              placeholder="Email address"
              className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              value={formData.password}
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

          <div className="flex justify-end">
            <Link
              to="/reset-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 rounded-md font-semibold text-white transition ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
            }`}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-3 text-xs text-gray-400 uppercase">or</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        {/* Signup link */}
        <p className="text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 font-medium hover:underline"
          >
            Create one
          </Link>
        </p>

        {/* Footer */}
        <p className="text-[11px] text-center text-gray-400 mt-6 leading-snug">
          By continuing, you agree to Twayba’s{" "}
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
