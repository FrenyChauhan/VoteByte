import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect,useState} from "react";
import { useAuthStore } from "./store/authStore";
import LoadingSpinner from "./components/LoadingSpinner";
import UserRoutes from "./routes/UserRoutes";
import AdminRoutes from "./routes/AdminRoutes";

export default function App() {
  const { isCheckingAuth, checkAuth } = useAuthStore();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(()=>{
    localStorage.setItem("theme", theme);
    // Apply theme to <html> for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
  },[theme]);

  const toggleTheme = () => {
    setTheme((theme) => (theme === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    checkAuth();
    // Ensure initial data-theme is set
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  if(isCheckingAuth) return <LoadingSpinner theme={theme} />;

  return (
    <>
     <style>
        {`
          ::selection {
            background-color: var(--accent);
            color: white;
          }
          ::-moz-selection {
            background-color: var(--accent);
            color: white;
          }
        `}
      </style>
      <Routes>
        <Route path="/admin/*" element={<AdminRoutes onToggleTheme ={toggleTheme} theme={theme} />} />
        <Route path="/*" element={<UserRoutes onToggleTheme={toggleTheme} theme={theme} />} />
      </Routes>
      <Toaster
  position="bottom-right"
  reverseOrder={false}
  toastOptions={{
    duration: 3000,
    style: {
      background: "rgba(17, 24, 39, 0.9)", // tailwind's gray-900 with transparency
      color: "#ECFDF5", // light emerald-ish text
      border: "1px solid rgba(16, 185, 129, 0.3)", // emerald-500 border glow
      borderRadius: "0.75rem",
      padding: "12px 16px",
      fontSize: "0.95rem",
      backdropFilter: "blur(10px)",
      boxShadow:
        "0 4px 20px rgba(16, 185, 129, 0.15), inset 0 0 10px rgba(16, 185, 129, 0.05)",
    },
    success: {
      iconTheme: {
        primary: "#10B981", // emerald-500
        secondary: "#052e16", // dark bg for contrast
      },
      style: {
        background: "rgba(6, 78, 59, 0.9)", // emerald-900
        border: "1px solid rgba(52, 211, 153, 0.5)",
      },
    },
    error: {
      iconTheme: {
        primary: "#EF4444", // red-500
        secondary: "#450a0a",
      },
      style: {
        background: "rgba(127, 29, 29, 0.9)", // red-900
        border: "1px solid rgba(248, 113, 113, 0.4)",
      },
    },
    loading: {
      style: {
        background: "rgba(30, 64, 175, 0.9)", // blue-800
        border: "1px solid rgba(147, 197, 253, 0.4)",
      },
    },
  }}
/>

    </>
  );
}
