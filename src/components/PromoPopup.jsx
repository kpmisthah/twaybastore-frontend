import React, { useState, useEffect } from "react";
import { X, Gift, Zap } from "lucide-react";
import toast from "react-hot-toast";

const PromoPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const POPUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

    useEffect(() => {
        const INITIAL_DELAY = 10 * 60 * 1000; // 10 minutes first time

        const checkPopup = () => {
            const now = Date.now();
            const lastSeen = parseInt(localStorage.getItem("lastPromoSeen") || "0");
            const isUsed = localStorage.getItem("promo_used") === "true";
            const hasShownBefore = localStorage.getItem("hasShownPromo") === "true";

            // If first visit, record current time and exit (will show in 2 mins)
            if (lastSeen === 0) {
                localStorage.setItem("lastPromoSeen", now.toString());
                return;
            }

            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);

            const waitTime = hasShownBefore ? POPUP_INTERVAL : INITIAL_DELAY;

            if (!isUsed && (now - lastSeen >= waitTime) && subtotal >= 40) {
                setIsVisible(true);
                localStorage.setItem("lastPromoSeen", now.toString());
                localStorage.setItem("hasShownPromo", "true");
            }
        };

        // Check every 30 seconds
        const timer = setInterval(checkPopup, 30000);

        // Final fallback: even if checkPopup() initializes it, we check in 2 mins
        checkPopup();

        return () => clearInterval(timer);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText("TWAYBA5");
        toast.success("Code TWAYBA5 copied!");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform animate-in slide-in-from-bottom-8 duration-500">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 pb-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 animate-bounce">
                        <Gift size={32} />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                        Flash Offer for You! ⚡
                    </h2>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Get an instant <span className="font-bold text-blue-600 dark:text-blue-400">€5 DISCOUNT</span> on your order when you spend €40 or more. Don't wait—shop now!
                    </p>

                    <div className="w-full bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border border-dashed border-gray-300 dark:border-gray-700 mb-8 group cursor-pointer hover:border-blue-500 transition-colors" onClick={handleCopy}>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Coupon Code</div>
                        <div className="text-2xl font-black text-gray-900 dark:text-white tracking-widest select-all group-hover:scale-105 transition-transform">
                            TWAYBA5
                        </div>
                        <div className="text-[10px] text-blue-500 mt-2 font-medium">Click to copy</div>
                    </div>

                    <button
                        onClick={() => (window.location.href = "/products")}
                        className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold text-lg hover:bg-gray-800 dark:hover:bg-gray-100 transform hover:-translate-y-1 transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <Zap size={20} className="fill-current" />
                        Buy Immediately
                    </button>

                    <p className="text-[11px] text-gray-400 mt-6 italic">
                        * Offer applicable on orders above €40. Limited time only.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PromoPopup;
