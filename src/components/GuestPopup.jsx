import { useEffect, useState } from "react";

export default function SignupOfferPopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("signup-offer-seen");
    const user = localStorage.getItem("user"); // 👈 check if logged in

    // Show only if:
    // 1. Popup not seen this session
    // 2. User is NOT logged in/signed up
    if (!seen && !user) {
      setShow(true);
      sessionStorage.setItem("signup-offer-seen", "true");
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70">
      <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-fadeIn">
        {/* Close button */}
        <button
          onClick={() => setShow(false)}
          className="absolute top-3 right-4 text-white/70 hover:text-white text-2xl"
        >
          ×
        </button>

        {/* Heading */}
        <h2 className="text-3xl font-extrabold mb-4">
          Get <span className="text-yellow-300">5% OFF</span>
        </h2>

        {/* Subheading */}
        <p className="text-lg font-medium mb-2">
          on your first order when you sign up today!
        </p>

        {/* Persuasive text */}
        <p className="text-white/80 mb-6">
          Join now and unlock exclusive discounts, early access to deals, and a smoother checkout experience.
        </p>

        {/* CTA Button */}
        <button
          onClick={() => {
            setShow(false);
            window.location.href = "/signup"; // redirect to signup page
          }}
          className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105"
        >
          Sign Up & Save
        </button>

        {/* Trust text */}
        <p className="mt-4 text-sm text-white/70">
          No spam. Just savings and exclusive offers for you.
        </p>
      </div>
    </div>
  );
}
