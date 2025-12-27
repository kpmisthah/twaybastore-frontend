import React from "react";
import { Link } from "react-router-dom";
import qrCode from "/download.png";

const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 text-sm pb-12 sm:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== Top Section ===== */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 py-10">
          {/* About */}
          <div>
            <h3 className="text-gray-100 font-semibold uppercase tracking-wide mb-3">
              About
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/Contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/About-twayba-group"
                  className="hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-gray-100 font-semibold uppercase tracking-wide mb-3">
              Socials
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61574401557016"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@twayba.store"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/twayba_store?igsh=MWRjbXczdXRmYTNpZg=="
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h3 className="text-gray-100 font-semibold uppercase tracking-wide mb-3">
              Policy
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/Cancellation"
                  className="hover:text-white transition-colors"
                >
                  Cancellation
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-use"
                  className="hover:text-white transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  to="/Privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Brands */}
          <div>
            <h3 className="text-gray-100 font-semibold uppercase tracking-wide mb-3">
              Our Brands
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="" className="hover:text-white">
                  Fitsupply (Fitness)
                </Link>
              </li>
              <li>
                <Link to="" className="hover:text-white">
                  Neat Shelving
                </Link>
              </li>
            </ul>
          </div>

          {/* Mail */}
          <div>
            <h3 className="text-gray-100 font-semibold uppercase tracking-wide mb-3">
              Mail Us
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:support@twayba.com"
                  className="hover:text-white"
                >
                  support@twayba.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-800" />

        {/* ===== Store Locations Section ===== */}
        <div className="pt-12">
          <h3 className="text-gray-100 text-lg font-semibold mb-6">
            Store Locations
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-400 items-center">
            {/* Store Info */}
            <div>
              <p className="text-gray-100 font-medium">Twayba – Malta</p>
              <p>
                676 Triq il-Kbira San Ġużepp, Hamrun, Il-Hamrun, Malta, HMR 1012
              </p>
              <p>Phone: +356 99139639</p>
              <a
                href="https://maps.app.goo.gl/Bk7CBmkEPkLyJGRTA"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-white text-sm"
              >
                View on Google Maps
              </a>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center sm:items-start">
              <img
                src={qrCode}
                alt="Twayba Google Review QR"
                className="w-32 h-32 object-contain rounded-md border border-gray-800 shadow-lg"
              />
              <p className="text-gray-400 text-xs mt-2 text-center sm:text-left">
                Scan to leave a review on Google
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-gray-800"></div>

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>
            © 2025 <span className="text-gray-300 font-medium">Twayba.com</span>
            . All rights reserved.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <span>We accept Stripe, UPI, Wallets & Cards</span>
            <Link
              to="/help"
              className="text-gray-200 font-medium hover:text-white transition"
            >
              Live Help Center
            </Link>
          </div>
        </div>

        {/* ===== Powered by Omnix Studio ===== */}
        <div className="text-center pb-8">
          <a
            href="https://omnixstudio.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-gray-400 hover:text-blue-400 font-medium transition-colors duration-300"
          >
            Powered by <span className="text-gray-100 hover:text-blue-500">Omnix Studio</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
