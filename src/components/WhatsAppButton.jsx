import React from "react";
import { FaWhatsapp, FaHeadset } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";

const WhatsAppButton = () => {
  const location = useLocation();

  const phoneNumber = "+35699139639"; // 👉 your Malta WhatsApp number
  const message = "Hello, I want to know more about your products!";
  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // ✅ Define exact paths where the buttons should be visible
  const visiblePaths = [
    "/",                    // Home page
    "/products",            // Product listing
    "/about-twayba-group",  // About
    "/contact",             // Contact
  ];

  // ✅ For routes like /product/:id
  const dynamicPrefixes = ["/product/"];

  const currentPath = location.pathname.toLowerCase();

  const shouldShow =
    visiblePaths.includes(currentPath) ||
    dynamicPrefixes.some((prefix) => currentPath.startsWith(prefix));

  if (!shouldShow) return null;

  return (
    <div className="hidden md:flex fixed bottom-5 right-5 z-50 flex-col items-end gap-3">
      {/* ✅ WhatsApp Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 hover:scale-110 transition-transform duration-200 flex items-center justify-center animate-bounce"
      >
        <FaWhatsapp size={26} />
      </a>

      {/* ✅ Live Support Button */}
      <Link
        to="/help"
        className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 hover:scale-110 transition-transform duration-200 flex items-center justify-center"
      >
        <FaHeadset size={24} />
      </Link>
    </div>
  );
};

export default WhatsAppButton;
