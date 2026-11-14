// BlackFridayBadge.jsx — the "BLACK FRIDAY" label on products ticked "Show in Black Friday Page" in the admin.
//  - <BlackFridayBadge band />: a full-width strip across the middle of the product image
//    (the image container must be `relative`);
//  - <BlackFridayBadge />: a small label, e.g. above the name on the product page.
export default function BlackFridayBadge({ band = false, className = "" }) {
  if (band) {
    return (
      <div
        className={`pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 bg-black/85 py-1.5 text-center text-xs sm:text-sm font-extrabold uppercase tracking-[0.25em] text-white shadow-lg ${className}`}
      >
        Black Friday
      </div>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-md bg-black text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2 py-1 shadow-md ${className}`}
    >
      Black Friday
    </span>
  );
}
