import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { Link, useNavigate } from "react-router-dom";

const SKELETON_COUNT = 10;

function SkeletonProduct() {
  return (
    <div className="group bg-[#ffffff] border border-red-200 rounded-xl overflow-hidden animate-pulse flex flex-col w-full text-black">
      <div className="relative w-full h-[180px] sm:h-[190px] flex items-center justify-center bg-red-50">
        <div className="h-[90px] w-[90px] sm:h-[110px] sm:w-[110px] bg-red-100 rounded-xl" />
        <div className="absolute left-2 bottom-2 flex gap-1">
          <div className="h-5 w-14 bg-red-200 rounded-full" />
          <div className="h-5 w-16 bg-red-100 rounded-full" />
        </div>
      </div>
      <div className="flex-1 flex flex-col px-4 pt-3 pb-4">
        <div className="h-4 w-3/4 bg-red-200 rounded mb-2" />
        <div className="h-3 w-2/3 bg-red-100 rounded mb-2" />
        <div className="mt-auto">
          <div className="h-5 w-16 bg-red-200 rounded mb-1" />
          <div className="h-3 w-12 bg-red-100 rounded" />
        </div>
      </div>
    </div>
  );
}

const Christmas = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}products?limit=1000`)
      .then((res) => {
        // Handle paginated response - products are in .products property
        const productsData = res.data.products || res.data;
        const data = Array.isArray(productsData) ? productsData : [];
        const filtered = data.filter((p) => p.blackFridayOffer === true);
        setProducts(filtered);
      })
      .catch((error) => {
        console.error("Failed to fetch Christmas products:", error);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="min-h-screen bg-white text-red-700 py-10 px-5 md:px-6">
      <div className="max-w-[1800px] mx-auto">

        {/* HEADING */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-red-600 drop-shadow">
            🎄 Christmas Mega Sale 🎁
          </h1>
          <p className="text-red-500 mt-2 text-sm md:text-base font-medium">
            Festive discounts — unwrap your gifts early this Christmas! ❄️
          </p>
        </div>

        {/* GRID */}
        <div
          className="
            grid gap-5 sm:gap-6
            grid-cols-2
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-7
          "
        >
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <SkeletonProduct key={i} />
            ))
            : products.map((prod) => (
              <div
                key={prod._id}
                className="group rounded-xl bg-white border border-red-200 hover:border-red-500 hover:scale-[1.03] transition flex flex-col cursor-pointer overflow-hidden shadow-sm"
              >
                {/* PRODUCT IMAGE */}
                <Link
                  to={`/product/${prod._id}`}
                  onClick={() => handleProductClick(prod._id)}
                  className="relative w-full h-[180px] sm:h-[190px] bg-red-50 flex items-center justify-center"
                >
                  <img
                    src={prod.images?.[0] || "/default-product.png"}
                    alt={prod.name}
                    className="object-contain max-h-[200px] w-full transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute left-2 bottom-2 flex gap-1">
                    {prod.discount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-[2px] font-semibold shadow">
                        {prod.discount}% off
                      </span>
                    )}
                    <span className="bg-green-600 text-white text-xs px-2 py-[2px] font-semibold shadow">
                      Christmas Sale 🎄
                    </span>
                  </div>
                </Link>

                {/* PRODUCT CONTENT */}
                <div className="flex-1 flex flex-col px-4 pt-3 pb-4">
                  <h3 className="text-base font-semibold mb-1 line-clamp-2 min-h-[42px] text-red-700">
                    {prod.name}
                  </h3>
                  <p className="text-red-400 text-xs mb-2 line-clamp-2 min-h-[32px]">
                    {prod.description}
                  </p>

                  <div className="text-red-600 font-bold text-lg mb-1">
                    €{prod.price}
                  </div>
                  <div className="text-red-400 font-bold text-xs mb-3">
                    {prod.category}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-col gap-2 mt-auto">
                    {prod.variants && prod.variants.length > 0 ? (
                      prod.variants.reduce(
                        (sum, v) => sum + (parseInt(v.stock, 10) || 0),
                        0
                      ) === 0 ? (
                        <button className="bg-red-200 text-red-500 font-semibold text-sm py-2 rounded cursor-not-allowed">
                          Sold Out
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(prod)}
                          className="bg-red-600 text-white font-semibold text-sm py-2 rounded hover:bg-red-700 transition"
                        >
                          Add to Cart 🎁
                        </button>
                      )
                    ) : (prod.stock || 0) === 0 ? (
                      <button className="bg-red-200 text-red-500 font-semibold text-sm py-2 rounded cursor-not-allowed">
                        Sold Out
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className="bg-green-600 text-white font-semibold text-sm py-2 rounded hover:bg-green-700 transition"
                      >
                        Add to Cart 🎄
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* EMPTY STATE */}
        {!loading && products.length === 0 && (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center text-red-400 text-lg mt-12">
              No Christmas deals available right now ❄️
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Christmas;
