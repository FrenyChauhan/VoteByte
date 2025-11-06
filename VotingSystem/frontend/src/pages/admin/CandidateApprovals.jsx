import { useElectionStore } from "../../store/electionStore";

export default function CandidateApprovals() {
  const { getPendingCandidates } = useElectionStore();
  const pending = getPendingCandidates();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Pending Candidate Approvals</h1>
      <div className="grid gap-4">
        {pending.length === 0 && (
          <div className="text-gray-500">No pending applications.</div>
        )}
        {pending.map((p) => (
          <div key={p.id} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{p.name} — {p.party}</p>
                <p className="text-sm text-gray-600">Election ID: {p.electionId} • Dept: {p.department} • Year: {p.year}</p>
                <p className="text-sm text-gray-600">Submitted: {new Date(p.submittedAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Manifesto:</span> {p.manifesto}
            </div>
            <div className="mt-3">
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
