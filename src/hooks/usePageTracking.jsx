import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import VERY_BASE_URL from "../api/veryBase";

export default function usePageTracking() {
  const location = useLocation();
  const lastPathRef = useRef(null);

  useEffect(() => {
    // Prevent double fire (StrictMode + duplicate same-path navigation)
    if (lastPathRef.current === location.pathname) return;
    lastPathRef.current = location.pathname;

    fetch(`${VERY_BASE_URL}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname }),
    }).catch((err) => console.error("Tracking failed:", err));
  }, [location.pathname]);
}