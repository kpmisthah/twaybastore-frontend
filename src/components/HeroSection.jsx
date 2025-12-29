import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

/* ---------------- Default Fallback Slide ---------------- */
const defaultSlides = [
  {
    desktop: "/carosal/desktopchristmas.png",
    mobile: "/carosal/Christmasmobile.png",
    link: "/products?category=Deals",
  },
];

/* ---------------- Hero Carousel ---------------- */
export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/banners`);

      if (!response.ok) {
        throw new Error("Failed to fetch banners");
      }

      const data = await response.json();

      if (data && data.length > 0) {
        // Transform API data to slide format
        const formattedSlides = data.map((banner) => ({
          desktop: banner.desktopImage,
          mobile: banner.mobileImage,
          link: banner.link || "/products",
          title: banner.title,
        }));
        setSlides(formattedSlides);
      } else {
        // No banners found, use default
        setSlides(defaultSlides);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError(err.message);
      // Fallback to default slides on error
      setSlides(defaultSlides);
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <section className="relative w-full overflow-hidden bg-gray-100">
        <div className="w-full h-64 md:h-96 flex items-center justify-center">
          <div className="text-gray-500">Loading banners...</div>
        </div>
      </section>
    );
  }

  // If no slides at all (shouldn't happen due to fallback)
  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, i) => (
            <Link
              key={i}
              to={s.link}
              className="relative shrink-0 w-full cursor-pointer"
            >
              {/* Desktop Image */}
              <img
                src={s.desktop}
                alt={s.title || `slide-${i}`}
                className="hidden md:block w-full h-auto object-cover select-none"
                draggable="false"
              />
              {/* Mobile Image */}
              <img
                src={s.mobile}
                alt={s.title || `slide-mobile-${i}`}
                className="block md:hidden w-full h-auto object-cover select-none"
                draggable="false"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

