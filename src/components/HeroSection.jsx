import React from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

/* ---------------- Slides ---------------- */
const slides = [
  {
    desktop: "/carosal/desktopchristmas.png",
    mobile: "/carosal/Christmasmobile.png",
    link: "/products?category=Deals",
  },
];

/* ---------------- Hero Carousel ---------------- */
export default function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: "center" },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );

  return (
    <section className="relative w-full overflow-hidden">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((s, i) => (
            <Link
              to="/Christmas"
              className="relative shrink-0 w-full cursor-pointer"
            >
              {/* Desktop Image */}
              <img
                src={s.desktop}
                alt={`slide-${i}`}
                className="hidden md:block w-full h-auto object-cover select-none"
                draggable="false"
              />
              {/* Mobile Image */}
              <img
                src={s.mobile}
                alt={`slide-mobile-${i}`}
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
