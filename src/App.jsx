import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import WithNavbar from "./routes/WithNavbar";
import WithoutNavbar from "./routes/WithoutNavbar";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Carts from "./pages/Cart/Carts";
import Orders from "./pages/Orders/Orders";
import Products from "./pages/Products/Products";
import Productdetail from "./pages/Products/Productdetail";
import Terms from "./pages/Privacy/Terms.jsx";
import Cancellation from "./pages/Privacy/Cancellation.jsx";
import Privacy from "./pages/Privacy/Privacy.jsx";
import About from "./pages/About/About.jsx";
import Careers from "./pages/Support/Careers.jsx";
import Contact from "./pages/Support/Contact.jsx";
import Help from "./pages/Support/Help.jsx";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import NotFound from "./pages/NotFound.jsx";
import ResetPassword from "./pages/Auth/ResetPassowrd.jsx";
import { Toaster } from "react-hot-toast";
import Wishlist from "./pages/Wishlist/Wishlist.jsx";
import WhatsAppButton from "./components/WhatsAppButton.jsx";
import usePageTracking from "./hooks/usePageTracking.jsx";
import Banned from "./pages/Banned/Banned.jsx";
import VERY_BASE_URL from "./api/veryBase.js";
import Christmas from "./pages/Products/Christmas.jsx";
import { useMemo } from "react";

const App = () => {
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const [checkingBan, setCheckingBan] = useState(true);
  const navigate = useNavigate();

  const loadingMessages = [
    "Verifying your account securely 🔒",
    "Getting things ready for you ⚡",
    "Just a moment... loading Twayba magic ✨",
    "Optimizing your shopping experience 🛍️",
  ];

  const randomMsg = useMemo(
    () => loadingMessages[Math.floor(Math.random() * loadingMessages.length)],
    []
  );

  usePageTracking();

  /* 🔐 Check if logged-in user is banned */
  useEffect(() => {
    const checkBanStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setCheckingBan(false);

        const res = await axios.get(`${VERY_BASE_URL}/api/users/status/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data?.isBanned) {
          localStorage.clear();
          navigate("/banned", { state: { reason: res.data.banReason } });
        }
      } catch (err) {
        if (err.response?.data?.banned) {
          localStorage.clear();
          navigate("/banned", { state: { reason: err.response.data.reason } });
        }
      } finally {
        setCheckingBan(false);
      }
    };

    checkBanStatus();
  }, [navigate]);

  if (checkingBan)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 transition-all">
        {/* Logo or brand name */}
        <div className="text-3xl font-bold mb-4 animate-pulse tracking-wide">
          Twayba
        </div>

        {/* Fancy spinner */}
        <div className="relative w-14 h-14 mb-4">
          <div className="absolute w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>

        {/* Subtext */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {randomMsg}
        </p>

        {/* Optional progress bar */}
        <div className="w-40 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 overflow-hidden">
          <div className="h-full bg-blue-500 animate-[progress_2s_ease-in-out_infinite]"></div>
        </div>

        <style>
          {`
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 80%; }
            100% { width: 0%; }
          }
        `}
        </style>
      </div>
    );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        {/* Navbar pages */}
        <Route element={<WithNavbar />}>
          <Route path="/" element={<Home />} />

          {/* Protected routes WITH navbar */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/Contact"
            element={
              <ProtectedRoute>
                <Contact />
              </ProtectedRoute>
            }
          />

          <Route
            path="/carts"
            element={
              <Elements stripe={stripePromise}>
                <Carts />
              </Elements>
            }
          />

          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/products" element={<Products />} />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/product/:id"
            element={
              <Elements stripe={stripePromise}>
                <Productdetail />
              </Elements>
            }
          />

          <Route path="/Christmas" element={<Christmas />} />

          <Route path="/terms-of-use" element={<Terms />} />
          <Route path="/Privacy" element={<Privacy />} />
          <Route path="/Cancellation" element={<Cancellation />} />
          <Route path="/About-twayba-group" element={<About />} />
          <Route path="/CareersAtTwaybaGroup" element={<Careers />} />
        </Route>

        {/* Auth pages WITHOUT navbar */}
        <Route element={<WithoutNavbar />}>
          <Route
            path="/Help"
            element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/banned" element={<Banned />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>

      {/* ✅ WhatsApp floating button */}
      <WhatsAppButton />
    </>
  );
};

export default App;
