// src/pages/Orders.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { CheckCircle, X, Search, Package, ShoppingBag, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function formatEuro(amount) {
  if (!amount) return "€0.00";
  return `€${Number(amount).toFixed(2)}`;
}

function isWithin2Hours(dateString) {
  return Date.now() - new Date(dateString).getTime() < 2 * 60 * 60 * 1000;
}

const STATUS_ORDER = ["Processing", "Packed", "Delivered"];

const STATUS_STYLE = {
  Processing: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200", label: "Processing", title: "Order processing" },
  Packed: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200", label: "Packed", title: "Order Packed" },
  Shipped: { dot: "bg-indigo-500", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", label: "Shipped", title: "Order Shipped" },
  Delivered: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Delivered", title: "Order Delivered" },
  Cancelled: { dot: "bg-red-400", badge: "bg-red-50 text-red-600 border-red-200", label: "Cancelled", title: "Order Cancelled" },
};

import {
  CreditCard,
  Wallet,
  MapPin,
  Calendar,
  Hash,
  Info,
  Clock,
  Truck
} from "lucide-react";

const CANCEL_REASONS = ["Changed my mind", "Found cheaper elsewhere", "Order mistake", "Other"];
const LIMIT = 10;

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
  if (status === "Cancelled") return null;

  const steps = [
    { label: "Processing", icon: <Clock className="w-3.5 h-3.5" />, idx: 0 },
    { label: "Packed", icon: <Package className="w-3.5 h-3.5" />, idx: 1 },
    { label: "Delivered", icon: <CheckCircle className="w-3.5 h-3.5" />, idx: 2 },
  ];

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center mt-6 mb-2 px-2">
      {steps.map((step, i) => {
        const isCompleted = currentIndex > i;
        const isActive = currentIndex === i;

        return (
          <React.Fragment key={step.label}>
            <div className="flex flex-col items-center relative z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isCompleted ? "bg-blue-600 border-blue-600 text-white"
                  : isActive ? "bg-white border-blue-600 text-blue-600 ring-4 ring-blue-50"
                    : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : step.icon}
              </div>
              <span className={`mt-2 text-xs font-black uppercase tracking-wider
                ${isActive ? "text-blue-600" : isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                {step.label}
              </span>
              <span className="text-[10px] font-black text-gray-400 absolute -bottom-5 bg-white px-2 rounded-full border border-gray-100">Step {i + 1}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-0.5 -mt-6 mx-1 bg-gray-100 min-w-[30px] overflow-hidden">
                <div className={`h-full bg-blue-600 transition-all duration-700 ${isCompleted ? "w-full" : "w-0"}`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
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
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const style = STATUS_STYLE[order.status] || STATUS_STYLE.Processing;

  const handleBuyAgain = (item) => {
    const existingCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const cartKey = `${item.product}_${item.color || ""}_${item.dimensions || ""}`;

    const existingIndex = existingCart.findIndex(i => i.cartKey === cartKey);
    if (existingIndex > -1) {
      existingCart[existingIndex].qty += 1;
    } else {
      existingCart.push({
        _id: item.product,
        name: item.name,
        price: item.price,
        image: item.image,
        color: item.color,
        dimensions: item.dimensions,
        qty: 1,
        cartKey
      });
    }

    localStorage.setItem("cart", JSON.stringify(existingCart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(`Added ${item.name} to cart!`);
    navigate("/carts");
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-10 flex flex-col group hover:shadow-xl hover:shadow-blue-50/50 transition-all duration-500">
      {/* 1. Header Bar: Order Info */}
      <div className="bg-gray-50/80 px-8 py-5 flex flex-wrap items-center justify-between gap-6 border-b border-gray-100">
        <div className="flex gap-12">
          <div className="space-y-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Placed</p>
            <p className="text-base font-bold text-gray-800">
              {new Date(order.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Amount</p>
            <p className="text-lg font-black text-blue-600">{formatEuro(order.total)}</p>
          </div>
          <div className="space-y-1 hidden md:block">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Ship To</p>
            <p className="text-base font-bold text-gray-800 truncate max-w-[200px]">
              {order.shipping?.name || "Customer"}
            </p>
          </div>
        </div>
        <div className="text-right space-y-1 ml-auto">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Order Ref # {order._id.slice(-8).toUpperCase()}</p>
          <div className="flex gap-4 justify-end items-center mt-1">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm font-black text-blue-600 hover:text-blue-700 transition-colors"
            >
              {expanded ? "Hide Details" : "Details"}
            </button>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            <button className="text-sm font-black text-blue-600 hover:text-blue-700 transition-colors">Invoice</button>
          </div>
        </div>
      </div>

      {/* 2. Body Section: Status + Items */}
      <div className="p-8">
        {/* Status Message */}
        <div className="mb-10 flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${order.status === 'Delivered' ? 'bg-emerald-500 shadow-emerald-100 text-white' :
            order.status === 'Cancelled' ? 'bg-red-500 shadow-red-100 text-white' :
              'bg-blue-600 shadow-blue-100 text-white'
            }`}>
            {order.status === 'Delivered' ? <CheckCircle className="w-7 h-7" /> :
              order.status === 'Cancelled' ? <X className="w-7 h-7" /> :
                <Package className="w-7 h-7" />}
          </div>
          <div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">
              {order.status === 'Delivered' ? "Your package was delivered" :
                order.status === 'Cancelled' ? "Order has been cancelled" :
                  `Currently: ${order.status}`}
            </h3>
            <p className="text-base font-bold text-gray-400 mt-1 uppercase tracking-widest leading-none">
              {order.status === 'Delivered' ? "Successfully handed over to resident" :
                order.status === 'Cancelled' ? `Reason: ${order.cancelReason || 'Requested by customer'}` :
                  "We are preparing your items for shipment"}
            </p>
          </div>
        </div>

        {/* 📋 Expanded Details */}
        {expanded && (
          <div className="mb-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Shipping Address</span>
              </div>
              <div className="text-sm text-gray-600 font-bold leading-relaxed px-6">
                <p>{order.shipping?.name}</p>
                <p>{order.shipping?.address}</p>
                <p>{order.shipping?.city}, {order.shipping?.state} {order.shipping?.zip}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <CreditCard className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Payment Info</span>
              </div>
              <div className="text-sm text-gray-600 font-bold leading-relaxed px-6">
                <p>Method: {order.paymentMethod}</p>
                <p>Status: {order.isPaid ? "Paid" : "Unpaid"}</p>
                {order.deliveryMethod && <p>Type: {order.deliveryMethod}</p>}
                {order.deliveryRegion && <p>Region: {order.deliveryRegion}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-blue-600">
                <Info className="w-4 h-4" />
                <span className="text-xs font-black uppercase tracking-wider">Order Timeline</span>
              </div>
              <div className="text-sm text-gray-600 font-bold leading-relaxed px-6">
                <p>Placed: {new Date(order.createdAt).toLocaleString()}</p>
                <p>Last Update: {new Date(order.updatedAt).toLocaleString()}</p>
                {order.status === "Cancelled" && <p className="text-red-500">Cancelled Ref: {new Date(order.updatedAt).toLocaleDateString()}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-12">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-10 items-start">
              {/* Product Thumbnail */}
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[2.5rem] border border-gray-100 flex-shrink-0 overflow-hidden bg-gray-50 flex items-center justify-center group relative shadow-inner">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <ShoppingBag className="w-14 h-14 text-gray-200" />
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col lg:flex-row justify-between gap-10 h-full py-4">
                <div className="space-y-4">
                  <h4 className="text-xl sm:text-2xl font-black text-gray-900 hover:text-blue-600 cursor-pointer transition-colors leading-tight">
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    <span className="text-xs font-black text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full uppercase border border-gray-200 tracking-tighter">Qty: {item.qty}</span>
                    {item.dimensions && <span className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full uppercase border border-blue-100 tracking-tighter">{item.dimensions}</span>}
                    {item.color && <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase border border-emerald-100 tracking-tighter">{item.color}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-4 shrink-0 sm:items-end lg:justify-center">
                  <button
                    onClick={() => handleBuyAgain(item)}
                    className="px-10 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 text-base font-black rounded-[1.5rem] shadow-xl shadow-yellow-100 transition-all active:scale-95 w-full sm:w-56 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" /> Buy it again
                  </button>
                  <button
                    onClick={() => navigate(`/product/${item.product}`)}
                    className="px-10 py-4 border-2 border-gray-100 hover:border-gray-200 hover:bg-white text-gray-700 text-base font-black rounded-[1.5rem] transition-all shadow-sm w-full sm:w-56"
                  >
                    View product
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Footer Section: Status / Cancel */}
      {order.status === "Processing" && isWithin2Hours(order.createdAt) && (
        <div className="px-8 py-6 border-t border-gray-50 bg-gray-50/30 flex justify-end">
          <button onClick={() => onCancel(order)}
            className="text-sm font-black text-red-500 hover:text-red-700 flex items-center gap-3 transition-all hover:scale-105">
            <Info className="w-5 h-5" /> Request Cancellation
          </button>
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
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-blue-600 rounded-3xl shadow-xl shadow-blue-200 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                {fetching ? "Syncing History…" : `${total} order${total !== 1 ? "s" : ""} recorded`}
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filter bar */}
        <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm p-4 mb-10 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID or product name…"
              className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="shrink-0 w-full sm:w-auto h-full">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-52 h-[56px] px-4 bg-gray-50 border-none rounded-2xl text-sm font-bold text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
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
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} onCancel={setCancelOrder} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!fetching && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-16 mb-20 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 inline-flex mx-auto">
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black text-gray-700 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-12 h-12 rounded-2xl text-sm font-black transition-all shadow-sm
                    ${p === page
                      ? "bg-blue-600 text-white scale-110 shadow-blue-200"
                      : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === totalPages}
              className="flex items-center gap-2 px-6 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-black text-gray-700 hover:bg-blue-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Orders;
