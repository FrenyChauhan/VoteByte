import { useParams } from "react-router-dom";
import { useElectionStore } from "../store/electionStore";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";

export default function ActiveElection() {
  const { status = "active", id } = useParams();
  const { getElectionById, submitCandidateApplication } = useElectionStore();
  const election = useMemo(() => getElectionById(status, id), [getElectionById, status, id]);

  const [form, setForm] = useState({ name: "", party: "", manifesto: "", department: "", year: "", contact: "" });
  const [submittedId, setSubmittedId] = useState(null);
  const [error, setError] = useState("");

  if (!election) return <div className="min-h-screen p-10 text-[var(--text)]" style={{ background: "var(--bg)" }}>Election not found</div>;

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name || !form.party || !form.manifesto) {
      setError("Please fill in name, party, and manifesto.");
      return;
    }
    const id = submitCandidateApplication(election.id, form);
    setSubmittedId(id);
  };

  // Active elections view
  if (status === "active") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-10 text-[var(--text)]" style={{ background: "var(--bg)" }}>
        <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
        <p className="mb-6 text-[var(--text-muted)]">{election.description}</p>

        <h2 className="text-2xl mb-4">Candidates</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {election.candidates.map((c) => (
            <motion.div key={c.id} whileHover={{ scale: 1.02 }} className="p-4 rounded-lg border"
              style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
              <h3 className="text-lg font-semibold">{c.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{c.party}</p>
              <button className="mt-3 px-4 py-2 rounded-[var(--radius-sm)] text-white"
                style={{ backgroundImage: "var(--linear-primary)" }}>
                Vote
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Upcoming elections: show description + participate form
  if (status === "upcoming") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-10 text-[var(--text)]" style={{ background: "var(--bg)" }}>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="rounded-2xl p-6 border shadow-[var(--shadow-soft)]" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
            <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
            <p className="text-sm text-[var(--text-muted)] mb-4">{election.startDate} → {election.endDate}</p>
            <p className="leading-relaxed">{election.description}</p>
          </div>

          <div className="rounded-2xl p-6 border shadow-[var(--shadow-soft)]" style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}>
            <h2 className="text-2xl font-semibold mb-4">Participate as Candidate</h2>

            {submittedId ? (
              <div className="rounded-lg p-4 border" style={{ borderColor: "var(--border)", background: "var(--glass-bg)", backdropFilter: "blur(var(--glass-blur))" }}>
                <p className="font-medium">Application submitted.</p>
                <p className="text-sm text-[var(--text-muted)]">Status: Pending confirmation by admin.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="grid gap-4">
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <div>
                  <label className="block text-sm mb-1 text-[var(--text-muted)]">Full Name</label>
                  <input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}
                    className="w-full px-3 py-2 rounded-[var(--radius-sm)] border bg-transparent"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }} placeholder="Your name" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-[var(--text-muted)]">Party/Group</label>
                    <input value={form.party} onChange={(e)=>setForm({...form,party:e.target.value})}
                      className="w-full px-3 py-2 rounded-[var(--radius-sm)] border bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }} placeholder="e.g., InnovateX" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-[var(--text-muted)]">Contact Email</label>
                    <input value={form.contact} onChange={(e)=>setForm({...form,contact:e.target.value})}
                      className="w-full px-3 py-2 rounded-[var(--radius-sm)] border bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }} placeholder="you@example.com" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1 text-[var(--text-muted)]">Department</label>
                    <input value={form.department} onChange={(e)=>setForm({...form,department:e.target.value})}
                      className="w-full px-3 py-2 rounded-[var(--radius-sm)] border bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }} placeholder="e.g., CSE" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1 text-[var(--text-muted)]">Year</label>
                    <input value={form.year} onChange={(e)=>setForm({...form,year:e.target.value})}
                      className="w-full px-3 py-2 rounded-[var(--radius-sm)] border bg-transparent"
                      style={{ borderColor: "var(--border)", color: "var(--text)" }} placeholder="e.g., 3rd" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-[var(--text-muted)]">Manifesto (brief)</label>
                  <textarea value={form.manifesto} onChange={(e)=>setForm({...form,manifesto:e.target.value})}
                    className="w-full px-3 py-2 rounded-[var(--radius-sm)] border bg-transparent min-h-[120px]"
                    style={{ borderColor: "var(--border)", color: "var(--text)" }} placeholder="What will you do if elected?" />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-5 py-2 rounded-[var(--radius-md)] text-white"
                    style={{ backgroundImage: "var(--linear-primary)", boxShadow: "var(--shadow-accent)" }}>
                    Submit Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Fallback for other statuses
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen p-10 text-[var(--text)]" style={{ background: "var(--bg)" }}>
      <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
      <p className="mb-6 text-[var(--text-muted)]">{election.description}</p>
      <p className="text-sm text-[var(--text-muted)]">Status: {status}</p>
    </motion.div>
  );
}
