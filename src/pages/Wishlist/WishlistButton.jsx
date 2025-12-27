// src/components/WishlistButton.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import axios from "axios";
import BASE_URL from "../../api/config";

export default function WishlistButton({
  productId,
  color = null,
  dimensions = null,
  size = "sm",
  className = "",
  onChange, // optional callback(items)
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isIn, setIsIn] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), []);

  useEffect(() => {
    if (!token || !productId) return;
    axios
      .get(`${BASE_URL}wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        const items = res.data || [];
        const match = items.some((i) => {
          const p = i.product?._id || i.product; // populated or raw
          return (
            p === productId &&
            (i.color || null) === (color || null) &&
            (i.dimensions || null) === (dimensions || null)
          );
        });
        setIsIn(match);
      })
      .catch(() => {});
  }, [token, productId, color, dimensions]);

  const toggle = async () => {
    if (!token) return navigate("/login");
    setLoading(true);
    try {
      if (isIn) {
        const res = await axios.delete(`${BASE_URL}wishlist`, {
          params: { productId, color, dimensions },
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsIn(false);
        onChange?.(res.data?.items || []);
      } else {
        const res = await axios.post(
          `${BASE_URL}wishlist`,
          { productId, color, dimensions },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsIn(true);
        onChange?.(res.data?.items || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = size === "lg" ? "px-3 py-2 text-sm" : "px-2.5 py-1.5 text-xs";
  return (
    <button
      onClick={toggle}
      disabled={loading || !productId}
      aria-label={isIn ? "Remove from wishlist" : "Save to wishlist"}
      className={`inline-flex items-center gap-1.5 rounded-full border transition
      ${isIn ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"}
      ${sizeClasses} ${className}`}
    >
      <Heart size={size === "lg" ? 18 : 16} className={isIn ? "fill-current" : ""} />
      <span className="font-medium">{isIn ? "Saved" : "Save"}</span>
    </button>
  );
}
