// BlackFridayBadge.jsx — the "BLACK FRIDAY" label on products ticked "Show in Black Friday Page" in the admin.
//  - <BlackFridayBadge band />: a diagonal ribbon across the top-right corner of the product image.
//    The image container must be `relative` and the card (or container) `overflow-hidden`, which cuts
//    the ribbon's ends off at the corner. size="sm" for small images (related products).
//  - <BlackFridayBadge />: a small label, e.g. above the name on the product page.
export default function BlackFridayBadge({ band = false, size = "md", className = "" }) {
  if (band) {
    // The ribbon's centre sits on the corner's diagonal (same distance from the top and the right
    // edge), so the visible strip is centred on the text and long enough for "BLACK FRIDAY".
    //  md: 200×18px, centre 42px in → ~119px of strip visible, text ~95px wide.
    //  sm: 130×12px, centre 28px in → ~79px visible, text ~65px wide.
    const ribbon =
      size === "sm"
        ? "top-[22px] -right-[37px] w-[130px] py-[2px] text-[8px] tracking-[0.08em]"
        : "top-[33px] -right-[58px] w-[200px] py-1 text-[10px] tracking-[0.1em]";
    return (
      <div
        className={`pointer-events-none absolute z-10 rotate-45 whitespace-nowrap bg-black text-center font-extrabold uppercase leading-none text-white shadow-md ${ribbon} ${className}`}
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
