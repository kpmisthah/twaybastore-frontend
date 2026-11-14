// BlackFridayBadge.jsx — the "BLACK FRIDAY" label on products ticked "Show in Black Friday Page" in the admin.
//  - <BlackFridayBadge band />: a diagonal ribbon across the top-right corner of the product image.
//    The image container must be `relative` and the card (or container) `overflow-hidden`, which cuts
//    the ribbon's ends off at the corner. size="sm" for small images (related products).
//  - <BlackFridayBadge />: a small label, e.g. above the name on the product page.
export default function BlackFridayBadge({ band = false, size = "md", className = "" }) {
  if (band) {
    const ribbon =
      size === "sm"
        ? "top-[10px] -right-[34px] w-[120px] py-[2px] text-[8px] tracking-[0.12em]"
        : "top-[20px] -right-[44px] w-[170px] py-1 text-[10px] sm:text-[11px] tracking-[0.18em]";
    return (
      <div
        className={`pointer-events-none absolute z-10 rotate-45 bg-black text-center font-extrabold uppercase text-white shadow-md ${ribbon} ${className}`}
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
