const { PrismaClient } = require('@prisma/client');
const ElectionResultSummary = require('../models/ElectionResultSummary');
const CandidateResult = require('../models/CandidateResult');

class ResultService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async listCompletedResults() {
        const completedElections = await this.prisma.election.findMany({
            where: { status: 'COMPLETED' },
            include: {
                candidates: {
                    where: { status: 'APPROVED' },
                    include: {
                        user: {
                            select: {
                                fullname: true,
                                profile_photo: true
                            }
                        }
                    },
                    orderBy: { total_votes: 'desc' }
                },
                voters: {
                    select: { voter_id: true }
                },
                results: true
            },
            orderBy: { end_time: 'desc' }
        });

        const summaries = [];

        for (const election of completedElections) {
            const summary = await this.#buildSummary(election, { persist: false });
            summaries.push(summary.toJSON());
        }

        return summaries;
    }

    async getResultByElectionId(electionId, { regenerate = false } = {}) {
        if (!electionId) {
            throw new Error('Election ID is required');
        }

        const election = await this.prisma.election.findUnique({
            where: { election_id: electionId },
            include: {
                candidates: {
                    where: { status: 'APPROVED' },
                    include: {
                        user: {
                            select: {
                                fullname: true,
                                profile_photo: true
                            }
                        }
                    },
                    orderBy: { total_votes: 'desc' }
                },
                voters: {
                    select: { voter_id: true }
                },
                results: true
            }
        });

        if (!election) {
            throw new Error('Election not found');
        }

        if (election.status !== 'COMPLETED') {
            throw new Error('Election is not completed yet');
        }

        const summary = await this.#buildSummary(election, { persist: true, regenerate });
        return summary.toJSON();
    }

    async generateResult(electionId) {
        return this.getResultByElectionId(electionId, { regenerate: true });
    }

    async #buildSummary(election, { persist = true, regenerate = false } = {}) {
        const totalVotesCast = await this.prisma.vote.count({
            where: { election_id: election.election_id }
        });

        const totalRegistered = election.total_voters || election.voters.length || 0;
        const voterTurnout = totalRegistered > 0
            ? Number(((totalVotesCast / totalRegistered) * 100).toFixed(2))
            : 0;

        const candidates = election.candidates.map(candidate => new CandidateResult({
            candidate_id: candidate.candidate_id,
            election_id: candidate.election_id,
            name: candidate.user ? candidate.user.fullname : 'Unknown Candidate',
            party_name: candidate.party_name,
            symbol: candidate.symbol,
            total_votes: candidate.total_votes,
            vote_percentage: totalVotesCast > 0
                ? Number(((candidate.total_votes / totalVotesCast) * 100).toFixed(2))
                : 0,
            profile_photo: candidate.user ? candidate.user.profile_photo : null
        }));

        const winnerCandidate = candidates.length > 0 ? candidates[0] : null;

        const summary = new ElectionResultSummary({
            election_id: election.election_id,
            title: election.title,
            status: election.status,
            generated_at: election.results?.result_generated_at || new Date(),
            total_votes: totalVotesCast,
            total_registered_voters: totalRegistered,
            voter_turnout_percentage: voterTurnout,
            candidates,
            winner: winnerCandidate,
            remarks: election.results?.remarks || null,
            timeframe: {
                start: election.start_time,
                end: election.end_time
            }
        });

        if (persist) {
            const shouldPersist = regenerate || !election.results
                || election.results.total_votes !== summary.totalVotes
                || election.results.voter_turnout_percentage !== summary.voterTurnoutPercentage
                || (winnerCandidate && election.results.winner_candidate_id !== winnerCandidate.candidate_id);

            if (shouldPersist) {
                await this.#persistResult(election.election_id, summary, winnerCandidate);
            }
        }

        return summary;
    }

    async #persistResult(electionId, summary, winnerCandidate) {
        await this.prisma.$transaction(async (tx) => {
            await tx.electionResult.upsert({
                where: { election_id: electionId },
                update: {
                    total_votes: summary.totalVotes,
                    voter_turnout_percentage: summary.voterTurnoutPercentage,
                    winner_candidate_id: winnerCandidate ? winnerCandidate.candidate_id : null,
                    winner_election_id: winnerCandidate ? electionId : null,
                    remarks: summary.remarks || null,
                    result_generated_at: new Date()
                },
                create: {
                    election_id: electionId,
                    total_votes: summary.totalVotes,
                    voter_turnout_percentage: summary.voterTurnoutPercentage,
                    winner_candidate_id: winnerCandidate ? winnerCandidate.candidate_id : null,
                    winner_election_id: winnerCandidate ? electionId : null,
                    remarks: summary.remarks || null
                }
            });

            if (winnerCandidate) {
                await tx.election.update({
                    where: { election_id: electionId },
                    data: {
                        winner_candidate_id: winnerCandidate.candidate_id,
                        winner_election_id: electionId
                    }
                });
            }
        });
    }
}

module.exports = new ResultService();

