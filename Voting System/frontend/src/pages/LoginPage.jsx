import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";

const LoginPage = ({ theme }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, isAuthenticated, error, user, isLoading } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const success = await login(email, password);
    if (success) {
      toast.success("Login Successful");
      // Determine where to navigate based on user role
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'HOST') {
        navigate("/host/elections");
      } else {
        navigate("/dashboard");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1, ease: "easeOut" }}
      className={`max-w-md w-full rounded-2xl shadow-xl backdrop-blur-xl transition-all duration-500 ${
        theme === "dark"
          ? "bg-gray-800 border border-green-500/20"
          : "bg-white/70 border border-[#3B5BFF]/20"
      }`}
    >
      <div className="p-8">
        <h2
          className={`text-5xl font-bold mb-6 text-center ${
            theme === "dark"
              ? "bg-linear-to-r from-green-200 to-emerald-700"
              : "bg-linear-to-r from-[#3B5BFF] to-[#4F62C2]"
          } text-transparent bg-clip-text`}
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Welcome Back
        </h2>

        <form onSubmit={handleLogin}>
          <Input
            icon={Mail}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            theme={theme}
          />
          <Input
            icon={Lock}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            theme={theme}
          />

          <Link
            to="/forgot-password"
            className={`text-sm ${
              theme === "dark" ? "text-green-400" : "text-[#3B5BFF]"
            } hover:underline`}
          >
            Forgot password?
          </Link>

          {error && (
            <p className="text-red-500 font-semibold mb-2 mt-1">{error}</p>
          )}

          <motion.button
            className={`mt-5 w-full py-3 px-4 font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 transition duration-200 ${
              theme === "dark"
                ? "bg-linear-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 focus:ring-green-500 focus:ring-offset-gray-900"
                : "bg-linear-to-r from-[#3B5BFF] to-[#4F62C2] text-white hover:from-[#3546A7] hover:to-[#3B5BFF] focus:ring-[#3B5BFF] focus:ring-offset-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>
      </div>

      {/* Footer */}
      <div
        className={`px-8 py-4 flex justify-center ${
          theme === "dark"
            ? "bg-gray-900/50 text-gray-400"
            : "bg-[#F0F4FF]/70 text-gray-600"
        }`}
      >
        <p className="text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className={`font-medium hover:underline ${
              theme === "dark" ? "text-green-400" : "text-[#3B5BFF]"
            }`}
          >
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginPage;
