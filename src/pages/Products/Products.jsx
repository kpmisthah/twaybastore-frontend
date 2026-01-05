import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { useLocation, Link, useNavigate } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SKELETON_COUNT = 10;

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

  useEffect(() => {
    setLoading(true);

    let url = `${BASE_URL}products?limit=1000`;

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
  }, [searchTerm, category, weeklyDeal]);

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

    const existing = cart.find((item) => item._id === prod._id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        _id: prod._id,
        name: prod.name,
        price: prod.price,
        realPrice: prod.realPrice,
        discount: prod.discount,
        image: prod.images?.[0],
        qty: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/carts");
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
        {/* HEADING */}
        <h2 className="text-left text-sm font-semibold mb-8 tracking-tight">
          {category
            ? category.toLowerCase() === "discount"
              ? "Discounted Products"
              : `Category: ${category}`
            : weeklyDeal
              ? "Weekly Deals"
              : searchTerm
                ? `Results for "${searchTerm}"`
                : "All Products"}
        </h2>

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
                    <span className="text-gray-800 font-bold text-lg">€{prod.price}</span>
                    {prod.realPrice && prod.realPrice > prod.price && (
                      <span className="ml-2 text-xs text-gray-500 line-through">
                        €{prod.realPrice}
                      </span>
                    )}
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
                          onClick={() => handleAddToCart(prod)}
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
                          onClick={() => handleAddToCart(prod)}
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
