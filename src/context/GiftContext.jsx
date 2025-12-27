// src/context/GiftContext.js
import { createContext, useContext, useState } from "react";

const GiftContext = createContext();

export const GiftProvider = ({ children }) => {
  const [showGiftPopup, setShowGiftPopup] = useState(false);
  const [giftCode, setGiftCode] = useState(null);
  const [giftExpiry, setGiftExpiry] = useState(null);

  const triggerGiftPopup = (code, expiresAt) => {
    setGiftCode(code);
    setGiftExpiry(new Date(expiresAt));
    setShowGiftPopup(true);
  };

  const closeGiftPopup = () => {
    setShowGiftPopup(false);
    setGiftCode(null);
    setGiftExpiry(null);
  };

  return (
    <GiftContext.Provider
      value={{
        showGiftPopup,
        giftCode,
        giftExpiry,
        triggerGiftPopup,
        closeGiftPopup,
      }}
    >
      {children}
    </GiftContext.Provider>
  );
};

export const useGift = () => useContext(GiftContext);
