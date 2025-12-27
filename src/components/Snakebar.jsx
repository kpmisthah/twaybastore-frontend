import React, { useEffect, useState } from "react";
import { Home, ListOrderedIcon, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Snakebar = () => {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    const getCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((acc, curr) => acc + (curr.quantity || 1), 0));
    };
    getCartCount();

    window.addEventListener("storage", getCartCount);
    window.addEventListener("cartUpdated", getCartCount);

    return () => {
      window.removeEventListener("storage", getCartCount);
      window.removeEventListener("cartUpdated", getCartCount);
    };
  }, []);

  const navItems = [
    { to: "/", label: "Home", icon: Home },
    { to: "/orders", label: "Orders", icon: ListOrderedIcon },
    { to: "/carts", label: "Cart", icon: ShoppingCart },
    { to: "/profile", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 shadow-sm sm:hidden">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ to, label, icon: Icon }) => {
          const isActive =
            path === to || (to !== "/" && path.startsWith(to));

          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center text-xs transition relative ${
                isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
              }`}
            >
              <div className="relative flex flex-col items-center">
                <Icon className="w-6 h-6" />
                {isActive && (
                  <div className="w-6 h-[2px] bg-blue-600 rounded-full mt-0.5" />
                )}
                {label === "Cart" && cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.5 bg-blue-600 text-white rounded-full text-[10px] font-bold shadow">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Snakebar;
