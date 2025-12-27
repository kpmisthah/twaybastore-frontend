import React, { useState, useEffect, useRef } from "react";
import { Search, User, ShoppingCart, Package, Mic, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../api/config";
import { FaHeadset } from "react-icons/fa";
import toast from "react-hot-toast";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [listening, setListening] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const popupRef = useRef(null);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();

  // ------------------ NEW AI SEARCH STATES ------------------
  const [suggestions, setSuggestions] = useState([]);
  const [recent, setRecent] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Load recent search history
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
    setRecent(saved);
  }, []);

  // Click outside dropdown to close
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        e.target.tagName !== "INPUT"
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch AI suggestions
  const fetchSuggestions = async (q) => {
    const query = q.trim().toLowerCase();
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await axios.get(
        `${BASE_URL}products/suggestions?q=${encodeURIComponent(query)}`
      );

      if (res.data.success) {
        // 🔥 FILTER: match ONLY product title
        const titleOnly = (res.data.suggestions || []).filter((p) =>
          p.name?.toLowerCase().includes(query)
        );

        setSuggestions(titleOnly);
      }
    } catch (err) {
      console.log("Suggestion error:", err);
    }
  };

  // Submit search (AI + recent history)
  const submitSearch = (q) => {
    const clean = q.trim();
    if (!clean) return;

    const updated = [clean, ...recent.filter((r) => r !== clean)].slice(0, 8);
    setRecent(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));

    setShowDropdown(false);

    // 🔥 ADD titleOnly flag
    navigate(`/products?q=${encodeURIComponent(clean)}&titleOnly=true`);
  };
  // -----------------------------------------------------------

  // --- auth bootstrap ---
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await axios.get(`${BASE_URL}auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // --- cart count sync ---
  useEffect(() => {
    const getCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0));
    };
    getCartCount();
    window.addEventListener("storage", getCartCount);
    window.addEventListener("cartUpdated", getCartCount);
    return () => {
      window.removeEventListener("storage", getCartCount);
      window.removeEventListener("cartUpdated", getCartCount);
    };
  }, []);

  // --- popup close ---
  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setPopupOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // --- cleanup voice recognition ---
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // -------- TEXT SEARCH --------
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") submitSearch(search);
  };

  // -------- VOICE SEARCH --------
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast("Voice search not supported");
      return;
    }

    if (recognitionRef.current) recognitionRef.current.abort();

    const rec = new SR();
    recognitionRef.current = rec;

    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    setListening(true);

    rec.onresult = (e) => {
      const result = e?.results?.[0]?.[0];
      const t = result?.transcript ?? "";
      setSearch(t);
      setListening(false);
      submitSearch(t);
    };

    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    rec.start();
  };

  return (
    <header className="border-b border-gray-300 bg-white sticky top-0 z-50">
      <div className="max-w-[1810px] mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-2 h-auto sm:h-22 px-4 py-3 sm:py-0">
        {/* LOGO */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src="/emailLogo.png" className="w-auto h-8 sm:h-8" />
          </Link>

          {/* MOBILE SUPPORT BUTTONS */}
          <div className="sm:hidden flex items-center gap-3 ml-3">
            <a
              href="https://wa.me/+35699139639"
              target="_blank"
              className="flex items-center justify-center bg-[#213C74] text-white p-3 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.486 2 2 6.201 2 11.5c0 2.03.701 3.911 1.878 5.414L2 22l5.29-1.62C8.905 21.395 10.419 22 12 22c5.514 0 10-4.201 10-9.5S17.514 2 12 2z" />
              </svg>
            </a>

            <Link
              to="/help"
              className="flex items-center justify-center bg-[#00BDF5] text-white p-3 rounded-full"
            >
              <FaHeadset className="text-[22px]" />
            </Link>
          </div>
        </div>

        {/* ------------------ DESKTOP SEARCH BAR ------------------ */}
        <div className="flex-1 w-full sm:w-auto mx-0 sm:mx-8 hidden sm:block">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input
              type="text"
              value={search}
              onChange={(e) => {
                const v = e.target.value;
                setSearch(v);
                fetchSuggestions(v);
                setShowDropdown(true);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search for anything"
              className="w-full pl-12 pr-12 py-2 border border-gray-400 rounded-full bg-gray-100 text-black"
            />

            {/* VOICE MIC */}
            <button
              type="button"
              onClick={startListening}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100"
            >
              <Mic
                className={`${
                  listening ? "text-blue-600 animate-pulse" : "text-gray-500"
                } w-5 h-5`}
              />
            </button>

            {/* ------------------ AI DROPDOWN ------------------ */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute mt-2 w-full bg-white shadow-xl rounded-xl border border-gray-200 z-[9999] max-h-96 overflow-y-auto"
              >
                {/* Recent Searches */}
                {recent.length > 0 && (
                  <div className="p-3 border-b">
                    <p className="text-xs text-gray-500 font-semibold mb-1">
                      Recent Searches
                    </p>
                    {recent.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => submitSearch(item)}
                        className="py-1 px-2 text-sm cursor-pointer hover:bg-gray-100 rounded"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions */}
                <div className="p-3">
                  {suggestions.length > 0 ? (
                    <>
                      <p className="text-xs text-gray-500 font-semibold mb-1">
                        Suggestions
                      </p>

                      {suggestions.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setShowDropdown(false);
                            navigate(`/product/${s.slug}`);
                          }}
                          className="flex items-center gap-3 py-2 px-3 cursor-pointer hover:bg-gray-100 rounded transition"
                        >
                          <img
                            src={s.image}
                            alt={s.name}
                            className="w-10 h-10 border rounded object-cover flex-shrink-0"
                          />

                          <span className="text-sm font-medium text-gray-800">
                            {s.name}
                          </span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-xs text-gray-400">No suggestions</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ------------------ NAV LINKS ------------------ */}
        <div className="hidden sm:flex items-center gap-6 min-w-max relative">
          <div
            className="flex items-center gap-1 cursor-pointer relative"
            onClick={() => setPopupOpen(!popupOpen)}
          >
            <User className="w-6 h-6" />
            <span className="text-sm font-medium text-blue-600 hover:underline">
              {user ? user.fullName?.split(" ")[0] : "Login"}
            </span>

            {popupOpen && (
              <div
                ref={popupRef}
                className="absolute top-10 right-0 bg-white shadow-lg border rounded-md p-3 w-40 z-50"
              >
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      className="block py-1 hover:text-blue-600"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block py-1 w-full text-left text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block py-1 hover:text-blue-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block py-1 hover:text-blue-600"
                    >
                      Signup
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            to="/carts"
            className="flex items-center gap-1 text-black hover:text-blue-600 relative"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold absolute -top-2 -right-4">
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/orders"
            className="flex items-center gap-1 text-black hover:text-blue-600"
          >
            <Package className="w-6 h-6" />
          </Link>

          <Link
            to="/wishlist"
            className="flex items-center gap-1 text-black hover:text-blue-600"
          >
            <Heart className="w-6 h-6" />
          </Link>
        </div>

        {/* ------------------ MOBILE SEARCH ------------------ */}
        <div className="w-full sm:hidden mt-2">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#213C74] w-5 h-5" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search products"
              className="w-full pl-12 pr-12 py-2 border border-blue-400 rounded-full bg-white text-black"
            />

            <button
              type="button"
              onClick={startListening}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full"
            >
              <Mic
                className={`${
                  listening ? "text-blue-600 animate-pulse" : "text-[#213C74]"
                } w-5 h-5`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* VOICE SEARCH MODAL */}
      {listening && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative w-full h-[32vh] bg-white rounded-t-2xl shadow-2xl flex flex-col items-center justify-center pb-16">
            <button
              onClick={() => {
                recognitionRef.current?.abort();
                setListening(false);
              }}
              className="absolute top-4 right-5 text-gray-500 hover:text-red-600"
            >
              ✕ Cancel
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-ping"></div>
              <div className="absolute inset-0 rounded-full bg-blue-500 opacity-40 animate-ping delay-150"></div>
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-blue-600">
                <Mic className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>

            <p className="text-lg font-semibold text-[#213C74] animate-pulse">
              Listening... Speak now
            </p>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
