import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: "🏠" },
    { name: "Extract", href: "/extract", icon: "📤" },
    { name: "Parse", href: "/parse", icon: "📄" },
    { name: "Factures", href: "/factures", icon: "📋" },
    { name: "Index", href: "/index", icon: "🔍" },
    { name: "Endpoint Query", href: "/endpoint-query", icon: "🔌" },
  ];

  return (
    <motion.nav
      className="bg-gray-900/90 backdrop-blur-lg border-b border-gray-800 sticky top-0 z-50 shadow-lg "
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 80, damping: 15 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* ===== Brand ===== */}
          <div className="flex items-center">
            <Link
              to="/"
              className="text-lg sm:text-xl font-bold text-white flex items-center group"
            >
              <motion.span
                className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl mr-2 shadow-lg"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                📊
              </motion.span>
              <span className="group-hover:text-blue-400 transition-all duration-300">
                Invoice Manager
              </span>
            </Link>

            {/* ===== Desktop Navigation ===== */}
            <div className="hidden sm:flex sm:space-x-6 ml-12">
              {navigation.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        active
                          ? "text-blue-400 bg-gray-800/30"
                          : "text-gray-300 hover:text-white hover:bg-gray-800/20"
                      }`}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                    {/* Underline animation */}
                    {active && (
                      <motion.div
                        layoutId="underline"
                        className="absolute left-0 right-0 h-[2px] bg-blue-500 rounded-full bottom-1"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ===== Right Side (Bell Icon) ===== */}
          <div className="hidden sm:flex items-center space-x-4">
            <motion.button
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition"
              whileTap={{ scale: 0.9 }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 
                  0118 14.158V11a6.002 6.002 0 
                  00-4-5.659V5a2 2 0 10-4 0v.341C7.67 
                  6.165 6 8.388 6 11v3.159c0 
                  .538-.214 1.055-.595 1.436L4 
                  17h5m6 0v1a3 3 0 11-6 0v-1m6 
                  0H9"
                />
              </svg>
            </motion.button>
          </div>

          {/* ===== Mobile Menu Button ===== */}
          <div className="sm:hidden">
            <motion.button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg focus:outline-none transition"
              whileTap={{ scale: 0.9 }}
            >
              {mobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* ===== Mobile Menu ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="sm:hidden bg-gray-900/95 border-t border-gray-800 shadow-lg rounded-b-3xl overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="px-2 pt-3 pb-4 space-y-2">
              {navigation.map((item) => {
                const active = location.pathname === item.href;
                return (
                  <motion.div
                    key={item.name}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Link
                      to={item.href}
                      className={`block px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          : "text-gray-300 hover:bg-gray-800 hover:text-white"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
