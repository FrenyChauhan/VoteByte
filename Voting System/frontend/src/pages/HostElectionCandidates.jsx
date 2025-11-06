import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

// Mocked data per election id for demo
const MOCK_CANDIDATES = {
  1: [
    { id: "c1", name: "Aarav Mehta", role: "President", manifesto: "I will improve campus wi-fi, expand library hours, and create transparent budgeting dashboards for all societies." },
    { id: "c2", name: "Sara Nair", role: "President", manifesto: "Focus on mental health resources, peer mentorship programs, and greener campus initiatives with measurable goals." },
  ],
  2: [
    { id: "c3", name: "Vikram Rao", role: "Sports Captain", manifesto: "Inter-hostel leagues, modern equipment, and an athlete support fund for travel and tournaments." },
  ],
  3: [
    { id: "c4", name: "Isha Kapoor", role: "Cultural Lead", manifesto: "Monthly open-mic nights, inclusive workshops, and a student-run production studio for events." },
  ],
};

export default function HostElectionCandidates() {
  const { id } = useParams();
  const electionId = String(id);
  const [openId, setOpenId] = useState(null);
  const candidates = MOCK_CANDIDATES[electionId] || [];

  return (
    <div className="min-h-screen w-full px-6 py-10 text-[var(--text)]" style={{ background: "var(--bg)" }}>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text)" }}>
          Candidates & Manifestos
        </h1>
        <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
          Election ID: {electionId}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {candidates.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl p-5 border shadow-[var(--shadow-soft)]"
              style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>{c.name}</h3>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{c.role}</p>
                </div>
                <button
                  className="px-3 py-1.5 rounded-[var(--radius-sm)] text-white text-sm font-medium"
                  style={{ backgroundImage: "var(--linear-primary)", boxShadow: "var(--shadow-accent)" }}
                  onClick={() => setOpenId(c.id)}
                >
                  View Manifesto
                </button>
              </div>
            </motion.div>
          ))}

          {candidates.length === 0 && (
            <div className="md:col-span-2 text-center py-16" style={{ color: "var(--text-muted)" }}>
              No candidates found for this election.
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {openId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: "var(--overlay)" }}
            onClick={() => setOpenId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 240, damping: 24 }}
              className="w-full max-w-xl rounded-2xl p-6 border shadow-[var(--shadow-elevation)]"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const cand = candidates.find((x) => x.id === openId);
                if (!cand) return null;
                return (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold" style={{ color: "var(--text)" }}>{cand.name}</h2>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{cand.role}</p>
                      </div>
                      <button
                        className="px-3 py-1.5 rounded-[var(--radius-sm)] text-white text-sm font-medium"
                        style={{ backgroundImage: "var(--linear-primary)" }}
                        onClick={() => setOpenId(null)}
                      >
                        Close
                      </button>
                    </div>

                    <div className="rounded-xl p-4 border" style={{ borderColor: "var(--border)", background: "var(--glass-bg)", backdropFilter: "blur(var(--glass-blur))" }}>
                      <p className="leading-relaxed" style={{ color: "var(--text)" }}>{cand.manifesto}</p>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
