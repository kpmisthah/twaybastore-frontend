// src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { CheckCircle, X } from "lucide-react";

// Format euro
function formatEuro(amount) {
  if (!amount) return "€0.00";
  return `€${Number(amount).toFixed(2)}`;
}

// Helper: is order placed within 2 hours?
function isWithin2Hours(dateString) {
  const orderDate = new Date(dateString);
  const now = new Date();
  return now - orderDate < 2 * 60 * 60 * 1000;
}

const STATUS_ORDER = ["Processing", "Packed", "Delivered"];
const STATUS_COLORS = {
  Processing: "bg-yellow-400",
  Packed: "bg-blue-500",
  Delivered: "bg-green-500",
  Cancelled: "bg-red-500",
};

const CANCEL_REASONS = ["Changed my mind", "Found cheaper elsewhere", "Order mistake", "Other"];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);

  // Cancel modal state
  const [showModal, setShowModal] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonText, setCancelReasonText] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
    if (storedUser?._id) {
      axios.get(`${BASE_URL}orders/my-orders/${storedUser._id}`).then((res) => setOrders(res.data));
    }
  }, []);

  // ----- CANCEL ORDER LOGIC -----
  const openCancelModal = (order) => {
    setModalOrder(order);
    setShowModal(true);
    setCancelReason("");
    setCancelReasonText("");
    setOtp("");
    setOtpError("");
    setOtpSent(false);
  };

  const sendCancelOtp = async () => {
    setLoading(true);
    setOtpError("");
    try {
      await axios.post(`${BASE_URL}orders/${modalOrder._id}/send-cancel-otp`);
      setOtpSent(true);
      // toast.success("OTP sent to your email");
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Failed to send OTP.");
    }
    setLoading(false);
  };

  const submitCancelOrder = async () => {
    if (!otp) {
      setOtpError("Please enter the OTP sent to your email.");
      return;
    }
    setLoading(true);
    setOtpError("");
    try {
      await axios.post(`${BASE_URL}orders/${modalOrder._id}/cancel`, {
        reason:
          cancelReason === "Other" && cancelReasonText ? cancelReasonText : cancelReason,
        otp,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === modalOrder._id
            ? {
                ...order,
                status: "Cancelled",
                cancelReason:
                  cancelReason === "Other" && cancelReasonText ? cancelReasonText : cancelReason,
              }
            : order
        )
      );
      setShowModal(false);
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Cancellation failed.");
    }
    setLoading(false);
  };

  const CancelOrderModal = () =>
    showModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl p-6 w-[350px] shadow-2xl relative">
          <button
            className="absolute top-2 right-3 text-gray-400 hover:text-black text-lg"
            onClick={() => setShowModal(false)}
          >
            ×
          </button>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Cancel Order #{modalOrder?._id.slice(-6)}
          </h3>
          <label className="text-sm font-medium mb-1 block">Reason for cancellation</label>
          <select
            className="w-full border rounded px-2 py-1 text-sm mb-2"
            value={cancelReason}
            onChange={(e) => {
              setCancelReason(e.target.value);
              setOtpError("");
              if (e.target.value !== "Other") setCancelReasonText("");
            }}
            disabled={otpSent}
          >
            <option value="">Select reason...</option>
            {CANCEL_REASONS.map((reason, idx) => (
              <option key={idx} value={reason}>
                {reason}
              </option>
            ))}
          </select>

          {cancelReason === "Other" && !otpSent && (
            <textarea
              rows={2}
              className="w-full border rounded px-2 py-1 text-sm mb-3"
              placeholder="Type your reason..."
              value={cancelReasonText}
              onChange={(e) => setCancelReasonText(e.target.value)}
              required
            />
          )}

          {!otpSent ? (
            <button
              onClick={() => {
                if (!cancelReason) {
                  setOtpError("Please select a cancellation reason.");
                  return;
                }
                if (cancelReason === "Other" && !cancelReasonText) {
                  setOtpError("Please specify your reason for cancellation.");
                  return;
                }
                setOtpError("");
                sendCancelOtp();
              }}
              className="bg-red-600 text-white w-full rounded py-2 font-semibold hover:bg-red-700"
              disabled={loading}
            >
              {loading ? "Sending OTP..." : "Send OTP to Cancel"}
            </button>
          ) : (
            <>
              <label className="text-sm font-medium mt-2 block">Enter OTP</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 text-sm mt-1 mb-2"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                disabled={loading}
                autoFocus
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <button
                onClick={submitCancelOrder}
                className="bg-red-600 text-white w-full rounded py-2 font-semibold hover:bg-red-700"
                disabled={loading || !otp}
              >
                {loading ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </>
          )}

          {otpError && <div className="text-xs text-red-600 mt-2">{otpError}</div>}
        </div>
      </div>
    );

  const OrderStatusRoadmap = ({ status }) => {
    if (status === "Cancelled") {
      return (
        <div className="flex items-center gap-2 mt-4 justify-center">
          <span className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white">
            <X className="w-4 h-4" />
          </span>
          <span className="text-sm font-bold text-red-600">Order Cancelled</span>
        </div>
      );
    }
    const currentIndex = STATUS_ORDER.indexOf(status);
    return (
      <div className="flex items-center justify-between gap-1 mt-4 w-full select-none">
        {STATUS_ORDER.map((step, idx) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`flex items-center justify-center rounded-full font-bold transition-all duration-200
                  ${
                    idx < currentIndex
                      ? "bg-green-500 text-white w-6 h-6"
                      : idx === currentIndex
                      ? `${STATUS_COLORS[status]} text-white w-7 h-7 scale-110 ring-2 ring-black/60`
                      : "bg-gray-300 text-gray-400 w-5 h-5"
                  }`}
              >
                {idx < currentIndex ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span
                className={`mt-1 text-[11px] font-semibold text-center ${
                  idx === currentIndex
                    ? "text-black"
                    : idx < currentIndex
                    ? "text-green-700"
                    : "text-gray-400"
                }`}
              >
                {step}
              </span>
            </div>
            {idx !== STATUS_ORDER.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded-sm ${
                  idx < currentIndex ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 max-w-6xl mx-auto">
      <CancelOrderModal />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
        <p className="text-sm text-gray-500">{orders.length} order(s) found</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center text-gray-500 bg-white py-16 rounded-lg shadow-sm flex flex-col items-center gap-6">
          <div>
            <div className="text-xl font-semibold text-gray-800 mb-2">
              You haven't placed any orders yet.
            </div>
            <div className="text-sm text-gray-500 mb-4">Ready to find something you love?</div>
            <button
              onClick={() => (window.location.href = "/products")}
              className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order #{order._id.slice(-6)}
                  </h2>
                  <p className="text-xs text-gray-500">
                    Placed on: {new Date(order.createdAt).toDateString()}
                  </p>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border capitalize
                    ${
                      order.status === "Delivered"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : order.status === "Cancelled"
                        ? "bg-red-100 text-red-600 border-red-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"
                    }`}
                >
                  {order.status}
                </span>
              </div>

              <OrderStatusRoadmap status={order.status} />

              <div className="mt-4 space-y-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Items Ordered:</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-700">
                    <span>{item.name}</span>
                    <span>Qty: {item.qty}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4 border-t pt-3 text-sm">
                <div className="text-gray-500">
                  <p>Estimated Delivery</p>
                  <p className="font-medium text-gray-800">24 Hours</p>
                </div>
                <div className="text-right font-bold text-base text-gray-900">
                  {formatEuro(order.total)}
                </div>
              </div>

              <div className="mt-4 text-right space-x-3">
                {order.status === "Processing" && isWithin2Hours(order.createdAt) && (
                  <button
                    onClick={() => openCancelModal(order)}
                    className="text-sm text-red-700 font-semibold hover:underline border px-3 py-1 rounded bg-red-50"
                  >
                    Cancel Order
                  </button>
                )}
              </div>

              {order.status === "Cancelled" && order.cancelReason && (
                <div className="mt-2 text-xs text-red-800 bg-red-50 rounded px-3 py-2 border border-red-200">
                  <span className="font-semibold">Reason:</span> {order.cancelReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
