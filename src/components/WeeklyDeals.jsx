// // WeeklyDeals.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import BASE_URL from "../api/config";
// import { Link, useNavigate } from "react-router-dom";
// import { ShoppingCart, Star, StarHalf } from "lucide-react";

// const FALLBACK_IMG = "/default-product.png";
// const SKELETON_COUNT = 8;

// const eur = new Intl.NumberFormat("en-IE", {
//   style: "currency",
//   currency: "EUR",
// });

// function formatPrice(v) {
//   const n = Number(v);
//   return Number.isNaN(n) ? "€0.00" : eur.format(n);
// }

// function deriveOldPrice(product) {
//   const { price, realPrice, discount } = product ?? {};
//   const p = Number(price);
//   const rp = Number(realPrice);
//   const d = Number(discount);
//   if (!Number.isNaN(rp) && rp > p) return rp;
//   if (!Number.isNaN(d) && d > 0 && d < 100 && !Number.isNaN(p))
//     return +(p / (1 - d / 100)).toFixed(2);
//   return null;
// }

// function deriveDiscount(product) {
//   const { price, realPrice, discount } = product ?? {};
//   const p = Number(price);
//   const rp = Number(realPrice);
//   const d = Number(discount);
//   if (!Number.isNaN(d) && d > 0 && d < 100) return Math.round(d);
//   if (!Number.isNaN(rp) && rp > p) return Math.round(((rp - p) / rp) * 100);
//   return 0;
// }

// function ProductSkeleton() {
//   return (
//     <div className="bg-white border border-gray-200 animate-pulse">
//       <div className="aspect-[1/1] bg-gray-100" />
//       <div className="p-3 space-y-2">
//         <div className="h-4 w-3/4 bg-gray-200" />
//         <div className="h-4 w-1/2 bg-gray-200" />
//         <div className="h-6 w-full bg-gray-200" />
//       </div>
//     </div>
//   );
// }

// export default function WeeklyDeals() {
//   const [products, setProducts] = useState([]);
//   const [ratings, setRatings] = useState({});
//   const [sales, setSales] = useState({});
//   const [state, setState] = useState({ loading: true, error: null });
//   const navigate = useNavigate();

//   /* Fetch Weekly Deals */
//   useEffect(() => {
//     (async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}products`);
//         const list = Array.isArray(res?.data) ? res.data : [];
//         const deals = list.filter((p) => p?.weeklyDeal);
//         setProducts(deals);
//         setState({ loading: false, error: null });

//         // Fetch ratings and sales for each deal
//         for (const deal of deals) {
//           try {
//             const r = await axios.get(`${BASE_URL}products/${deal._id}/reviews`);
//             const reviews = r.data || [];
//             if (reviews.length > 0) {
//               const avg =
//                 reviews.reduce((sum, rev) => sum + (rev.rating || 0), 0) /
//                 reviews.length;
//               setRatings((prev) => ({
//                 ...prev,
//                 [deal._id]: { avg, count: reviews.length },
//               }));
//             } else {
//               setRatings((prev) => ({
//                 ...prev,
//                 [deal._id]: { avg: null, count: 0 },
//               }));
//             }
//           } catch {
//             setRatings((prev) => ({
//               ...prev,
//               [deal._id]: { avg: null, count: 0 },
//             }));
//           }

//           // Fetch total sold (mock or analytics API)
//           try {
//             const salesRes = await axios.get(
//               `${BASE_URL}analytics/product-sales/${deal._id}`
//             );
//             setSales((prev) => ({
//               ...prev,
//               [deal._id]: salesRes.data?.totalSold || 0,
//             }));
//           } catch {
//             setSales((prev) => ({ ...prev, [deal._id]: 0 }));
//           }
//         }
//       } catch {
//         setProducts([]);
//         setState({ loading: false, error: "Failed to load weekly deals." });
//       }
//     })();
//   }, []);

//   /* Add to Cart */
//   const handleAddToCart = (product) => {
//     const cart = JSON.parse(localStorage.getItem("cart") || "[]");
//     const variant = product?.variants?.[0] || null;
//     if (!variant) return alert("Variant unavailable.");

//     const cartKey =
//       product._id + "_" + (variant.color || "default") + "_" + (variant.dimensions || "");
//     const stock = variant.stock || 0;
//     if (stock <= 0) return alert("Out of stock!");

//     const existing = cart.find((item) => item.cartKey === cartKey);
//     if (existing) {
//       if (existing.qty + 1 > stock) {
//         alert("Cannot add more than available stock.");
//         return;
//       }
//       existing.qty += 1;
//     } else {
//       cart.push({
//         _id: product._id,
//         name: product.name,
//         price: variant.price ?? product.price,
//         realPrice: variant.realPrice ?? product.realPrice,
//         discount: variant.discount ?? product.discount,
//         color: variant.color || "default",
//         dimensions: variant.dimensions || null,
//         image: variant.images?.[0] || product.images?.[0],
//         qty: 1,
//         cartKey,
//       });
//     }
//     localStorage.setItem("cart", JSON.stringify(cart));
//     navigate("/carts");
//   };

//   /* Render Stars */
//   const renderStars = (avg, count) => {
//     if (!avg) {
//       return (
//         <div className="flex items-center gap-0.5">
//           {Array.from({ length: 5 }).map((_, i) => (
//             <Star key={i} size={12} className="text-gray-300" />
//           ))}
//           <span className="text-xs text-gray-400 ml-1">(No ratings)</span>
//         </div>
//       );
//     }
//     const full = Math.floor(avg);
//     const half = avg - full >= 0.5;
//     return (
//       <div className="flex items-center gap-0.5">
//         {Array.from({ length: full }).map((_, i) => (
//           <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
//         ))}
//         {half && <StarHalf size={12} className="text-yellow-400 fill-yellow-400" />}
//         {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
//           <Star key={`empty-${i}`} size={12} className="text-gray-300" />
//         ))}
//         <span className="text-xs text-gray-500 ml-1">
//           {avg.toFixed(1)} ({count})
//         </span>
//       </div>
//     );
//   };

//   /* Content */
//   const content = useMemo(() => {
//     if (state.loading)
//       return (
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//           {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
//             <ProductSkeleton key={i} />
//           ))}
//         </div>
//       );

//     if (state.error)
//       return (
//         <div className="text-center py-8 text-gray-500">
//           {state.error}
//           <div>
//             <button
//               onClick={() => window.location.reload()}
//               className="mt-3 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       );

//     if (!products.length)
//       return (
//         <div className="border border-gray-200 bg-white p-8 text-center text-gray-500">
//           No weekly deals yet. Check back soon!
//         </div>
//       );

//     return (
//       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
//         {products.map((product) => {
//           const discountPct = deriveDiscount(product);
//           const oldPrice = deriveOldPrice(product);
//           const saveAmt = oldPrice ? (oldPrice - product.price).toFixed(2) : null;
//           const rating = ratings[product._id] || { avg: null, count: 0 };
//           const totalSold = sales[product._id] || 0;

//           const fastDeliveryDate = new Date(Date.now() + 1 * 86400000).toLocaleDateString(
//             "en-GB",
//             { day: "numeric", month: "short" }
//           );

//           return (
//             <div
//               key={product._id}
//               className="bg-white border border-gray-200 overflow-hidden flex flex-col transition-all rounded-sm"
//             >
//               <Link
//                 to={`/product/${product._id}`}
//                 className="aspect-[1/1] bg-gray-50 flex items-center justify-center overflow-hidden"
//               >
//                 <img
//                   src={product.images?.[0] || FALLBACK_IMG}
//                   alt={product.name}
//                   loading="lazy"
//                   decoding="async"
//                   className="h-full w-full object-contain transition-transform"
//                   onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
//                 />
//               </Link>

//               <div className="p-3 flex flex-col flex-grow">
//                 <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
//                   {product.name}
//                 </h4>

//                 {/* ⭐ Rating */}
//                 <div className="mt-1">{renderStars(rating.avg, rating.count)}</div>

//                 {/* 🛒 Sales Info */}
//                 {totalSold > 0 && (
//                   <p className="text-xs text-gray-500 mt-0.5">
//                     {totalSold > 1000
//                       ? `${(totalSold / 1000).toFixed(1)}K+`
//                       : totalSold}{" "}
//                     bought in past month
//                   </p>
//                 )}

//                 {/* 💰 Price */}
//                 <div className="mt-1">
//                   <span className="text-base font-semibold text-gray-900">
//                     {formatPrice(product.price)}
//                   </span>
//                   {oldPrice && (
//                     <span className="text-xs text-gray-400 line-through ml-2">
//                       {formatPrice(oldPrice)}
//                     </span>
//                   )}
//                   {discountPct > 0 && (
//                     <span className="text-xs text-green-600 ml-1">
//                       ({discountPct}% off)
//                     </span>
//                   )}
//                 </div>

//                 {/* 🚚 Delivery Info */}
//                 <div className="mt-2 space-y-0.5 mb-2 text-[12px]">
//                   <p className="text-gray-500">
//                     Fastest delivery{" "}
//                     <span className="font-semibold text-gray-700">
//                       Tomorrow, {fastDeliveryDate}
//                     </span>
//                   </p>
//                 </div>

//                 {/* 🛒 Add to Cart */}
//                 <button
//                   onClick={() => handleAddToCart(product)}
//                   className="w-[120px] mt-auto flex hover:cursor-pointer rounded-full items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-gray-300 font-medium py-2 text-xs sm:text-sm transition-all"
//                 >
//                   Add to Cart
//                 </button>
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     );
//   }, [products, ratings, sales, state.loading, state.error]);

//   return (
//     <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
//       <header className="mb-4 flex items-center justify-between">
//         <h3 className="text-lg font-semibold text-gray-900">Best Weekly Deals</h3>
//         <Link
//           to="/products"
//           className="text-blue-600 text-sm font-medium hover:underline"
//         >
//           View all →
//         </Link>
//       </header>
//       {content}
//     </section>
//   );
// }

// WeeklyDeals.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BASE_URL from "../api/config";
import { Link, useNavigate } from "react-router-dom";
import { Star, StarHalf, Clock, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";

const FALLBACK_IMG = "/default-product.png";
const eur = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

function formatPrice(v) {
  const n = Number(v);
  return Number.isNaN(n) ? "€0.00" : eur.format(n);
}

function deriveOldPrice(product) {
  const { price, realPrice, discount } = product ?? {};
  const p = Number(price);
  const rp = Number(realPrice);
  const d = Number(discount);
  if (!Number.isNaN(rp) && rp > p) return rp;
  if (!Number.isNaN(d) && d > 0 && d < 100 && !Number.isNaN(p))
    return +(p / (1 - d / 100)).toFixed(2);
  return null;
}

function deriveDiscount(product) {
  const { price, realPrice, discount } = product ?? {};
  const p = Number(price);
  const rp = Number(realPrice);
  const d = Number(discount);
  if (!Number.isNaN(d) && d > 0 && d < 100) return Math.round(d);
  if (!Number.isNaN(rp) && rp > p) return Math.round(((rp - p) / rp) * 100);
  return 0;
}

function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex items-center gap-1 text-xs text-red-600 font-medium mt-1">
      <Clock size={12} />
      Offer ends in {timeLeft}
    </div>
  );
}

export default function WeeklyDeals() {
  const [products, setProducts] = useState([]);
  const [state, setState] = useState({ loading: true, error: null });
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}products`);
        const list = Array.isArray(res?.data) ? res.data : [];
        const deals = list.filter((p) => p?.weeklyDeal);

        // Shuffle deals randomly
        const shuffled = deals.sort(() => Math.random() - 0.5);

        // Limit to 7 only
        const limited = shuffled.slice(0, 6);

        setProducts(limited);
        setState({ loading: false, error: null });
      } catch {
        setProducts([]);
        setState({ loading: false, error: "Failed to load weekly deals." });
      }
    })();
  }, []);

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const variant = product?.variants?.[0] || null;
    if (!variant) return toast("Variant unavailable.");

    const cartKey =
      product._id +
      "_" +
      (variant.color || "default") +
      "_" +
      (variant.dimensions || "");
    const stock = variant.stock || 0;
    if (stock <= 0) return toast("Out of stock!");

    const existing = cart.find((item) => item.cartKey === cartKey);
    if (existing) {
      if (existing.qty + 1 > stock)
        return toast("Cannot add more than available stock.");
      existing.qty += 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: variant.price ?? product.price,
        realPrice: variant.realPrice ?? product.realPrice,
        discount: variant.discount ?? product.discount,
        color: variant.color || "default",
        dimensions: variant.dimensions || null,
        image: variant.images?.[0] || product.images?.[0],
        qty: 1,
        cartKey,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/carts");
  };

  const renderStars = (avg, count) => {
    if (!avg) {
      return (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className="text-gray-300" />
          ))}
          <span className="text-xs text-gray-400 ml-1">(No ratings)</span>
        </div>
      );
    }
    const full = Math.floor(avg);
    const half = avg - full >= 0.5;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: full }).map((_, i) => (
          <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
        ))}
        {half && (
          <StarHalf size={12} className="text-yellow-400 fill-yellow-400" />
        )}
        {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
          <Star key={`empty-${i}`} size={12} className="text-gray-300" />
        ))}
        <span className="text-xs text-gray-500 ml-1">
          {avg.toFixed(1)} ({count})
        </span>
      </div>
    );
  };

  const offerEnd = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const content = useMemo(() => {
    if (state.loading)
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-md h-[400px]"
            />
          ))}
        </div>
      );

    if (state.error)
      return (
        <div className="text-center py-8 text-gray-500">
          {state.error}
          <div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Retry
            </button>
          </div>
        </div>
      );

    if (!products.length)
      return (
        <div className="border border-gray-200 bg-white p-8 text-center text-gray-500 rounded-md">
          No weekly deals yet. Check back soon!
        </div>
      );

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => {
          const discountPct = deriveDiscount(product);
          const oldPrice = deriveOldPrice(product);
          const rating = {
            avg: product.avgRating || null,
            count: product.reviewCount || 0,
          };

          return (
            <div
              key={product._id}
              className="bg-white border border-gray-200 rounded-md overflow-hidden flex flex-col h-[420px]"
            >
              {/* 🔴 Discount tag */}
              {discountPct > 0 && (
                <div className="absolute bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-br-sm">
                  {discountPct}% OFF
                </div>
              )}

              <Link
                to={`/product/${product._id}`}
                className="bg-gray-50 flex items-center justify-center h-[210px] border-b border-gray-100"
              >
                <img
                  src={product.images?.[0] || FALLBACK_IMG}
                  alt={product.name}
                  className="max-h-[180px] object-contain"
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                />
              </Link>

              <div className="flex flex-col justify-between flex-1 px-3 py-3">
                <div>
                  <h4 className="text-[13px] font-medium text-gray-900 leading-snug line-clamp-2 min-h-[38px]">
                    {product.name}
                  </h4>
                  <div className="mt-1">
                    {renderStars(rating.avg, rating.count)}
                  </div>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-[15px] font-semibold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    {oldPrice && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatPrice(oldPrice)}
                      </span>
                    )}
                  </div>

                  <Countdown endTime={offerEnd} />
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-3 flex items-center justify-center gap-1 bg-blue-600 text-white hover:cursor-pointer text-xs py-2"
                >
                  <ShoppingCart size={14} />
                  Add to Cart
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [products, state.loading, state.error]);

  return (
    <section className="max-w-[1810px] mx-auto px-3 sm:px-6 lg:px-8 py-8">
      <header className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
          🔥 Weekly Deals
        </h3>
        <Link
          to="/products?category=discount"
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          View all →
        </Link>
      </header>
      {content}
    </section>
  );
}
