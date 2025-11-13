import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../store/authStore";

const EmailVerification = ({ theme }) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const { error, isLoading, verifyEmail } = useAuthStore();

  const handleChange = (index, value) => {
    const newCode = [...code];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) newCode[i] = pasted[i] || "";
      setCode(newCode);
      const lastFilled = newCode.findLastIndex((d) => d !== "");
      inputRefs.current[Math.min(lastFilled + 1, 5)]?.focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      await verifyEmail(verificationCode);
      toast.success("Email Verified Successfully");
      // Redirect to login page after successful verification
      navigate("/login");
    } catch (err) {
      console.error("ERROR IN VERIFYING:", err);
    }
  };

  useEffect(() => {
    if (code.every((d) => d !== "")) handleSubmit(new Event("submit"));
  }, [code]);

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
              ? "bg-linear-to-r from-green-300 to-emerald-600"
              : "bg-linear-to-r from-[#3B5BFF] to-[#2F49D1]"
          } text-transparent bg-clip-text`}
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Verify Your Email
        </h2>

        <p
          className={`text-center mb-6 ${
            theme === "dark" ? "text-gray-300" : "text-gray-700"
          }`}
        >
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength="6"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`w-12 h-12 text-center text-2xl font-bold rounded-lg border-2 transition-all focus:outline-none focus:ring-2 ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-700 focus:border-green-500 focus:ring-green-500"
                    : "bg-[#F8FAFF] text-[#1E3A8A] border-[#D6E0FF] focus:border-[#3B5BFF] focus:ring-[#3B5BFF]"
                }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 font-semibold mt-2 text-center">
              {error}
            </p>
          )}

          <motion.button
            className={`mt-5 w-full py-3 px-4 font-bold rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${
              theme === "dark"
                ? "bg-linear-to-r from-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-600 text-white focus:ring-green-500 focus:ring-offset-gray-900"
                : "bg-linear-to-r from-[#3B5BFF] to-[#2F49D1] hover:from-[#2F49D1] hover:to-[#3B5BFF] text-white focus:ring-[#3B5BFF] focus:ring-offset-white"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify"}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default EmailVerification;
