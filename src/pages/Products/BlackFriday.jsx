import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getDisplayPrice, formatPrice } from "../../utils/priceUtils";
import BlackFridayBadge from "../../components/BlackFridayBadge";

// Black Friday Mega Sale — every product ticked "Show in Black Friday Page" in the admin.
// Same layout as the Christmas page, in black.

const SKELETON_COUNT = 10;

function SkeletonProduct() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse flex flex-col w-full">
      <div className="w-full h-[180px] sm:h-[190px] flex items-center justify-center bg-gray-100">
        <div className="h-[90px] w-[90px] sm:h-[110px] sm:w-[110px] bg-gray-200 rounded-xl" />
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

/** Total stock of a product: its variants' stock, or the product's own. */
const stockOf = (prod) =>
  prod.variants?.length
    ? prod.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
    : prod.stock || 0;

const BlackFriday = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}products?blackFridayOffer=true&limit=1000`)
      .then((res) => {
        const productsData = res.data.products || res.data;
        const data = Array.isArray(productsData) ? productsData : [];
        // Filtered here too, so this also works on a backend without the blackFridayOffer filter.
        setProducts(data.filter((p) => p.blackFridayOffer === true));
      })
      .catch((error) => {
        console.error("Failed to fetch Black Friday products:", error);
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

  // Same as the home page deals: the first colour/size goes in the cart.
  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const variant = product?.variants?.[0] || null;
    const cartKey = variant
      ? product._id + "_" + (variant.color || "default") + "_" + (variant.dimensions || "")
      : product._id;

    const stock = variant ? variant.stock || 0 : product.stock || 0;
    if (stock <= 0) return toast("Out of stock!");

    const existing = cart.find((item) => item.cartKey === cartKey);
    if (existing) {
      if (existing.qty + 1 > stock) return toast("Cannot add more than available stock.");
      existing.qty += 1;
    } else {
      cart.push({
        _id: product._id,
        name: product.name,
        price: variant ? variant.price ?? product.price : product.price,
        realPrice: variant ? variant.realPrice ?? product.realPrice : product.realPrice,
        discount: variant ? variant.discount ?? product.discount : product.discount,
        color: variant?.color || "",
        dimensions: variant?.dimensions || "",
        image: variant?.images?.[0] || product.images?.[0],
        qty: 1,
        cartKey,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    navigate("/carts");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* HEADING */}
      <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-10 md:py-14 px-5 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-[0.15em]">Black Friday Mega Sale</h1>
        <p className="text-gray-300 mt-3 text-sm md:text-base font-medium">
          Our biggest deals of the year — limited time only, while stock lasts.
        </p>
      </div>

      <div className="max-w-[1800px] mx-auto py-10 px-5 md:px-6">
        {/* GRID */}
        <div className="grid gap-5 sm:gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => <SkeletonProduct key={i} />)
            : products.map((prod) => {
                const { price, realPrice } = getDisplayPrice(prod);
                const soldOut = stockOf(prod) === 0;
                return (
                  <div
                    key={prod._id}
                    className="group rounded-xl bg-white border border-gray-200 hover:border-black hover:scale-[1.03] transition flex flex-col cursor-pointer overflow-hidden shadow-sm"
                  >
                    {/* PRODUCT IMAGE */}
                    <Link
                      to={`/product/${prod._id}`}
                      onClick={() => handleProductClick(prod._id)}
                      className="relative w-full h-[180px] sm:h-[190px] bg-gray-50 flex items-center justify-center"
                    >
                      <img
                        src={prod.images?.[0] || "/default-product.png"}
                        alt={prod.name}
                        className="object-contain max-h-[180px] w-full transition group-hover:scale-105"
                        loading="lazy"
                      />
                      <BlackFridayBadge band />
                      {prod.discount > 0 && (
                        <span className="absolute top-2 left-2 z-20 rounded-md bg-red-600 text-white text-[10px] sm:text-[11px] font-extrabold px-2 py-1 shadow-md">
                          {prod.discount}% OFF
                        </span>
                      )}
                    </Link>

                    {/* PRODUCT CONTENT */}
                    <div className="flex-1 flex flex-col px-4 pt-3 pb-4">
                      <h3 className="text-base font-semibold mb-1 line-clamp-2 min-h-[42px]">{prod.name}</h3>
                      <p className="text-gray-500 text-xs mb-2 line-clamp-2 min-h-[32px]">{prod.description}</p>

                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-black font-bold text-lg">{formatPrice(price)}</span>
                        {realPrice && realPrice > price && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(realPrice)}</span>
                        )}
                      </div>
                      <div className="text-gray-500 font-semibold text-xs mb-3">{prod.category}</div>

                      {/* ACTION BUTTON */}
                      <div className="flex flex-col gap-2 mt-auto">
                        {soldOut ? (
                          <button className="bg-gray-200 text-gray-500 font-semibold text-sm py-2 rounded cursor-not-allowed">
                            Sold Out
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(prod)}
                            className="bg-black text-white font-semibold text-sm py-2 rounded hover:bg-gray-800 transition"
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* EMPTY STATE */}
        {!loading && products.length === 0 && (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center text-gray-500 text-lg mt-12">No Black Friday deals available right now.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlackFriday;
