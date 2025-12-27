// src/pages/Wishlist.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";

const findVariant = (product, color, dimensions) => {
  if (!product?.variants?.length) return null;
  return product.variants.find(
    (v) =>
      (v.color || "").toLowerCase() === (color || "").toLowerCase() &&
      (v.dimensions || "") === (dimensions || "")
  );
};

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const token = useMemo(() => localStorage.getItem("token"), []);
  const navigate = useNavigate();

  const fetchItems = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    const res = await axios.get(`${BASE_URL}wishlist`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setItems(res.data || []);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeItem = async (it) => {
    setBusy(true);
    try {
      const res = await axios.delete(`${BASE_URL}wishlist`, {
        params: { productId: it.product._id || it.product, color: it.color, dimensions: it.dimensions },
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data?.items || []);
    } finally {
      setBusy(false);
    }
  };

  const clearAll = async () => {
    setBusy(true);
    try {
      const res = await axios.delete(`${BASE_URL}wishlist/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data?.items || []);
    } finally {
      setBusy(false);
    }
  };

  const moveToCart = (it) => {
    const product = it.product;
    if (!product) return;

    const variant = findVariant(product, it.color, it.dimensions);
    const currPrice = variant?.price ?? product.price ?? 0;
    const realPrice = variant?.realPrice ?? product.realPrice ?? 0;
    const image = variant?.images?.[0] || product.images?.[0] || "/default-product.png";

    const cartKey =
      (product._id || product) + "_" + (it.color || "") + "_" + (it.dimensions || "");
    const stored = localStorage.getItem("cart");
    const cart = stored ? JSON.parse(stored) : [];

    const existing = cart.find((c) => c.cartKey === cartKey);
    if (existing) {
      existing.qty = Math.min((existing.qty || 1) + 1, 99);
    } else {
      cart.push({
        _id: product._id || product,
        name: product.name,
        price: currPrice,
        realPrice,
        discount: product.discount ?? 0,
        color: it.color,
        dimensions: it.dimensions,
        image,
        qty: 1,
        cartKey,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/carts");
  };

  if (!items.length)
    return (
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Wishlist</h1>
        <div className="rounded-md border border-gray-200 p-8 text-center text-gray-600">
          Your wishlist is empty. <Link to="/products" className="text-blue-600 underline">Browse products</Link>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Wishlist</h1>
        <button
          onClick={clearAll}
          disabled={busy}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50"
        >
          Clear all
        </button>
      </div>

      <ul className="divide-y divide-gray-200 bg-white rounded-md border border-gray-200">
        {items.map((it, idx) => {
          const product = it.product || {};
          const variant = findVariant(product, it.color, it.dimensions);
          const price = variant?.price ?? product.price ?? 0;
          const realPrice = variant?.realPrice ?? product.realPrice ?? 0;
          const image = variant?.images?.[0] || product.images?.[0] || "/default-product.png";

          return (
            <li key={idx} className="p-4 flex items-center gap-4">
              <Link to={`/products/${product._id}`} className="shrink-0">
                <img
                  src={image}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded border"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link to={`/products/${product._id}`}>
                  <h3 className="font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                </Link>
                <p className="text-sm text-gray-600">
                  {it.color && <span className="mr-3">Color: <b>{it.color}</b></span>}
                  {it.dimensions && <span>Size: <b>{it.dimensions}</b></span>}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {realPrice > price && (
                    <span className="text-gray-400 line-through text-sm">€{Number(realPrice).toFixed(2)}</span>
                  )}
                  <span className="font-semibold">€{Number(price).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => moveToCart(it)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                >
                  <ShoppingCart size={16} /> Add to cart
                </button>
                <button
                  onClick={() => removeItem(it)}
                  disabled={busy}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-sm"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Wishlist;
