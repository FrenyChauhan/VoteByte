import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const elections = [
  {
    id: 1,
    title: "Student Council Election 2025",
    status: "active",
    totalVotes: 420,
    candidates: 4,
  },
  {
    id: 2,
    title: "Sports Captain Selection",
    status: "upcoming",
    totalVotes: 0,
    candidates: 5,
  },
  {
    id: 3,
    title: "Cultural Committee Election",
    status: "completed",
    totalVotes: 730,
    candidates: 6,
  },
];

const HostElections = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold text-green-400 mb-8">Your Elections</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {elections.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-gray-900/60 border border-green-400/20 rounded-2xl p-6 hover:border-green-400/40 transition-all duration-300"
          >
            <h3 className="text-xl font-semibold text-green-400 mb-2">{e.title}</h3>
            <p className="text-gray-400 capitalize mb-3">
              Status: <span className="text-green-300">{e.status}</span>
            </p>
            <p className="text-gray-400">Total Votes: {e.totalVotes}</p>
            <p className="text-gray-400 mb-4">Candidates: {e.candidates}</p>

            <div className="flex gap-3">
              <Link
                to={`/host/election/${e.id}/edit`}
                className="bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all"
              >
                Edit
              </Link>
              <Link
                to={`/host/election/${e.id}/candidates`}
                className="px-4 py-2 rounded-lg font-medium text-white shadow-[var(--shadow-accent)]"
                style={{ backgroundImage: "var(--linear-primary)" }}
              >
                Details
              </Link>
              <button className="bg-red-500/20 border border-red-400/30 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all">
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HostElections;
