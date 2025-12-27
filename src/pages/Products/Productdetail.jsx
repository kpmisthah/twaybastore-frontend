import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { useParams, useNavigate } from "react-router-dom";
import ProductReview from "./ProductReview";
import RelatedProducts from "./RelatedProducts";
import { Star, StarHalf } from "lucide-react";
import WishlistButton from "../Wishlist/WishlistButton";
// import GuestCheckoutModal from "../Cart/GuestCheckoutModal";

const Productdetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImg, setMainImg] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(null);
  // const [guestOpen, setGuestOpen] = useState(false); // ⬅️ Add this!

  // --- Zoom related states ---
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
  const fetchProduct = async () => {
    const res = await axios.get(`${BASE_URL}products/${id}`);
    setProduct(res.data);
    setMainImg(res.data.images?.[0] || "/default-product.png");
    setSelectedVariant(res.data.variants?.[0] || null);

    // 📨 Send product-view analytics + mail trigger
    const user = JSON.parse(localStorage.getItem("user")); // assuming your app stores logged-in user
    if (user?._id) {
      await axios.post(`${BASE_URL}analytics/product-view`, {
        userId: user._id,
        productId: res.data._id,
      });
    }
  };

  fetchProduct();
}, [id]);


  useEffect(() => {
    axios.get(`${BASE_URL}products/${id}`).then((res) => {
      setProduct(res.data);
      setMainImg(res.data.images?.[0] || "/default-product.png");
      setSelectedVariant(res.data.variants?.[0] || null);
    });

    axios.get(`${BASE_URL}products/${id}/reviews`).then((res) => {
      const reviewsData = res.data || [];
      setReviews(reviewsData);
      if (reviewsData.length > 0) {
        const sum = reviewsData.reduce((acc, r) => acc + (r.rating || 0), 0);
        setAverageRating(sum / reviewsData.length);
      } else {
        setAverageRating(null);
      }
    });
  }, [id]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Total stock = sum of all variant stocks
  const totalStock = product?.variants?.reduce(
    (sum, v) => sum + (parseInt(v.stock, 10) || 0),
    0
  );

  // Add to cart: now includes color and dimensions
  const addToCart = () => {
    if (!selectedVariant) return toast("Select a variant!");
    if (!displayStock || quantity > displayStock)
      return toast("Not enough stock!");
    setCart((oldCart) => {
      const cartKey =
        product._id +
        "_" +
        selectedVariant.color +
        "_" +
        (selectedVariant.dimensions || "");
      const existing = oldCart.find((item) => item.cartKey === cartKey);
      if (existing) {
        // Prevent over-adding
        if (existing.qty + quantity > displayStock) {
          alert("Cannot add more than available stock");
          return oldCart;
        }
        return oldCart.map((item) =>
          item.cartKey === cartKey
            ? { ...item, qty: item.qty + quantity }
            : item
        );
      }
      return [
        ...oldCart,
        {
          _id: product._id,
          name: product.name,
          price: selectedVariant.price ? selectedVariant.price : product.price,
          realPrice: selectedVariant.realPrice
            ? selectedVariant.realPrice
            : product.realPrice,
          discount: selectedVariant.discount ?? product.discount,
          color: selectedVariant.color,
          dimensions: selectedVariant.dimensions,
          image: selectedVariant.images?.[0] || product.images?.[0],
          qty: quantity,
          cartKey,
        },
      ];
    });
    navigate("/carts");
  };

  // const handleGuestBuy = () => {
  //   if (!selectedVariant) {
  //     alert("Please select a variant");
  //     return;
  //   }
  //   if (quantity > displayStock) {
  //     alert("Not enough stock available");
  //     return;
  //   }
  //   setGuestOpen(true);
  // };

  // Discount calc for UI
  const getDiscount = (real, curr) => {
    if (!real || !curr || Number(real) <= Number(curr)) return null;
    return Math.round(((real - curr) / real) * 100);
  };

  const renderStars = () => {
    if (!averageRating) {
      return (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={16} className="text-gray-300" />
          ))}
          <span className="ml-2 text-gray-400 text-sm">(No ratings yet)</span>
        </>
      );
    }
    const full = Math.floor(averageRating);
    const half = averageRating - full >= 0.5;
    return (
      <>
        {Array.from({ length: full }).map((_, i) => (
          <Star key={i} size={16} className="text-yellow-400 fill-yellow-300" />
        ))}
        {half && (
          <StarHalf size={16} className="text-yellow-400 fill-yellow-300" />
        )}
        {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
          <Star key={full + i + 1} size={16} className="text-gray-300" />
        ))}
        <span className="ml-2 text-gray-600 text-sm">
          {averageRating.toFixed(1)} / 5 ({reviews.length} review
          {reviews.length === 1 ? "" : "s"})
        </span>
      </>
    );
  };

  // ----------- Amazon-Style Description (About this item) -----------
  const renderDescription = () => {
    if (!product?.description) return null;
    // Amazon-style: split on newline, or ". " (dot+space), or ";", or bullet, etc
    let descArr = Array.isArray(product.description)
      ? product.description
      : product.description
          .split(/\n|\. |\;|\•/)
          .map((s) => s.trim())
          .filter(Boolean);
    return (
      <ul className="list-disc pl-5 space-y-1 text-gray-700 text-[15px]">
        {descArr.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>
    );
  };

  // Group variants by color for better UX
  const variantsByColor = {};
  product?.variants?.forEach((v) => {
    if (!variantsByColor[v.color]) variantsByColor[v.color] = [];
    variantsByColor[v.color].push(v);
  });

  // Scroll to top on load or when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // ---- Variant Selector component for reuse ----
  const VariantSelector = () =>
    product?.variants && product.variants.length > 0 ? (
      <div className="pt-4">
        <h3 className="font-semibold text-md mb-2">Choose Variant:</h3>
        <div className="space-y-4">
          {Object.entries(variantsByColor).map(
            ([color, variantsOfColor], idx) => (
              <div key={color + idx}>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-block w-5 h-5 rounded-full border border-gray-300"
                    style={{
                      backgroundColor: color.toLowerCase(),
                    }}
                  ></span>
                  <span className="font-semibold">{color}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {variantsOfColor.map((v, i) => (
                    <button
                      key={color + v.dimensions + i}
                      type="button"
                      className={`px-3 py-2 rounded-lg border text-xs font-medium transition
                      ${
                        selectedVariant &&
                        selectedVariant.color === v.color &&
                        selectedVariant.dimensions === v.dimensions
                          ? "border-blue-600 bg-blue-50 shadow"
                          : "border-gray-300 bg-white"
                      }
                      ${
                        v.stock === 0
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                      hover:border-blue-400
                    `}
                      onClick={() => {
                        setSelectedVariant(v);
                        setMainImg(
                          (v.images && v.images[0]) || product.images?.[0]
                        );
                        setQuantity(1);
                      }}
                      disabled={v.stock === 0}
                    >
                      <div>
                        <span className="block">
                          <strong>Size:</strong> {v.dimensions}
                        </span>
                        <span>
                          <strong>Price:</strong> €{v.price.toFixed(2)}
                        </span>
                        {v.stock > 0 && (
                          <span className="ml-2 text-green-700 font-semibold">
                            In stock: {v.stock}
                          </span>
                        )}
                        {v.stock === 0 && (
                          <span className="ml-2 text-red-500 font-semibold">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    ) : null;

  if (!product) return <div className="text-center py-20">Loading...</div>;

  // Resolve price, realPrice, discount for UI
  const variant = selectedVariant || {};
  const currPrice = variant.price ?? product.price;
  const oldPrice = variant.realPrice ?? product.realPrice;
  const showOldPrice = !!oldPrice && Number(oldPrice) > Number(currPrice);
  const discount =
    variant.discount != null
      ? variant.discount
      : getDiscount(oldPrice, currPrice) ?? product.discount;

  // Always respect the selected variant's stock
  const displayStock = selectedVariant ? selectedVariant.stock : 0;
  const variantImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : product.images || [];

  return (
    <div className="w-full min-h-screen bg-white pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Images + VARIANT SELECTOR (DESKTOP) */}
          <div>
            {/* --- MAIN IMAGE WITH ZOOM --- */}
            <div
              className="relative bg-white rounded-lg overflow-hidden  w-full h-[300px] sm:h-[400px]"
              onMouseLeave={() => setShowZoom(false)}
              onMouseEnter={() => setShowZoom(true)}
              onMouseMove={(e) => {
                const rect = imgRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                setZoomPos({ x, y });
              }}
              style={{ cursor: "crosshair" }}
            >
              <img
                ref={imgRef}
                src={mainImg}
                alt={product.name}
                className="w-full h-[300px] sm:h-[400px] object-contain p-4 select-none pointer-events-none"
                draggable={false}
              />
              {/* ZOOM BOX */}
              {showZoom && (
                <div
                  style={{
                    position: "absolute",
                    left: Math.max(
                      0,
                      Math.min(
                        zoomPos.x - 100,
                        (imgRef.current?.width || 0) - 200
                      )
                    ),
                    top: Math.max(
                      0,
                      Math.min(
                        zoomPos.y - 100,
                        (imgRef.current?.height || 0) - 100
                      )
                    ),
                    width: 200,
                    height: 200,
                    border: "2px solid #0ea5e9",
                    background: `url('${mainImg}') no-repeat`,
                    backgroundSize: `${(imgRef.current?.width || 0) * 2}px ${
                      (imgRef.current?.height || 0) * 2
                    }px`,
                    backgroundPosition: `-${zoomPos.x * 2 - 100}px -${
                      zoomPos.y * 2 - 50
                    }px`,
                    pointerEvents: "none",
                    zIndex: 10,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    transition: "border-color 0.15s",
                  }}
                />
              )}
            </div>
            {/* Thumbnails */}
            <div className="flex mt-3 gap-2 overflow-x-auto">
              {variantImages.slice(0, 6).map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`img-${idx + 1}`}
                  className={`w-14 h-14 object-cover rounded border cursor-pointer ${
                    mainImg === img ? "ring-2 ring-blue-300" : ""
                  }`}
                  onMouseEnter={() => setMainImg(img)}
                />
              ))}
            </div>

            {/* Desktop variant selector below images */}
            <div className="hidden md:block mt-6">
              <VariantSelector />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-snug">
              {product.name}
            </h1>
            {/* TOTAL STOCK DISPLAYED HERE */}
            {typeof totalStock === "number" && (
              <div className="text-gray-500 text-sm mb-2">
                <span className="font-medium text-gray-700">Total Stock: </span>
                <span>{totalStock}</span>
              </div>
            )}

            <div className="flex items-center gap-2">{renderStars()}</div>

            <div className="flex items-baseline gap-3">
              {showOldPrice && (
                <span className="text-gray-400 line-through text-sm">
                  €{Number(oldPrice).toFixed(2)}
                </span>
              )}
              <span className="text-xl font-bold text-black">
                €{Number(currPrice).toFixed(2)}
              </span>
              {discount > 0 && (
                <span className="ml-2 text-green-600 bg-green-100 rounded-full px-2 py-0.5 text-xs font-bold">
                  -{Number(discount).toFixed(0)}%
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">Including 18% VAT</p>
            {/* QUANTITY + CART + ACTIONS */}

            <div className="space-y-3">
              <div className="flex gap-4 items-center">
                <label className="text-sm">Qty:</label>
                <div className="flex items-center border rounded px-2 py-1">
                  <button
                    type="button"
                    className="px-2 text-lg font-bold text-gray-600 disabled:opacity-40"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || !displayStock}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    className="w-8 text-center outline-none border-0 bg-transparent"
                    value={quantity}
                    readOnly
                    style={{ pointerEvents: "none" }}
                  />
                  <button
                    type="button"
                    className="px-2 text-lg font-bold text-gray-600 disabled:opacity-40"
                    onClick={() =>
                      setQuantity((q) => Math.min(displayStock, q + 1))
                    }
                    disabled={quantity >= displayStock || !displayStock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action buttons responsive layout */}
              <div className="flex flex-col md:flex-row gap-3 w-full">
                <button
                  onClick={addToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2 rounded shadow w-full md:w-auto"
                  disabled={
                    !selectedVariant || !displayStock || quantity > displayStock
                  }
                >
                  Add to cart
                </button>

                {/* <button
                  onClick={handleGuestBuy}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-5 py-2 rounded shadow w-full md:w-auto"
                  disabled={
                    !selectedVariant || !displayStock || quantity > displayStock
                  }
                >
                  Guest Buy
                </button> */}
                {/* <GuestCheckoutModal
                  open={guestOpen}
                  onClose={() => setGuestOpen(false)}
                  product={{
                    _id: product._id,
                    name: product.name,
                    price: selectedVariant?.price ?? product.price,
                    image: selectedVariant?.images?.[0] || product.images?.[0],
                    qty: quantity,
                    color: selectedVariant?.color,
                    dimensions: selectedVariant?.dimensions,
                  }}
                /> */}

                <div className="w-full md:w-auto">
                  <WishlistButton
                    productId={product._id}
                    color={selectedVariant?.color || null}
                    dimensions={selectedVariant?.dimensions || null}
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>

              {displayStock === 0 && (
                <span className="text-red-500 text-xs mt-2">Out of stock</span>
              )}
            </div>

            {/* Variant Selector: Mobile Only */}
            <div className="block md:hidden">
              <VariantSelector />
            </div>

            {/* About this item (Amazon-style) */}
            <div className="mt-6">
              <p className="font-bold text-[17px] mb-2">About this item</p>
              {renderDescription()}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-6 text-sm text-gray-600">
              {product.brand && (
                <div>
                  <strong>Brand:</strong> {product.brand}
                </div>
              )}
              {product.weight && (
                <div>
                  <strong>Weight:</strong> {product.weight}
                </div>
              )}
              {product.material && (
                <div>
                  <strong>Material:</strong> {product.material}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* NO variant selector at bottom! */}
        <br />
        <br />
        <hr className="text-gray-200" />

        <div className="mt-10">
          <RelatedProducts productId={product._id} />
        </div>

        <div className="mt-8">
          <ProductReview />
        </div>
      </div>
    </div>
  );
};

export default Productdetail;
