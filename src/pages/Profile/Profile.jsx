import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import BASE_URL from "../../api/config";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const REQUIRED_FIELDS = ["email", "street", "city", "area", "zipCode"];

const Profile = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.reload();
    navigate("/login");
  };

  const location = useLocation();
  const [user, setUser] = useState(null);

  const [editFields, setEditFields] = useState({
    email: "",
    secondPhone: "",
    street: "",
    city: "",
    area: "",
    zipCode: "",
  });

  // keep a snapshot of what we loaded from the server
  const [originalFields, setOriginalFields] = useState({
    email: "",
    secondPhone: "",
    street: "",
    city: "",
    area: "",
    zipCode: "",
  });

  const [changed, setChanged] = useState(false);

  // UI state
  const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);
  const [errors, setErrors] = useState({}); // { fieldName: "message" }

  const query = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  // Helpers
  const computeMissing = (fields) => {
    const nextErrors = {};
    REQUIRED_FIELDS.forEach((k) => {
      if (!fields[k] || !String(fields[k]).trim()) {
        nextErrors[k] = "This field is required.";
      }
    });
    return nextErrors;
  };

  const shallowEqual = (a, b) => {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      if ((a[k] ?? "") !== (b[k] ?? "")) return false;
    }
    return true;
  };

  const validateAndSetErrors = (fields) => {
    const next = computeMissing(fields);
    setErrors(next);
    return next;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${BASE_URL}auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const u = res.data.user;
        setUser(u);
        const initial = {
          email: u.email || "",
          secondPhone: u.secondPhone || "",
          street: u.street || "",
          city: u.city || "",
          area: u.area || "",
          zipCode: u.zipCode || "",
        };

        setEditFields(initial);
        setOriginalFields(initial);
        setChanged(false);

        // If redirected from cart with incomplete profile, show alert + mark errors
        const cameFromCart = query.get("incomplete") === "1";
        const missing = computeMissing(initial);
        const hasMissing = Object.keys(missing).length > 0;
        setErrors(missing);
        setShowIncompleteAlert(cameFromCart && hasMissing);
      } catch {
        toast.error("Could not fetch profile.");
      }
    };
    fetchProfile();
  }, [query]);

  // recompute "changed" whenever editFields or originalFields change
  useEffect(() => {
    setChanged(!shallowEqual(editFields, originalFields));
  }, [editFields, originalFields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...editFields, [name]: value };
    setEditFields(next);

    // live validate this field and overall form
    const nextErrors = { ...errors };
    if (REQUIRED_FIELDS.includes(name)) {
      if (!value || !String(value).trim()) {
        nextErrors[name] = "This field is required.";
      } else {
        delete nextErrors[name];
      }
    }
    setErrors(nextErrors);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    // Final validation before submit
    const missing = validateAndSetErrors(editFields);
    if (Object.keys(missing).length) {
      setShowIncompleteAlert(true);
      return toast("Please fill all required fields to continue.");
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${BASE_URL}auth/me`,
        { ...editFields },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const u = res.data.user;
      setUser(u);

      const saved = {
        email: u.email || "",
        secondPhone: u.secondPhone || "",
        street: u.street || "",
        city: u.city || "",
        area: u.area || "",
        zipCode: u.zipCode || "",
      };

      // refresh both snapshots so the button hides again
      setEditFields(saved);
      setOriginalFields(saved);
      setShowIncompleteAlert(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  const inputClass = (name) =>
    `w-full rounded-md px-3 py-2 ${
      errors[name]
        ? "border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        : "border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-300"
    }`;

  const labelRequired = (text, required) => (
    <label className="block mb-1 text-gray-600">
      {text} {required && <span className="text-red-600">*</span>}
    </label>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8fa]">
        <span>Loading profile...</span>
      </div>
    );
  }

  const readOnlyClass =
    "w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed";

  return (
    <div className="min-h-screen bg-[#f6f8fa] py-8">
      <h2 className="text-2xl font-bold text-center text-sky-900 mb-2">
        Profile
      </h2>
      <div className="text-center text-gray-500 mb-6">
        Manage your account details
      </div>

      {showIncompleteAlert && (
        <div className="max-w-2xl mx-auto mb-6 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 text-sm">
            <strong>Heads up:</strong> Please complete your profile (address &
            contact) to place your order.
          </div>
        </div>
      )}

      <form
        onSubmit={handleUpdate}
        className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 px-4"
      >
        <div className="md:col-span-2">
          {labelRequired("Full Name", false)}
          <input
            type="text"
            value={user.fullName}
            disabled
            className={readOnlyClass}
          />
        </div>

        <div className="md:col-span-2">
          {labelRequired("Second Phone", false)}
          <input
            type="text"
            name="secondPhone"
            value={editFields.secondPhone}
            onChange={handleChange}
            className={inputClass("secondPhone")}
            placeholder="Phone"
          />
        </div>

        <div className="md:col-span-2">
          {labelRequired("Email Address", true)}
          <input
            type="email"
            name="email"
            value={editFields.email}
            onChange={handleChange}
            className={inputClass("email")}
            placeholder="Email Address"
          />
          {errors.email && (
            <p className="text-xs text-red-600 mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          {labelRequired("Street", true)}
          <input
            type="text"
            name="street"
            value={editFields.street}
            onChange={handleChange}
            className={inputClass("street")}
            placeholder="Street"
          />
          {errors.street && (
            <p className="text-xs text-red-600 mt-1">{errors.street}</p>
          )}
        </div>

        <div>
          {labelRequired("City", true)}
          <input
            type="text"
            name="city"
            value={editFields.city}
            onChange={handleChange}
            className={inputClass("city")}
            placeholder="City"
          />
          {errors.city && (
            <p className="text-xs text-red-600 mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          {labelRequired("Area", true)}
          <input
            type="text"
            name="area"
            value={editFields.area}
            onChange={handleChange}
            className={inputClass("area")}
            placeholder="Area"
          />
          {errors.area && (
            <p className="text-xs text-red-600 mt-1">{errors.area}</p>
          )}
        </div>

        <div>
          {labelRequired("Zip Code", true)}
          <input
            type="text"
            name="zipCode"
            value={editFields.zipCode}
            onChange={handleChange}
            className={inputClass("zipCode")}
            placeholder="Zip Code"
          />
          {errors.zipCode && (
            <p className="text-xs text-red-600 mt-1">{errors.zipCode}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md transition font-semibold text-base"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {/* Only render the button when something actually changed */}
        {changed && (
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-sky-600 text-white py-2 rounded-md hover:bg-sky-700 transition font-semibold text-base shadow"
            >
              Update Details
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
