import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../api/config";
import './catagories.css'
/* ---------------- Category Data ---------------- */
const CATEGORIES = [
  { name: "All Products", value: "All Products", img: "/Catagories/V3/1.png" },
  { name: "Home & Appliances", value: "Home & Kitchen", img: "/Catagories/V3/4.png" },
  { name: "Gadgets", value: "Gadgets", img: "/Catagories/V3/6.png" },
  { name: "Fitness", value: "Fitness", img: "/Catagories/V3/3.png" },
  { name: "Shelving", value: "Shelving", img: "/Catagories/V3/2.png" },
  { name: "Camping", value: "Camping", img: "/Catagories/V3/5.png" },
  { name: "Car Accessories", value: "Car Accessories", img: "/Catagories/V3/7.png" },
];

/* ---------------- Main Component ---------------- */
export default function BrowseCategories() {
  const navigate = useNavigate();

  const handleCategoryClick = async (categoryValue) => {
    try {
      if (categoryValue !== "All Products") {
        await axios.patch(
          `${BASE_URL}category-clicks/${encodeURIComponent(categoryValue)}`
        );
      }
    } catch (err) {
      console.error("Category click failed", err);
    }

    navigate(
      categoryValue === "All Products"
        ? "/products"
        : `/products?category=${encodeURIComponent(categoryValue)}`
    );
  };

  return (
    <section
      className="w-full max-w-[1800px] mx-auto px-4 py-14 bg-white"
      aria-labelledby="browse-heading"
    >
      {/* Header */}
      <div className="mb-10 text-center">
        <h2
          id="browse-heading"
          className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
        >
          Top Categories
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-2">
          Categories people love the most
        </p>
      </div>

      {/* Categories Section */}
      <div
        className="
          flex overflow-x-auto scrollbar-hide gap-4 pb-4
          sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7
          sm:gap-6 md:gap-8 sm:overflow-visible
          snap-x snap-mandatory
        "
      >
        {CATEGORIES.map((cat, index) => (
          <div
            key={index}
            onClick={() => handleCategoryClick(cat.value)}
            className="
              flex-shrink-0 sm:flex-shrink sm:w-auto
              w-[240px] h-[420px] sm:h-auto
              cursor-pointer relative overflow-hidden
               bg-gray-50 hover:bg-gray-100
              shadow-sm hover:shadow-md
              transition-all duration-500 ease-in-out
              snap-start
            "
          >
            <img
              src={cat.img}
              alt={cat.name}
              draggable="false"
              className="
                w-full h-full object-cover
                transition-transform duration-700 ease-out
                group-hover:scale-105
              "
            />

            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-black/0"></div>

            {/* Category label */}
            <div
              className="
                absolute bottom-3 left-0 right-0
                text-center text-white text-sm sm:text-base font-semibold
                drop-shadow-lg
              "
            >
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
