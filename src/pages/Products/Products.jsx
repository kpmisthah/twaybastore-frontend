import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import toast from "react-hot-toast";
import { getDisplayPrice } from "../../utils/priceUtils";
import { ChevronDown, Filter, LayoutGrid, List } from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SKELETON_COUNT = 10;

const CATEGORIES = [
  { name: "All", value: "" },
  { name: "Home & Kitchen", value: "Home & Kitchen" },
  { name: "Gadgets", value: "Gadgets" },
  { name: "Fitness", value: "Fitness" },
  { name: "Shelving", value: "Shelving" },
  { name: "Camping", value: "Camping" },
  { name: "Car Accessories", value: "Car Accessories" },
  { name: "Tools", value: "Tools" },
  { name: "Discount", value: "discount" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "A to Z", value: "name" },
  { label: "Z to A", value: "name-desc" },
];

function SkeletonProduct() {
  return (
    <div className="group bg-[#fafbfc] border border-gray-200 rounded-xl overflow-hidden animate-pulse flex flex-col w-full">
      <div className="relative w-full h-[180px] sm:h-[190px] flex items-center justify-center bg-gray-100">
        <div className="h-[90px] w-[90px] sm:h-[110px] sm:w-[110px] bg-gray-200 rounded-xl" />
        <div className="absolute left-2 bottom-2 flex gap-1">
          <div className="h-5 w-14 bg-gray-200 rounded-full" />
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
        </div>
      </div>
      <div className="flex-1 flex flex-col px-4 pt-3 pb-4">
        <div className="h-4 w-3/4 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-2/3 bg-gray-100 rounded mb-2" />
        <div className="mt-auto">
          <div className="h-5 w-16 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-12 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();
  const navigate = useNavigate();

  const searchTerm = query.get("q") || "";
  const category = query.get("category") || "";
  const weeklyDeal = query.get("weeklyDeal") || "";
  const [sort, setSort] = useState("newest");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    setLoading(true);

    let url = `${BASE_URL}products?limit=1000&sort=${sort}`;

    if (searchTerm) {
      url += `&q=${encodeURIComponent(searchTerm)}`;
    }

    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    if (weeklyDeal) {
      url += `&weeklyDeal=true`;
    }

    axios
      .get(url)
      .then((res) => {
        // Handle paginated response - products are in .products property
        const productsData = res.data.products || res.data;
        const data = Array.isArray(productsData) ? productsData : [];
        setProducts(data);
      })
      .catch((error) => {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [searchTerm, category, weeklyDeal, sort]);

  const handleProductClick = async (id) => {
    try {
      await axios.patch(`${BASE_URL}products/${id}/click`);
    } catch (err) {
      console.error("Click count update failed:", err);
    }
  };

  const handleAddToCart = (prod) => {
    const stored = localStorage.getItem("cart");
    let cart = stored ? JSON.parse(stored) : [];

    // picked variant (default to first if it has variants)
    const variant = (prod.variants && prod.variants.length > 0) ? prod.variants[0] : null;

    const cartKey = variant
      ? prod._id + "_" + (variant.color || "default") + "_" + (variant.dimensions || "")
      : prod._id;

    const existing = cart.find((item) => item.cartKey === cartKey);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        _id: prod._id,
        name: prod.name,
        price: variant ? (variant.price ?? prod.price) : prod.price,
        realPrice: variant ? (variant.realPrice ?? prod.realPrice) : prod.realPrice,
        discount: variant ? (variant.discount ?? prod.discount) : prod.discount,
        color: variant?.color || "",
        dimensions: variant?.dimensions || "",
        image: variant?.images?.[0] || prod.images?.[0],
        qty: 1,
        cartKey,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));

    // Notify Navbar to update count
    window.dispatchEvent(new Event("cartUpdated"));

    // Show toast
    toast.success(`${prod.name} added to cart!`);

    // Redirect removed as per user request
    // navigate("/carts");
  };

  // We should also check for a global socket to emit add-to-cart event
  const socket = useSocket();
  const handleAddToCartWithSocket = (prod) => {
    handleAddToCart(prod);
    if (socket) {
      socket.emit("add-to-cart", {
        productName: prod.name,
        image: prod.images?.[0],
      });
    }
  };

  // Ensure products is always an array
  const productsArray = Array.isArray(products) ? products : [];

  const filteredProducts = productsArray.filter((prod) => {
    if (category && category.toLowerCase() === "discount") {
      return prod.isDiscounted;
    }

    return category
      ? prod.category?.toLowerCase() === category.toLowerCase()
      : true;
  });

  return (
    <div className="min-h-screen bg-white py-8 px-5 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* PREMIUM CATEGORY BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex-1 overflow-hidden">
            <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 -mx-1 px-1 item-center">
              {CATEGORIES.map((cat) => {
                const isActive =
                  (cat.value === "" && !category) ||
                  (cat.value && category?.toLowerCase() === cat.value.toLowerCase());

                return (
                  <button
                    key={cat.name}
                    onClick={() => {
                      if (cat.value) {
                        navigate(`/products?category=${encodeURIComponent(cat.value)}`);
                      } else {
                        navigate("/products");
                      }
                    }}
                    className={`
                      whitespace-nowrap px-6 py-2 rounded-xl text-sm font-bold transition-all duration-500
                      ${isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                        : "bg-gray-50 text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-gray-100"
                      }
                    `}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SORTING DROPDOWN */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative group/sort">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none bg-white border border-gray-100 pl-10 pr-10 py-2.5 rounded-xl text-sm font-bold text-gray-700 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all shadow-sm group-hover/sort:border-gray-200 w-full sm:w-auto"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Filter className="w-4 h-4" />
              </div>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div className="hidden sm:flex items-center bg-gray-50 p-1 rounded-xl border border-gray-100">
              <button className="p-2 bg-white text-blue-600 rounded-lg shadow-sm shadow-blue-50"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600"><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* PAGE HEADING */}
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            {category
              ? category.toLowerCase() === "discount"
                ? "Special Discounts"
                : category
              : weeklyDeal
                ? "Weekly Deals"
                : searchTerm
                  ? `Results for "${searchTerm}"`
                  : "Explore Collection"}
          </h2>
          <p className="text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest">
            Showing {filteredProducts.length} premium items curated for you
          </p>
        </div>

        {/* GRID */}
        <div
          className="
            grid gap-5 sm:gap-6
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
          "
        >
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonProduct key={i} />
            ))
            : filteredProducts.map((prod) => (
              <div
                key={prod._id}
                className="group bg-[#fafbfc] transition hover:shadow-md border border-gray-200 hover:scale-[1.03] flex flex-col cursor-pointer overflow-hidden rounded-xl"
              >
                {/* PRODUCT IMAGE */}
                <Link
                  to={`/product/${prod._id}`}
                  onClick={() => handleProductClick(prod._id)}
                  className="relative flex-shrink-0 w-full h-[180px] sm:h-[190px] flex items-center justify-center bg-white"
                >
                  <img
                    src={prod.images?.[0] || "/default-product.png"}
                    alt={prod.name}
                    className="object-contain max-h-[160px] w-full transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-2 bottom-2 flex gap-1">
                    {prod.discount && (
                      <span className="bg-blue-900 text-white text-xs px-2 py-[2px] font-semibold shadow">
                        {prod.discount}% off
                      </span>
                    )}
                    {prod.limitedTimeDeal && (
                      <span className="text-blue-800 bg-blue-100 text-xs px-2 py-[2px] font-semibold shadow">
                        Limited deal
                      </span>
                    )}
                  </div>
                </Link>

                {/* PRODUCT CONTENT */}
                <div className="flex-1 w-full flex flex-col px-4 pt-3 pb-4">
                  <h3 className="text-base font-semibold mb-1 line-clamp-2 min-h-[42px]">
                    {prod.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-2 line-clamp-2 min-h-[32px]">
                    {prod.description}
                  </p>
                  <div className="mb-1">
                    {(() => {
                      const { price, realPrice } = getDisplayPrice(prod);
                      return (
                        <>
                          <span className="text-gray-800 font-bold text-lg">€{price}</span>
                          {realPrice && realPrice > price && (
                            <span className="ml-2 text-xs text-gray-500 line-through">
                              €{realPrice}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-gray-600 text-xs mb-3">
                    {prod.category}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-2 mt-auto">
                    {/* check if product has variants */}
                    {prod.variants && prod.variants.length > 0 ? (
                      prod.variants.reduce(
                        (sum, v) => sum + (parseInt(v.stock, 10) || 0),
                        0
                      ) === 0 ? (
                        <button
                          disabled
                          className="bg-gray-400 text-white font-semibold text-sm py-2 rounded cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCartWithSocket(prod)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 rounded"
                        >
                          Add to Cart
                        </button>
                      )
                    ) : // fallback if no variants: assume prod.stock field
                      (prod.stock || 0) === 0 ? (
                        <button
                          disabled
                          className="bg-gray-400 text-white font-semibold text-sm py-2 rounded cursor-not-allowed"
                        >
                          Sold Out
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCartWithSocket(prod)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 rounded"
                        >
                          Add to Cart
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && filteredProducts.length === 0 && (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center text-gray-400 text-lg mt-12">
              {searchTerm || category
                ? "No products found for your filter."
                : "No products available."}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
