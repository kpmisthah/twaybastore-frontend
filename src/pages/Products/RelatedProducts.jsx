import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { Link } from "react-router-dom";

function getRandomItems(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// Format Euro currency
function formatEuro(amount) {
  if (!amount) return "€0.00";
  return `€${Number(amount).toFixed(2)}`;
}

const RelatedProducts = ({ productId }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch related products
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchRelated = async () => {
      try {
        const res = await axios.get(`${BASE_URL}products/${productId}/related`);
        if (isMounted && res.data && res.data.length > 0) {
          setRelated(res.data);
        } else {
          const allRes = await axios.get(`${BASE_URL}products?limit=1000`);
          // Handle paginated response
          const productsData = allRes.data.products || allRes.data;
          const data = Array.isArray(productsData) ? productsData : [];
          const filtered = data.filter((p) => p._id !== productId);
          setRelated(getRandomItems(filtered, 8));
        }
      } catch (error) {
        console.error("Failed to fetch related products:", error);
        try {
          const allRes = await axios.get(`${BASE_URL}products?limit=1000`);
          // Handle paginated response
          const productsData = allRes.data.products || allRes.data;
          const data = Array.isArray(productsData) ? productsData : [];
          const filtered = data.filter((p) => p._id !== productId);
          setRelated(getRandomItems(filtered, 8));
        } catch (err) {
          console.error("Failed to fetch fallback products:", err);
          setRelated([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRelated();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading)
    return (
      <div className="flex justify-center items-center my-12">
        <span className="animate-pulse text-lg text-gray-400">
          Loading related products…
        </span>
      </div>
    );
  if (!related.length)
    return (
      <div className="flex justify-center items-center my-12">
        <span className="text-gray-400">No related products found.</span>
      </div>
    );

  return (
    <section className="w-full max-w-8xl mx-auto mt-12">
      <h2 className="text-2xl mb-8 text-gray-800 tracking-tight">
        Related Products
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-8">
        {related.map((item) => (
          <Link
            to={`/product/${item._id}`}
            key={item._id}
            className="group"
            aria-label={item.name}
          >
            <div className="bg-white transition-shadow duration-200 flex flex-col items-center p-5 min-h-[320px] h-full border border-gray-200 group-hover:scale-[1.03] group-hover:-translate-y-1 transition-transform ease-out cursor-pointer">
              {/* Product image */}
              <div className="w-36 h-28 flex items-center justify-center bg-white rounded-xl mb-4 overflow-hidden">
                <img
                  src={item.images?.[0] || "/default-product.png"}
                  alt={item.name}
                  className="max-h-24 object-contain transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              {/* Badges */}
              <div className="flex gap-2 mb-2 w-full">
                {item.discount && (
                  <span className="bg-blue-600/90 text-white text-xs px-2 py-1 rounded font-semibold shadow-sm">
                    {item.discount}% OFF
                  </span>
                )}
                {item.limitedTimeDeal && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold">
                    Limited Time
                  </span>
                )}
              </div>
              {/* Product Name */}
              <div className="font-semibold text-gray-900 w-full mb-1 leading-snug line-clamp-2 text-base min-h-[2.8em]">
                {item.name}
              </div>
              <div className="text-gray-500 border-t border-gray-300 text-[12px] w-full mb-1 pt-2 leading-snug text-base min-h-[2.8em]">
                {item.description.length > 40
                  ? item.description.slice(0, 40) + "..."
                  : item.description}
              </div>
              {/* Price */}
              <div className="mt-auto w-full flex items-end justify-between">
                <span className="text-lg font-bold text-gray-800">
                  {formatEuro(item.price)}
                </span>
                {item.oldPrice && (
                  <span className="text-xs line-through text-gray-400 ml-2">
                    {formatEuro(item.oldPrice)}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
