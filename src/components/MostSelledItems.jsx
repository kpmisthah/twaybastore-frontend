import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../api/config";
import { Link } from "react-router-dom";

const SKELETON_COUNT = 8;

function ProductSkeleton() {
  return (
    <div className="relative bg-gray-100 border border-gray-200 animate-pulse rounded-md flex flex-col w-full min-h-[320px]">
      <div className="absolute top-4 right-4 h-7 w-20 bg-gray-200 rounded-full" />
      <div className="flex items-center justify-center h-36 sm:h-44 bg-gray-200 rounded-t-md">
        <div className="h-20 sm:h-24 w-20 sm:w-24 bg-gray-300 rounded" />
      </div>
      <div className="p-4 sm:p-6 flex flex-col gap-2 min-w-0">
        <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
        <div className="flex items-center gap-3 mt-auto">
          <div className="h-5 w-12 bg-gray-200 rounded" />
          <div className="h-4 w-8 bg-gray-100 rounded" />
        </div>
        <div className="mt-4 h-8 w-full bg-gray-200 rounded-md" />
      </div>
    </div>
  );
}

const MostSelledItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}analytics/top-products?limit=12`)
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = items.filter((p) => p.totalSold > 100);

  return (
    <section className="max-w-7xl mx-auto w-full px-8 sm:px-4 py-12">
      <h3 className="text-[20px] font-[500] text-black mb-8 text-left">
        Most Sold Items
      </h3>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: SKELETON_COUNT }).map((_, idx) => (
            <ProductSkeleton key={idx} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center text-gray-400">No high-selling items yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredItems.map((p) => {
            const showOld = p.realPrice && p.realPrice > p.price;
            const oldPrice = showOld
              ? p.realPrice
              : p.discount > 0
              ? (p.price / (1 - p.discount / 100)).toFixed(2)
              : null;

            return (
              <Link
                key={p.productId}
                to={`/product/${p.productId}`}
                className="relative bg-white border border-gray-300 overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col w-full hover:scale-[1.03] rounded-md"
                style={{ minHeight: 320 }}
              >
                {/* Sold count badge */}
                <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 shadow">
                  Sold: {p.totalSold}
                </div>

                {/* Discount badge (if any) */}
                {p.discount > 0 && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full z-10 shadow">
                    {p.discount}% OFF
                  </div>
                )}

                <div className="flex items-center justify-center h-36 sm:h-44 bg-white">
                  <img
                    src={p.images?.[0] || "/default-product.png"}
                    alt={p.name}
                    className="h-40 sm:h-40 object-contain"
                    loading="lazy"
                  />
                </div>

                <div className="p-4 sm:p-6 flex flex-col gap-1 min-w-0">
                  <h4 className="font-semibold text-base text-black truncate">
                    {p.name}
                  </h4>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 truncate">
                    {p.description || "Top selling pick this week!"}
                  </p>

                  <div className="flex items-center gap-3 mt-auto">
                    <span className="text-lg font-bold text-black">
                      €{Number(p.price).toFixed(2)}
                    </span>
                    {oldPrice && (
                      <span className="text-sm text-gray-400 line-through font-medium">
                        €{Number(oldPrice).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors w-full"
                    type="button"
                  >
                    View Product
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MostSelledItems;
