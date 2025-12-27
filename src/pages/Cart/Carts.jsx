import React, { useState, useEffect } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { Minus, Plus, X } from "lucide-react";
import StripeCheckoutModal from "./StripeCheckoutModal";
import toast from "react-hot-toast";

const Carts = () => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(false);
  const [stripeOpen, setStripeOpen] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [warnings, setWarnings] = useState({});
  const [liveData, setLiveData] = useState([]); // ⬅️ store stock/price data
  const user = JSON.parse(localStorage.getItem("user"));

  // Sync cart across tabs
  useEffect(() => {
    const onStorage = () => {
      const stored = localStorage.getItem("cart");
      setCart(stored ? JSON.parse(stored) : []);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ Fetch live stock/prices
  useEffect(() => {
    const checkProductChanges = async () => {
      try {
        if (cart.length === 0) return;

        const { data } = await axios.post(`${BASE_URL}products/check-cart`, {
          items: cart.map((item) => ({ _id: item._id, color: item.color })),
        });

        setLiveData(data);

        // warnings
        const warnMap = {};
        cart.forEach((item) => {
          const live = data.find(
            (p) =>
              p._id === item._id &&
              (p.color?.toLowerCase?.() || "") ===
                (item.color?.toLowerCase?.() || "")
          );
          if (!live) return;

          const key = item._id + (item.color || "");
          const itemWarnings = [];

          if (item.price !== live.price) {
            itemWarnings.push(`⚠️ Price changed to €${live.price.toFixed(2)}`);
          }

          if (live.stock <= 2) {
            itemWarnings.push(`🚨 Hurry! Only ${live.stock} left in stock`);
          } else if (live.stock <= 5) {
            itemWarnings.push(`⚠️ Only ${live.stock} left in stock`);
          }

          if (itemWarnings.length > 0) warnMap[key] = itemWarnings;
        });

        setWarnings(warnMap);
      } catch (err) {
        console.error("❌ check-cart error:", err);
      }
    };

    checkProductChanges();
  }, [cart.length]); // only re-check when cart size changes

  const isProfileComplete = (u) => {
    if (!u) return false;
    const required = ["email", "street", "city", "area", "zipCode"];
    return required.every((k) => u[k] && String(u[k]).trim().length > 0);
  };

  const fetchFreshUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const res = await axios.get(`${BASE_URL}auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.user || null;
  };

  // ✅ Update qty respecting stock
  const updateQty = (id, color, newQty) => {
    const updated = cart.map((item) => {
      if (item._id === id && (color ? item.color === color : true)) {
        const live = liveData.find(
          (p) =>
            p._id === item._id &&
            (p.color?.toLowerCase?.() || "") ===
              (item.color?.toLowerCase?.() || "")
        );
        const maxStock = live ? live.stock : 10;
        return { ...item, qty: Math.min(Math.max(1, newQty), maxStock) };
      }
      return item;
    });

    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const removeItem = (id, color) => {
    const newCart = cart.filter((item) =>
      item._id === id && color ? item.color !== color : item._id !== id
    );
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = subtotal >= 35 ? 0 : 5;
  const total = subtotal + delivery;
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const payWithStripe = async () => {
    if (!user?._id) {
      toast.error("Please log in first.");
      return;
    }

    setLoading(true);
    try {
      const freshUser = await fetchFreshUser();

      if (!isProfileComplete(freshUser)) {
        setLoading(false);
        toast.error("Please complete your profile before placing an order.");
        setTimeout(() => (window.location.href = "/profile"), 800);
        return;
      }

      const { data } = await axios.post(`${BASE_URL}payments/create-payment`, {
        amount: total,
        currency: "eur",
      });
      setStripeClientSecret(data.clientSecret);
      setStripeOpen(true);
    } catch (err) {
      toast.error("Payment error: " + (err?.response?.data?.error || err.message));
    }
    setLoading(false);
  };

  const handleStripePaymentSuccess = async ({
    paymentIntent,
    shipping,
    contact,
  }) => {
    setStripeOpen(false);
    setLoading(true);
    try {
      const freshUser = await fetchFreshUser();
      if (!isProfileComplete(freshUser)) {
        setLoading(false);
        toast.error("Please complete your profile before placing an order.");
        setTimeout(() => (window.location.href = "/profile"), 800);
        return;
      }

      await axios.post(`${BASE_URL}orders`, {
        userId: user._id,
        items: cart.map((item) => ({
          name: item.name,
          price: item.price,
          qty: item.qty,
          image: item.image || item.images?.[0] || "",
          product: item._id,
          color: item.color || undefined,
        })),
        total,
        paymentIntentId: paymentIntent.id,
        shipping,
        contact,
        couponCode: paymentIntent.couponCode || "", // add this
      });

      localStorage.removeItem("cart");
      setCart([]);
      window.location.href = "/orders";
    } catch (err) {
      toast(
        "Order placement failed. " +
          (err?.response?.data?.message || err.message)
      );
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {cart.length === 0
              ? "Your cart is empty"
              : `${itemCount} item${itemCount !== 1 ? "s" : ""} in your cart`}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm flex flex-col items-center gap-6">
            <div>
              <div className="text-xl font-semibold text-gray-800 mb-2">
                Your cart is empty.
              </div>
              <div className="text-sm text-gray-500 mb-4">Ready to shop?</div>
              <button
                onClick={() => (window.location.href = "/products")}
                className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4 pb-24 lg:pb-0">
              {cart.map((item) => {
                const warnKey = item._id + (item.color || "");
                const live = liveData.find(
                  (p) =>
                    p._id === item._id &&
                    (p.color?.toLowerCase?.() || "") ===
                      (item.color?.toLowerCase?.() || "")
                );
                const maxStock = live ? live.stock : 10;

                return (
                  <div
                    key={warnKey}
                    className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      <img
                        src={
                          item.image ||
                          item.images?.[0] ||
                          "/default-product.png"
                        }
                        alt={item.name}
                        className="w-full sm:w-24 h-32 sm:h-24 object-cover rounded-lg bg-gray-100"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.name}
                            {item.color && (
                              <span className="ml-2 text-xs font-medium text-gray-500">
                                ({item.color})
                              </span>
                            )}
                          </h3>
                          <button
                            onClick={() => removeItem(item._id, item.color)}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>

                        {warnings[warnKey]?.map((msg, i) => (
                          <p
                            key={i}
                            className="text-sm text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded mb-2 inline-block"
                          >
                            {msg}
                          </p>
                        ))}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <button
                              onClick={() =>
                                updateQty(
                                  item._id,
                                  item.color,
                                  Math.max(1, item.qty - 1)
                                )
                              }
                              className="p-2 text-gray-600 hover:bg-gray-50"
                              disabled={item.qty <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                updateQty(
                                  item._id,
                                  item.color,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-16 text-center py-2 border-0 text-gray-900"
                            />
                            <button
                              onClick={() =>
                                updateQty(item._id, item.color, item.qty + 1)
                              }
                              className="p-2 text-gray-600 hover:bg-gray-50"
                              disabled={item.qty >= maxStock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              €{(item.price * item.qty).toFixed(2)}
                            </p>
                            {item.qty > 1 && (
                              <p className="text-sm text-gray-600">
                                €{item.price.toFixed(2)} each
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              Stock left: {maxStock}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm sticky top-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-3 mb-4 text-gray-600">
                  <div className="flex justify-between">
                    <span>
                      Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
                    </span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>
                      {delivery === 0 ? "Free" : `€${delivery.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>€{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={payWithStripe}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700"
                  disabled={loading || cart.length === 0}
                >
                  {loading
                    ? "Processing..."
                    : `Place Order • €${total.toFixed(2)}`}
                </button>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Free delivery on orders over €35
                </p>
              </div>
            </div>
          </div>
        )}

        <StripeCheckoutModal
          open={stripeOpen}
          onClose={() => setStripeOpen(false)}
          clientSecret={stripeClientSecret}
          onPaymentSuccess={handleStripePaymentSuccess}
          amount={total.toFixed(2)}
          disabled={loading}
        />
      </div>
    </div>
  );
};

export default Carts;
