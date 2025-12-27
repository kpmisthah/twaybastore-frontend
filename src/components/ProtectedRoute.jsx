// src/components/ProtectedRoute.jsx

import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  // You can also check for user or any other criteria here
  if (!token) {
    // Not logged in: redirect to login page
    return <Navigate to="/login" replace />;
  }
  // Logged in: render the children (the page)
  return children;
};

export default ProtectedRoute;
