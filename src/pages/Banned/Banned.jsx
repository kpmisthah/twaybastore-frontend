import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import './banned.css'
export default function Banned() {
  const location = useLocation();
  const navigate = useNavigate();
  const reason =
    location.state?.reason || "You have been restricted from accessing Twayba due to a policy violation.";

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 text-center px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full border border-gray-100 animate-fadeIn">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-red-100 text-red-600 p-4 rounded-full mb-3">
            <ShieldAlert size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your account has been banned from <strong>Twayba</strong>.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-gray-900">Reason:</span>{" "}
            {reason}
          </p>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-2.5 mb-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 active:scale-[0.98] transition-all"
        >
          Back to Login
        </button>

        <p
          
          className="text-sm"
        >
          Need help? <a className="text-blue-700" href="mailto:support@twayba.com"> contact@twayba.com</a>
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-8">
        © {new Date().getFullYear()} Twayba Group. All rights reserved.
      </p>
    </section>
  );
}
