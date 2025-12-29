import React, { useState } from "react";
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import BASE_URL from "../../api/config";

const GuestCheckoutModal = ({ open, onClose, product }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    area: "",
    zipCode: "",
    country: "MT",
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");
    if (!stripe || !elements) return setError("Stripe not loaded.");

    setProcessing(true);
    try {
      // 1. Create payment intent
      // 1. Create payment intent
      const { data } = await axios.post(`${BASE_URL}payments/create-payment`, {
        items: [{
          product: product._id,
          qty: product.qty,
          color: product.color,
          dimensions: product.dimensions,
        }],
        currency: "eur",
        guestInfo: form,
      });

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: {
              line1: form.street,
              city: form.city,
              state: form.area,
              postal_code: form.zipCode,
              country: form.country,
            },
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        // 2. Save order as "guest"
        await axios.post(`${BASE_URL}orders/guest`, {
          items: [product],
          total: data.amount, // Use server-calculated amount
          paymentIntentId: result.paymentIntent.id,
          guestInfo: form,
        });

        localStorage.removeItem("cart"); // clear if needed
        window.location.href = "/orders/thank-you";
      }
    } catch (err) {
      setError(err.message || "Payment failed.");
    }
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 text-2xl">×</button>
        <h2 className="text-xl font-bold mb-4">Guest Checkout</h2>

        <form onSubmit={handlePay} className="space-y-3">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full border px-3 py-2 rounded" required />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border px-3 py-2 rounded" required />
          <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border px-3 py-2 rounded" required />
          <input name="street" value={form.street} onChange={handleChange} placeholder="Street Address" className="w-full border px-3 py-2 rounded" required />
          <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="w-full border px-3 py-2 rounded" required />
          <input name="area" value={form.area} onChange={handleChange} placeholder="State/Area" className="w-full border px-3 py-2 rounded" />
          <input name="zipCode" value={form.zipCode} onChange={handleChange} placeholder="Postal Code" className="w-full border px-3 py-2 rounded" required />

          {/* Stripe card fields */}
          <div><label>Card Number</label><CardNumberElement className="border px-3 py-2 rounded w-full" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label>Expiry</label><CardExpiryElement className="border px-3 py-2 rounded w-full" /></div>
            <div><label>CVC</label><CardCvcElement className="border px-3 py-2 rounded w-full" /></div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button type="submit" disabled={processing} className="w-full bg-green-600 text-white py-3 rounded-lg">
            {processing ? "Processing..." : `Pay €${(product.price * product.qty).toFixed(2)}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GuestCheckoutModal;
