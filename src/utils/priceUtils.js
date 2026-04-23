/**
 * Unified utility to get the display price for a product.
 * If the product has variants, it returns the price of the first variant.
 * This matches the default state of the Productdetail page.
 */
export const getDisplayPrice = (product) => {
    if (product.variants && product.variants.length > 0) {
        const variant = product.variants[0];
        return {
            price: variant.price ?? product.price,
            realPrice: variant.realPrice ?? product.realPrice,
            discount: variant.discount != null ? variant.discount : product.discount
        };
    }
    return {
        price: product.price,
        realPrice: product.realPrice,
        discount: product.discount
    };
};

export const formatPrice = (price) => {
    if (price === undefined || price === null) return "€0.00";
    return `€${Number(price).toFixed(2)}`;
};
