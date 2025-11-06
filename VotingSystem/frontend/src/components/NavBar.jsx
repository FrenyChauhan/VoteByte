import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Sun, Moon } from "lucide-react";

const NAV_HEIGHT_MOBILE = 64; // px ~ h-16
const NAV_HEIGHT_DESKTOP = 80; // px ~ h-20

const Navbar = ({ onToggleTheme, theme }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuthStore();

  const hiddenRoutes = ["/login", "/signup"];

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  if (hiddenRoutes.includes(location.pathname)) return null;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/elections", label: "Elections" },
    { path: "/profile", label: "Profile" },
  ];

  const hostLinks = [
    { path: "/host/dashboard", label: "Host Dashboard" },
    { path: "/host/elections", label: "My Elections" },
    { path: "/host/election/new", label: "Create Election" },
  ];

  const allNavLinks =
    isAuthenticated && user?.userType === "host"
      ? [...navLinks, ...hostLinks]
      : navLinks;

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
className={`sticky top-0 left-0 w-full z-50 h-16 md:h-20 backdrop-blur-md border-b bg-[var(--surface-1)] border-[var(--border)] text-[var(--text)] shadow-[var(--shadow-soft)]`}
      style={{
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 select-none">
          <Link
            to="/"
            className="text-2xl font-semibold tracking-tight"
            style={{
              backgroundImage: "var(--linear-primary)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            VoteByte
          </Link>
          {isAuthenticated && user?.userType === "host" && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white"
              style={{ backgroundImage: "var(--linear-primary)" }}>
              HOST
            </span>
          )}
        </motion.div>

        <div className="hidden md:flex items-center gap-6">
          {allNavLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <motion.div
                key={link.path}
                whileHover={{ y: -1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <Link
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${active ? "text-[var(--accent)]" : "text-[var(--text)]/80 hover:text-[var(--text)]"}`}
                >
                  {link.label}
                </Link>
                <span
                  className={`absolute -bottom-2 left-0 h-0.5 rounded-full transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"}`}
                  style={{ backgroundImage: "var(--linear-primary)" }}
                />
              </motion.div>
            );
          })}

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-md hover:opacity-90 transition"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              whileHover={{ scale: 1.03 }}
              onClick={logout}
              className="px-4 py-2 rounded-[var(--radius-md)] font-medium text-white shadow-[var(--shadow-accent)]"
              style={{ backgroundImage: "var(--linear-primary)" }}
            >
              Logout
            </motion.button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-[var(--radius-md)] font-medium text-white shadow-[var(--shadow-accent)]"
              style={{ backgroundImage: "var(--linear-primary)" }}
            >
              Login
            </Link>
          )}
        </div>

        <button
          className="md:hidden flex flex-col justify-center items-center gap-1.5 relative w-7 h-7"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <motion.span
            initial={false}
            animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 6 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-6 h-0.5 rounded-full bg-[var(--text)]"
          />
          <motion.span
            initial={false}
            animate={{ opacity: isOpen ? 0 : 1 }}
            transition={{ duration: 0.15 }}
            className="w-6 h-0.5 rounded-full bg-[var(--text)]"
          />
          <motion.span
            initial={false}
            animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -6 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-6 h-0.5 rounded-full bg-[var(--text)]"
          />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="md:hidden backdrop-blur-xl border-t px-6 py-4 flex flex-col gap-4 bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)]"
          >
            {allNavLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium ${active ? "text-[var(--accent)]" : "text-[var(--text)]/80 hover:text-[var(--text)]"}`}
                >
                  {link.label}
                </Link>
              );
            })}

            <motion.button
              onClick={onToggleTheme}
              className="p-2 rounded-md w-full flex items-center gap-2 text-sm font-medium hover:opacity-90"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              <span>Toggle Theme</span>
            </motion.button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="mt-2 text-white px-4 py-2 rounded-[var(--radius-md)] font-medium shadow-[var(--shadow-accent)]"
                style={{ backgroundImage: "var(--linear-primary)" }}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mt-2 text-white px-4 py-2 rounded-[var(--radius-md)] font-medium text-center shadow-[var(--shadow-accent)]"
                style={{ backgroundImage: "var(--linear-primary)" }}
              >
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
