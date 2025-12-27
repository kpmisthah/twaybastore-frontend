import React from "react";
import { Star, ExternalLink } from "lucide-react";
import testimonials from "../data/testimonials.json";
import "./index.css";

export default function Testimonials() {
  const looped = [...testimonials, ...testimonials, ...testimonials];
  const reviewLink = "https://g.page/r/Ca8EF1QJvxlsEAI/review";

  return (
    <section className="relative bg-white py-16 overflow-hidden">
      {/* gradient fades */}
      <div className="absolute left-0 top-0 h-full w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto text-center mb-10 px-4 relative z-20">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          What Our Customers Say
        </h2>
        <p className="text-gray-500 mt-2">
          30+ real reviews from verified Twayba buyers.
        </p>
      </div>

      <div className="overflow-hidden w-full">
        <div className="flex gap-6 animate-marquee">
          {looped.map((t, i) => (
            <a
              key={i}
              href={reviewLink}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-[260px] sm:min-w-[300px] md:min-w-[360px] bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex-shrink-0 group"
            >
              <div className="flex justify-center mb-3">
                {Array.from({ length: t.rating }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="w-5 h-5 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-700 italic text-sm leading-relaxed mb-3 group-hover:text-gray-900 transition">
                “{t.review}”
              </p>

              <div className="flex items-center justify-center gap-2">
                <h3 className="text-gray-900 font-semibold">{t.name}</h3>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition" />
              </div>

              <p className="text-gray-500 text-sm">{t.title}</p>

              {t.weeksAgo && (
                <p className="text-xs text-gray-400 mt-1">{t.weeksAgo}</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
