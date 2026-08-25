import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../api/config";
import toast from "react-hot-toast";
import {
  CheckCircle,
  Package,
  ShoppingBag,
  MapPin,
  CreditCard,
  Calendar,
  ArrowRight,
  Info,
  Clock,
  Home,
  ChevronRight,
  Copy,
  Check
} from "lucide-react";

// Fallback Image Component
const OrderProductImage = ({ src, name }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center p-3">
        <ShoppingBag className="w-6 h-6 text-slate-400" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setHasError(true)}
      className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
    />
  );
};

// Celebration Confetti Component
const Confetti = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(24)].map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 6;
        const duration = 5 + Math.random() * 5;
        const size = 6 + Math.random() * 6;
        const rotate = Math.random() * 360;
        const colors = [
          "bg-indigo-400",
          "bg-emerald-400",
          "bg-sky-400",
          "bg-amber-400",
          "bg-rose-400",
          "bg-violet-400"
        ];
        const colorClass = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <div
            key={i}
            className={`absolute rounded-sm opacity-40 animate-float-up ${colorClass}`}
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              transform: `rotate(${rotate}deg)`,
              bottom: "-20px"
            }}
          />
        );
      })}
    </div>
  );
};

const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${BASE_URL}orders/single/${orderId}`, { headers });
        setOrder(res.data);
      } catch (err) {
        console.error("Error loading order:", err);
        setError(err.response?.data?.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const handleCopyId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    toast.success("Order ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-700"></div>

        <div className="relative flex flex-col items-center z-10">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-800 font-extrabold tracking-tight">Syncing your order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl max-w-md w-full text-center relative z-10">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Order Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">{error || "We couldn't retrieve details for this order."}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-sm"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  const formatEuro = (amount) => {
    if (amount === undefined || amount === null) return "€0.00";
    return `€${Number(amount).toFixed(2)}`;
  };

  const isPickup = order.deliveryMethod === "Pickup" || order.paymentMethod === "PICKUP";
  const customerName = order.shipping?.name || order.guestInfo?.name || "Customer";

  return (
    <div className="min-h-screen bg-slate-50/70 pt-28 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Self-contained CSS Animations */}
      <style>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.5;
          }
          90% {
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 10s linear infinite;
        }
        .bg-mesh-glow {
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.08) 0%, rgba(255, 255, 255, 0) 70%);
        }
      `}</style>

      {/* Celebration background mesh */}
      <Confetti />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-mesh-glow pointer-events-none z-0"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Modern Celebration Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-3xl text-white shadow-xl shadow-emerald-500/10 mb-6">
            <CheckCircle className="w-10 h-10" />
            <span className="absolute -inset-2 rounded-[22px] border border-emerald-500/30 animate-pulse"></span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Thank you, {customerName.split(" ")[0]}!
          </h1>
          <p className="text-slate-500 mt-2 font-medium text-base">
            Your order has been placed. We've sent a confirmation email to{" "}
            <span className="text-slate-800 font-bold">{order.shipping?.email || order.guestInfo?.email}</span>
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT SIDE: Order Items Detail */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-600" />
                  Your Items
                </h3>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {order.items.reduce((acc, curr) => acc + curr.qty, 0)} Items
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0 group">
                    <div className="w-16 h-16 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center shrink-0 shadow-sm relative">
                      <OrderProductImage src={item.image} name={item.name} />
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {item.color && (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                            {item.color}
                          </span>
                        )}
                        {item.dimensions && (
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 uppercase">
                            {item.dimensions}
                          </span>
                        )}
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          Qty: {item.qty}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col justify-center">
                      <p className="text-sm font-bold text-slate-900">{formatEuro(item.price * item.qty)}</p>
                      {item.qty > 1 && (
                        <p className="text-[10px] text-slate-400 font-medium">{formatEuro(item.price)} each</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Window Info */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50 p-4 rounded-2xl">
                <Clock className="w-5 h-5 text-indigo-600 shrink-0 animate-pulse" />
                <div className="text-xs">
                  <p className="font-bold text-slate-800">Estimated Fulfillment Time</p>
                  <p className="text-slate-500 mt-0.5">
                    {isPickup 
                      ? "Ready for store collection in 2 to 4 hours." 
                      : "We aim to deliver your package straight to your door within 24 hours."
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {/* Delivery details Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                {isPickup ? "Pickup Location" : "Delivery Address"}
              </h3>
              
              {isPickup ? (
                <div className="text-sm text-slate-600 space-y-1">
                  <p className="text-slate-950 font-bold text-base">Twayba Storefront</p>
                  <p>676 St Joseph High Street</p>
                  <p>Hamrun, Malta</p>
                </div>
              ) : (
                <div className="text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Recipient Info</p>
                    <p className="text-slate-950 font-bold text-base mt-1">{order.shipping?.name || "Customer"}</p>
                    <p className="text-slate-500 mt-0.5">{order.shipping?.phone || order.guestInfo?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Address Detail</p>
                    <p className="text-slate-900 font-medium mt-1">{order.shipping?.address}</p>
                    <p className="text-slate-600">{order.shipping?.city}, {order.shipping?.state} {order.shipping?.zip}</p>
                    <p className="text-xs text-slate-400 uppercase tracking-widest mt-1 font-bold">
                      {order.shipping?.country === "MT" ? "Malta" : order.shipping?.country}
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SIDE: Summary Receipt & Action CTAs */}
          <div className="space-y-6">
            
            {/* Summary Receipt Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>

              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                Order Summary
              </h3>

              {/* Order reference copy widget */}
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-between border border-slate-100 mb-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Order Reference ID</p>
                  <p className="text-sm font-mono font-bold text-slate-900 mt-0.5 uppercase tracking-wide">
                    #{order._id.slice(-8)}
                  </p>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2 hover:bg-slate-200 text-slate-500 hover:text-indigo-600 rounded-xl transition-colors shadow-sm bg-white border border-slate-100"
                  title="Copy Reference ID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">{formatEuro((order.finalTotal || order.total) + (order.discountAmount || 0))}</span>
                </div>
                
                {order.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600">
                    <span>Coupon Discount</span>
                    <span className="font-semibold">-{formatEuro(order.discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-slate-500">
                  <span>Delivery method</span>
                  <span className="font-semibold text-slate-900 uppercase text-xs">
                    {order.deliveryMethod || "Standard"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-500">
                  <span>Payment status</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    order.isPaid 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? "bg-emerald-500" : "bg-amber-400 animate-pulse"}`}></span>
                    {order.isPaid ? "Paid" : "Pending (COD)"}
                  </span>
                </div>

                {/* Dashed divider */}
                <div className="border-t border-dashed border-slate-200 pt-4 mt-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-800">Total Amount</span>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Inclusive of VAT</p>
                    </div>
                    <span className="text-2xl font-black text-indigo-600">{formatEuro(order.finalTotal || order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs Widget */}
            <div className="space-y-3">
              {user && (
                <button
                  onClick={() => navigate("/orders")}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2 group text-sm active:scale-[0.99]"
                >
                  Track Your Order
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button
                onClick={() => navigate("/products")}
                className="w-full py-4 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-extrabold rounded-2xl transition flex items-center justify-center gap-2 shadow-sm text-sm active:scale-[0.99]"
              >
                <Home className="w-4 h-4 text-slate-500" /> Continue Shopping
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
