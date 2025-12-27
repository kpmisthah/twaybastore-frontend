import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";

const GiftSuccessPopup = ({ code, expiresAt, onClose }) => {
  const [secondsLeft, setSecondsLeft] = useState(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.floor(diff / 1000);
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Confetti burst on mount
  useEffect(() => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast("Code copied to clipboard!");
  };

  const formatTime = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center relative"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
        >
          <h2 className="text-xl font-bold text-green-600 mb-2">🎉 You got 5% OFF!</h2>
          <p className="text-gray-700 mb-4">
            Use this one-time gift code before the timer runs out:
          </p>

          <div className="bg-gray-100 rounded-lg px-4 py-2 mb-3 text-lg font-mono tracking-wide">
            {code}
          </div>

          <button
            onClick={copyCode}
            className="text-sm text-blue-600 underline mb-4"
          >
            Copy Code
          </button>

          <div className="text-sm text-gray-500 mb-4">
            ⏳ Expires in: {formatTime(secondsLeft)}
          </div>

          <button
            onClick={() => {
              onClose();
              window.location.href = "/products"; // or use navigate()
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
          >
            Pick Your Item Now
          </button>

          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-gray-400 hover:text-black text-lg"
          >
            &times;
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GiftSuccessPopup;
