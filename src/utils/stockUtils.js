/**
 * Customer-facing stock display.
 * Hides exact inventory when there is plenty, and only reveals the real
 * count when it is low (creates urgency, like most modern stores).
 *
 *   stock > 5   -> "5+"
 *   stock 1..5  -> exact number ("4", "3", ...)
 *   stock <= 0  -> "0"
 *
 * The `threshold` above which we show "N+" can be overridden if needed.
 */
export const formatStockDisplay = (stock, threshold = 5) => {
    const n = parseInt(stock, 10) || 0;
    if (n <= 0) return "0";
    if (n > threshold) return `${threshold}+`;
    return String(n);
};
