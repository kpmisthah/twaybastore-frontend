// src/pages/Orders.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { CheckCircle, X, Search, Package, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

function formatEuro(amount) {
  if (!amount) return "€0.00";
  return `€${Number(amount).toFixed(2)}`;
}

function isWithin2Hours(dateString) {
  return Date.now() - new Date(dateString).getTime() < 2 * 60 * 60 * 1000;
}

const STATUS_ORDER = ["Processing", "Packed", "Delivered"];

const STATUS_STYLE = {
  Processing: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Processing" },
  Packed: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200", label: "Packed" },
  Shipped: { dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Shipped" },
  Delivered: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Delivered" },
  Cancelled: { dot: "bg-red-400", badge: "bg-red-50 text-red-600 border-red-200", label: "Cancelled" },
};

const CANCEL_REASONS = ["Changed my mind", "Found cheaper elsewhere", "Order mistake", "Other"];
const LIMIT = 6;

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Skeleton card ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded-full" />
          <div className="h-3 w-24 bg-gray-100 rounded-full" />
        </div>
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2 mt-4">
        <div className="h-3 w-full bg-gray-100 rounded-full" />
        <div className="h-3 w-4/5 bg-gray-100 rounded-full" />
      </div>
      <div className="mt-5 pt-4 border-t flex justify-between">
        <div className="h-4 w-24 bg-gray-100 rounded-full" />
        <div className="h-4 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

// ── Status roadmap ───────────────────────────────────────────────────
function StatusRoadmap({ status }) {
  if (status === "Cancelled") {
    return (
      <div className="flex items-center gap-2 mt-4">
        <span className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <X className="w-3 h-3 text-white" />
        </span>
        <span className="text-sm font-semibold text-red-600">Order Cancelled</span>
      </div>
    );
  }
  const currentIndex = STATUS_ORDER.indexOf(status);
  return (
    <div className="flex items-center mt-4 w-full">
      {STATUS_ORDER.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div className={`flex items-center justify-center rounded-full text-[11px] font-bold transition-all
              ${idx < currentIndex ? "w-6 h-6 bg-emerald-500 text-white"
                : idx === currentIndex ? "w-7 h-7 bg-blue-600 text-white ring-2 ring-blue-200"
                  : "w-5 h-5 bg-gray-200 text-gray-400"}`}>
              {idx < currentIndex ? <CheckCircle className="w-3.5 h-3.5" /> : idx + 1}
            </div>
            <span className={`mt-1.5 text-[10px] font-semibold whitespace-nowrap
              ${idx === currentIndex ? "text-blue-600"
                : idx < currentIndex ? "text-emerald-600"
                  : "text-gray-400"}`}>
              {step}
            </span>
          </div>
          {idx < STATUS_ORDER.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 rounded ${idx < currentIndex ? "bg-emerald-400" : "bg-gray-200"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ── Cancel modal ─────────────────────────────────────────────────────
function CancelModal({ order, onClose, onCancelled }) {
  const [cancelReason, setCancelReason] = useState("");
  const [cancelReasonText, setCancelReasonText] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!cancelReason) return setOtpError("Please select a reason.");
    if (cancelReason === "Other" && !cancelReasonText) return setOtpError("Please specify your reason.");
    setLoading(true); setOtpError("");
    try {
      await axios.post(`${BASE_URL}orders/${order._id}/send-cancel-otp`);
      setOtpSent(true);
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Failed to send OTP.");
    }
    setLoading(false);
  };

  const confirm = async () => {
    if (!otp) return setOtpError("Enter the OTP sent to your email.");
    setLoading(true); setOtpError("");
    try {
      await axios.post(`${BASE_URL}orders/${order._id}/cancel`, {
        reason: cancelReason === "Other" && cancelReasonText ? cancelReasonText : cancelReason,
        otp,
      });
      onCancelled(order._id, cancelReason === "Other" ? cancelReasonText : cancelReason);
      onClose();
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Cancellation failed.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl relative">
        <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl">×</button>
        <h3 className="text-base font-bold text-gray-800 mb-1">Cancel Order</h3>
        <p className="text-xs text-gray-500 mb-4">Order #{order._id.slice(-6)}</p>

        <label className="text-sm font-medium text-gray-700 mb-1 block">Reason</label>
        <select
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-300"
          value={cancelReason}
          onChange={(e) => { setCancelReason(e.target.value); setOtpError(""); if (e.target.value !== "Other") setCancelReasonText(""); }}
          disabled={otpSent}
        >
          <option value="">Select reason…</option>
          {CANCEL_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        {cancelReason === "Other" && !otpSent && (
          <textarea rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-300"
            placeholder="Describe your reason…" value={cancelReasonText} onChange={(e) => setCancelReasonText(e.target.value)} />
        )}

        {!otpSent ? (
          <button onClick={sendOtp} disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60">
            {loading ? "Sending…" : "Send OTP to Email"}
          </button>
        ) : (
          <>
            <label className="text-sm font-medium text-gray-700 block mb-1">Enter OTP</label>
            <input type="text" maxLength={6} value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric" autoComplete="one-time-code" autoFocus disabled={loading}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-red-300" />
            <button onClick={confirm} disabled={loading || !otp}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60">
              {loading ? "Cancelling…" : "Confirm Cancellation"}
            </button>
          </>
        )}
        {otpError && <p className="text-xs text-red-600 mt-2">{otpError}</p>}
      </div>
    </div>
  );
}

// ── Order card ───────────────────────────────────────────────────────
function OrderCard({ order, onCancel }) {
  const style = STATUS_STYLE[order.status] || STATUS_STYLE.Processing;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col gap-4">

      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900 text-sm">#{order._id.slice(-8).toUpperCase()}</span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 ml-6">
            {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${style.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>

      {/* Status roadmap */}
      <StatusRoadmap status={order.status} />

      {/* Items */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1.5">
        {order.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <span className="text-gray-700 truncate max-w-[200px]">{item.name}</span>
            <span className="text-gray-400 text-xs ml-2 shrink-0">× {item.qty}</span>
          </div>
        ))}
        {order.items.length > 3 && (
          <p className="text-xs text-gray-400 mt-1">+{order.items.length - 3} more item(s)</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="text-xs text-gray-500">
          {order.paymentMethod === "COD"
            ? "💵 Cash on Delivery"
            : order.paymentMethod === "PICKUP"
              ? "🏪 Pickup from Shop"
              : "💳 Card Payment"}
          {order.isPaid && <span className="ml-2 text-emerald-600 font-medium">· Paid</span>}
        </div>
        <span className="text-base font-bold text-gray-900">{formatEuro(order.total)}</span>
      </div>

      {/* Cancel button */}
      {order.status === "Processing" && isWithin2Hours(order.createdAt) && (
        <button onClick={() => onCancel(order)}
          className="w-full text-sm text-red-600 font-semibold border border-red-200 rounded-lg py-2 hover:bg-red-50 transition">
          Cancel Order
        </button>
      )}

      {/* Cancel reason */}
      {order.status === "Cancelled" && order.cancelReason && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-700">
          <span className="font-semibold">Reason: </span>{order.cancelReason}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [fetching, setFetching] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const debouncedSearch = useDebounce(search, 450);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [cancelOrder, setCancelOrder] = useState(null);

  useEffect(() => { setPage(1); }, [debouncedSearch, statusFilter]);

  const fetchOrders = useCallback(async (userId, token) => {
    setFetching(true);
    try {
      const params = { page, limit: LIMIT };
      if (debouncedSearch.trim()) params.q = debouncedSearch.trim();
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get(`${BASE_URL}orders/my-orders/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const data = res.data;
      const list = Array.isArray(data) ? data : (data.orders || []);
      setOrders(list);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || list.length);
    } catch {
      setOrders([]);
    } finally {
      setFetching(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    setUser(storedUser);
    if (storedUser?._id) fetchOrders(storedUser._id, token);
    else setFetching(false);
  }, [fetchOrders]);

  const handleCancelled = (orderId, reason) => {
    setOrders((prev) =>
      prev.map((o) => o._id === orderId ? { ...o, status: "Cancelled", cancelReason: reason } : o)
    );
  };

  const hasFilter = debouncedSearch || statusFilter;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Cancel modal */}
        {cancelOrder && (
          <CancelModal
            order={cancelOrder}
            onClose={() => setCancelOrder(null)}
            onCancelled={handleCancelled}
          />
        )}

        {/* Page header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-sm text-gray-500">
              {fetching ? "Loading…" : `${total} order${total !== 1 ? "s" : ""} found`}
            </p>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order ID or item name…"
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-44 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
          >
            <option value="">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Content */}
        {fetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-20 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800">
                {hasFilter ? "No orders match your search" : "No orders yet"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {hasFilter ? "Try a different search or filter" : "Your orders will appear here"}
              </p>
            </div>
            {hasFilter ? (
              <button onClick={() => { setSearch(""); setStatusFilter(""); }}
                className="px-5 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Clear filters
              </button>
            ) : (
              <button onClick={() => (window.location.href = "/products")}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm">
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} onCancel={setCancelOrder} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!fetching && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-semibold transition
                    ${p === page
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
