import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ElectionCard({ election, theme }) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/election/${election.status}/${election.id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 150 }}
      className={`relative group p-5 rounded-xl shadow-lg transition-all duration-300 ${
        theme === "dark"
          ? "bg-gray-800/90 hover:shadow-green-500/40"
          : "bg-white hover:shadow-[#4F62C2]/30"
      }`}
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-300 ${
          theme === "dark"
            ? "bg-linear-to-r from-green-400/20 to-emerald-400/20"
            : "bg-linear-to-r from-[#4F62C2]/20 to-[#3B5BFF]/20"
        }`}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Image */}
        <div className="relative overflow-hidden rounded-lg mb-4">
          <motion.img
            src={election.image}
            alt={election.title}
            className="w-full h-40 object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
          {/* Image overlay linear */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              theme === "dark"
                ? "bg-linear-to-t from-gray-900/60 to-transparent"
                : "bg-linear-to-t from-[#1E3A8A]/40 to-transparent"
            }`}
          />
        </div>

        {/* Title */}
        <h3
          className={`text-xl font-semibold mb-2 ${
            theme === "dark" ? "text-white" : "text-[#1E3A8A]"
          }`}
        >
          {election.title}
        </h3>

        {/* Description */}
        <p
          className={`text-sm mb-4 line-clamp-2 ${
            theme === "dark" ? "text-gray-300" : "text-[#5A678A]"
          }`}
        >
          {election.description}
        </p>

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <motion.button
            onClick={handleView}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-4 py-2 rounded-[var(--radius-md)] font-medium text-white shadow-[var(--shadow-accent)]"
            style={{ backgroundImage: "var(--linear-primary)" }}
          >
            View Details
          </motion.button>

          <motion.button
            onClick={() => navigate(`/election/${election.status}/${election.id}/candidates`)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`px-4 py-2 rounded-[var(--radius-md)] font-medium transition-all border ${
              theme === "dark"
                ? "text-[var(--text)] border-[var(--border)] bg-[var(--surface-1)] hover:bg-[var(--surface-2)]"
                : "text-[#1E3A8A] border-[#D6E0FF] bg-white hover:bg-[#F8FAFF]"
            }`}
          >
            Manifesto
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}