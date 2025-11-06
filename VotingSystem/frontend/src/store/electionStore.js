import { create } from "zustand";
import data from "../data/elections.json";

export const useElectionStore = create((set, get) => ({
  elections: { active: [], upcoming: [], past: [] },
  pendingCandidates: [], // { id, electionId, name, party, manifesto, department, year, contact, status, submittedAt }

  fetchElections: () => {
    set({ elections: data });
  },

  getElectionById: (type, id) => {
    const src = get().elections[type]?.length ? get().elections : data;
    return src[type]?.find((el) => el.id === id);
  },

  submitCandidateApplication: (electionId, payload) => {
    const application = {
      id: `${electionId}-${Date.now()}`,
      electionId,
      status: "pending",
      submittedAt: new Date().toISOString(),
      ...payload,
    };
    set((state) => ({ pendingCandidates: [application, ...state.pendingCandidates] }));
    return application.id;
  },

  getPendingCandidates: () => {
    return get().pendingCandidates;
  },
}));
