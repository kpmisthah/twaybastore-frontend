import React, { useEffect, useMemo, useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import BASE_URL from "../../api/config";
import { HelpCircle, Lock } from "lucide-react";

const REQUIRED_FIELDS = ["email", "street", "city", "area", "zipCode"];

const StripeCheckoutModal = ({
  open,
  onClose,
  clientSecret,
  onPaymentSuccess,
  amount,
  disabled,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [showCvcHelp, setShowCvcHelp] = useState(false);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [country, setCountry] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  // 👇 Payment method toggle
  const [paymentMethod, setPaymentMethod] = useState("card"); // "card" | "cod"

  useEffect(() => {
    if (!open) return;
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${BASE_URL}auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const u = res.data?.user;
        setUser(u);
        const p = u
          ? {
            name: u.fullName || "",
            email: u.email || "",
            phone: u.mobile || u.secondPhone || "",
            address: u.street || "",
            city: u.city || "",
            state: u.state || "",
            zip: u.zipCode || "",
            country: (u.country || "").toUpperCase(),
            area: u.area || "",
          }
          : null;
        setProfile(p);
        setCountry(p?.country || "");
        const missing = REQUIRED_FIELDS.filter(
          (k) => !u?.[k] || !String(u[k]).trim()
        );
        setProfileIncomplete(missing.length > 0);
      } catch {
        setError("Could not load your profile. Please try again.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [open]);

  const elementStyles = useMemo(
    () => ({
      base: {
        fontSize: "16px",
        color: "#1A1F36",
        fontFamily: "system-ui",
        "::placeholder": { color: "#A0AEC0" },
      },
      invalid: { color: "#e53e3e" },
    }),
    []
  );

  const elementClass =
    "w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500 bg-white";

  const handlePay = async (e) => {
    e.preventDefault();
    setError("");

    if (profileIncomplete)
      return setError("Please complete your profile first.");

    setProcessing(true);

    // ✅ COD flow
    if (paymentMethod === "cod") {
      onPaymentSuccess({
        paymentIntent: { id: "COD-" + Date.now() },
        paymentMethod: "COD",
        shipping: {
          name: profile?.name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
          address: profile?.address || "",
          city: profile?.city || "",
          state: profile?.state || profile?.area || "",
          zip: profile?.zip || "",
          country: country || "",
        },
        contact: {
          name: profile?.name || "",
          email: profile?.email || "",
          phone: profile?.phone || "",
        },
      });

      setProcessing(false);
      return;
    }

    // ✅ Stripe Card flow
    if (!stripe || !elements) return setError("Stripe not loaded. Try again.");

    try {
      const cardNumber = elements.getElement(CardNumberElement);
      const billingAddress = {
        line1: profile?.address || "",
        city: profile?.city || "",
        state: profile?.state || profile?.area || "",
        postal_code: profile?.zip || "",
      };
      if (country) billingAddress.country = country.toUpperCase();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: profile?.name || "",
            email: profile?.email || "",
            phone: profile?.phone || "",
            address: billingAddress,
          },
        },
      });

      if (result.error) {
        setError(result.error.message || "Payment failed.");
        setProcessing(false);
        return;
      }

      if (result.paymentIntent?.status === "succeeded") {
        setProcessing(false);
        onPaymentSuccess({
          paymentIntent: result.paymentIntent,
          paymentMethod: "CARD",
          shipping: {
            name: profile?.name || "",
            email: profile?.email || "",
            phone: profile?.phone || "",
            address: profile?.address || "",
            city: profile?.city || "",
            state: profile?.state || profile?.area || "",
            zip: profile?.zip || "",
            country: country || "",
          },
          contact: {
            name: profile?.name || "",
            email: profile?.email || "",
            phone: profile?.phone || "",
          },
        });
      } else {
        setProcessing(false);
        setError("Payment could not be completed. Please try again.");
      }
    } catch (err) {
      setProcessing(false);
      setError(err.message || "Payment failed. Try again.");
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white p-8 w-full h-full max-w-lg pt-[110px] shadow-2xl border border-gray-100 flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 text-1xl"
          onClick={onClose}
        >
          Close ×
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-left">
          Secure Checkout
        </h2>

        {/* Address Review */}
        <h1 className="font-bold text-[16px] text-gray-700">
          Review Your Address
        </h1>
        <hr className="mb-5 text-gray-200" />

        {loadingProfile ? (
          <div className="mb-4 text-gray-500 text-sm">
            Loading your details…
          </div>
        ) : profileIncomplete ? (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
              <strong>Profile incomplete:</strong> Please complete your address
              and contact details before paying.
            </div>
            <div className="mt-3">
              <button
                type="button"
                className="w-full py-2 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                onClick={() => (window.location.href = "/profile?incomplete=1")}
              >
                Go to Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 space-y-3 text-sm text-gray-700">
            <div>
              <span className="text-gray-500">Name:</span>{" "}
              {profile?.name || "-"}
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{" "}
              {profile?.email || "-"}
            </div>
            <div>
              <span className="text-gray-500">Phone:</span>{" "}
              {profile?.phone || "-"}
            </div>
            <div>
              <span className="text-gray-500">Address:</span>{" "}
              {[
                profile?.address,
                profile?.city,
                profile?.state || profile?.area,
                profile?.zip,
                (country || profile?.country || "").toUpperCase(),
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
            <button
              type="button"
              className="text-blue-600 hover:underline text-xs text-left"
              onClick={() => (window.location.href = "/profile")}
            >
              Edit full address in Profile
            </button>
          </div>
        )}

        {/* Payment method toggle */}
        <div className="mb-6">
          <h1 className="font-bold text-[16px] text-gray-700">
            Payment Method
          </h1>
          <div className="flex gap-6 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="card"
                checked={paymentMethod === "card"}
                onChange={() => setPaymentMethod("card")}
              />
              Card Payment
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={() => setPaymentMethod("cod")}
              />
              Cash on Delivery
            </label>
          </div>
        </div>

        <form
          onSubmit={handlePay}
          className="flex-1 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-6">
            {/* Card form only if card selected */}
            {paymentMethod === "card" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <CardNumberElement
                    options={{ style: elementStyles }}
                    className={elementClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <CardExpiryElement
                      options={{ style: elementStyles }}
                      className={elementClass}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      CVC
                      <button
                        type="button"
                        onClick={() => setShowCvcHelp(!showCvcHelp)}
                        className="ml-1 text-gray-400 hover:text-gray-600"
                      >
                        <HelpCircle size={16} />
                      </button>
                    </label>
                    <CardCvcElement
                      options={{ style: elementStyles }}
                      className={elementClass}
                    />

                    {showCvcHelp && (
                      <>
                        {/* Mobile modal */}
                        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                          <div className="bg-white rounded-xl shadow-xl p-5 w-80 max-w-[90%] relative">
                            <h3 className="text-lg font-semibold mb-2">
                              What is CVC?
                            </h3>
                            <p className="mb-3 text-gray-700 text-sm">
                              The CVC is a 3-digit code on the back of your card
                            </p>
                            <button
                              onClick={() => setShowCvcHelp(false)}
                              type="button"
                              className="w-full py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
                            >
                              Close
                            </button>
                          </div>
                        </div>

                        {/* Desktop tooltip */}
                        <div className="hidden lg:block absolute left-0 top-full mt-2 z-50">
                          <div
                            onMouseLeave={() => setShowCvcHelp(false)}
                            className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm w-64"
                          >
                            <p className="text-gray-700">
                              The CVC is a 3-digit code on the back of your card
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="text-red-600 bg-red-50 border border-red-300 px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Button */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={
                processing ||
                disabled ||
                loadingProfile ||
                profileIncomplete ||
                (paymentMethod === "card" && (!stripe || !elements))
              }
              className="w-full py-3 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow disabled:opacity-50"
            >
              {processing
                ? "Processing..."
                : paymentMethod === "cod"
                  ? "Place COD Order"
                  : `Pay €${amount}`}
            </button>

            <div className="flex flex-col items-center text-xs text-gray-500 space-y-2">
              <div className="flex items-center gap-1">
                <Lock size={14} /> Secure payment. SSL encrypted.
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StripeCheckoutModal;
