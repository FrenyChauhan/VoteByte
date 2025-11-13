import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Calendar, Users } from "lucide-react";

export default function ElectionCard({ election, theme }) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/election/${election.status}/${election.election_id}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
        {/* Status Badge */}
        <div className="mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
            election.status === 'UPCOMING' ? 'bg-blue-500/20 text-blue-300' :
            election.status === 'ONGOING' ? 'bg-green-500/20 text-green-300' :
            'bg-gray-500/20 text-gray-300'
          }`}>
            {election.status}
          </span>
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

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className={theme === "dark" ? "text-gray-400" : "text-[#5A678A]"}>
              {election.total_candidates || 0} Candidates
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <span className={theme === "dark" ? "text-gray-400" : "text-[#5A678A]"}>
              {formatDate(election.start_time)}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-2">
          <motion.button
            onClick={() => navigate(`/election/${election.status}/${election.election_id}${election.status === "COMPLETED" ? "" : "/candidates"}`)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-full px-4 py-2 rounded-lg font-medium shadow-lg ${
              election.status === "COMPLETED"
                ? "text-white"
                : theme === "dark"
                  ? "text-gray-300 border border-gray-600 bg-gray-700/50 hover:bg-gray-600/50"
                  : "text-[#1E3A8A] border border-[#4F62C2] bg-[#F0F4FF] hover:bg-[#E8ECFF]"
            }`}
            style={election.status === "COMPLETED" ? { backgroundImage: "var(--linear-primary)" } : {}}
          >
            {election.status === "COMPLETED" ? "View Results" : "Cast Vote"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}