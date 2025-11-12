const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const Candidate = require('../models/Candidate');

class CandidateService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    /**
     * Register a user as a candidate for an election
     * @param {Object} candidateData - Candidate information
     * @param {string} userId - User ID registering as candidate
     * @returns {Candidate} - Created candidate instance
     */
    async registerCandidate(candidateData, userId) {
        try {
            const candidate = new Candidate({
                ...candidateData,
                user_id: userId,
                status: 'APPROVED',
                candidate_id: randomUUID()
            });

            // Validate candidate data
            if (!candidate.isValid()) {
                const errors = candidate.getValidationErrors();
                throw new Error(`Invalid candidate data: ${errors.join(', ')}`);
            }

            // Check if user already registered as candidate in this election
            const existingCandidate = await this.prisma.candidate.findFirst({
                where: {
                    election_id: candidateData.election_id,
                    user_id: userId
                }
            });

            if (existingCandidate) {
                throw new Error('User is already registered as a candidate for this election');
            }

            // Check if election exists and is in appropriate status
            const election = await this.prisma.election.findUnique({
                where: { election_id: candidateData.election_id }
            });

            if (!election) {
                throw new Error('Election not found');
            }

            if (election.status === 'COMPLETED' || election.status === 'CANCELLED') {
                throw new Error(`Cannot register candidates for ${election.status.toLowerCase()} elections`);
            }

            // Create candidate
            const createdCandidate = await this.prisma.candidate.create({
                data: {
                    candidate_id: candidate.candidate_id,
                    election_id: candidateData.election_id,
                    user_id: userId,
                    party_name: candidateData.party_name,
                    symbol: candidateData.symbol,
                    manifesto: candidateData.manifesto || '',
                    age: candidateData.age,
                    qualification: candidateData.qualification,
                    status: 'PENDING'
                },
                include: {
                    user: {
                        select: {
                            user_id: true,
                            fullname: true,
                            email: true,
                            profile_photo: true
                        }
                    }
                }
            });

            // Update total_candidates count in election
            await this.prisma.election.update({
                where: { election_id: candidateData.election_id },
                data: {
                    total_candidates: {
                        increment: 1
                    }
                }
            });

            return new Candidate(createdCandidate);
        } catch (error) {
            throw new Error(`Failed to register candidate: ${error.message}`);
        }
    }

    /**
     * Approve a candidate registration
     * @param {string} candidateId - Candidate ID to approve
     * @param {string} electionCreatorId - ID of election creator (admin)
     * @returns {Candidate} - Updated candidate instance
     */
    async approveCandidate(candidateId, electionCreatorId) {
        try {
            // Get candidate with election info
            const candidate = await this.prisma.candidate.findFirst({
                where: { candidate_id: candidateId },
                include: { election: true }
            });


            if (!candidate) {
                throw new Error('Candidate not found');
            }

            // Verify that the requester is the election creator
            const adminCheck = await this.prisma.admin.findFirst({
                where: {
                    user_id: electionCreatorId,
                    election_id: candidate.election_id
                }
            });

            if (!adminCheck) {
                throw new Error('Unauthorized: Only election creator can approve candidates');
            }

            // Update candidate status
            const updatedCandidate = await this.prisma.candidate.update({
                where: { candidate_id: candidateId },
                data: { status: 'APPROVED' },
                include: {
                    user: {
                        select: {
                            user_id: true,
                            fullname: true,
                            email: true,
                            profile_photo: true
                        }
                    }
                }
            });

            return new Candidate(updatedCandidate);
        } catch (error) {
            throw new Error(`Failed to approve candidate: ${error.message}`);
        }
    }

    /**
     * Reject a candidate registration
     * @param {string} candidateId - Candidate ID to reject
     * @param {string} electionCreatorId - ID of election creator (admin)
     * @param {string} reason - Rejection reason
     * @returns {Candidate} - Updated candidate instance
     */
    async rejectCandidate(candidateId, electionCreatorId, reason = '') {
        try {
            const candidate = await this.prisma.candidate.findFirst({
                where: { candidate_id: candidateId },
                include: { election: true }
            });

            if (!candidate) {
                throw new Error('Candidate not found');
            }

            // Verify that the requester is the election creator
            const adminCheck = await this.prisma.admin.findFirst({
                where: {
                    user_id: electionCreatorId,
                    election_id: candidate.election_id
                }
            });

            if (!adminCheck) {
                throw new Error('Unauthorized: Only election creator can reject candidates');
            }

            // Update candidate status
            const updatedCandidate = await this.prisma.candidate.update({
                where: { candidate_id: candidateId },
                data: { 
                    status: 'REJECTED'
                },
                include: {
                    user: {
                        select: {
                            user_id: true,
                            fullname: true,
                            email: true,
                            profile_photo: true
                        }
                    }
                }
            });

            // Decrement total_candidates count
            await this.prisma.election.update({
                where: { election_id: candidate.election_id },
                data: {
                    total_candidates: {
                        decrement: 1
                    }
                }
            });

            return new Candidate(updatedCandidate);
        } catch (error) {
            throw new Error(`Failed to reject candidate: ${error.message}`);
        }
    }

    /**
     * Get all candidates for an election
     * @param {string} electionId - Election ID
     * @param {string} status - Filter by status (PENDING, APPROVED, REJECTED)
     * @returns {Array<Candidate>} - Array of candidate instances
     */
    async getCandidatesByElection(electionId, status = null) {
        try {
            const whereClause = { election_id: electionId };
            if (status) {
                whereClause.status = status;
            }

            const candidates = await this.prisma.candidate.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            user_id: true,
                            fullname: true,
                            email: true,
                            profile_photo: true
                        }
                    }
                },
                orderBy: { registered_at: 'desc' }
            });

            return candidates.map(c => new Candidate(c));
        } catch (error) {
            throw new Error(`Failed to fetch candidates: ${error.message}`);
        }
    }

    /**
     * Get approved candidates for an election (public view)
     * @param {string} electionId - Election ID
     * @returns {Array<Candidate>} - Array of approved candidate instances
     */
    async getApprovedCandidates(electionId) {
        try {
            const candidates = await this.prisma.candidate.findMany({
                where: {
                    election_id: electionId,
                    status: 'APPROVED'
                },
                include: {
                    user: {
                        select: {
                            fullname: true,
                            profile_photo: true
                        }
                    }
                },
                orderBy: { total_votes: 'desc' }
            });

            return candidates.map(c => new Candidate(c));
        } catch (error) {
            throw new Error(`Failed to fetch approved candidates: ${error.message}`);
        }
    }

    /**
     * Get single candidate by ID
     * @param {string} candidateId - Candidate ID
     * @returns {Candidate} - Candidate instance
     */
    async getCandidateById(candidateId) {
        try {
            const candidate = await this.prisma.candidate.findFirst({
                where: { candidate_id: candidateId },
                include: {
                    user: {
                        select: {
                            user_id: true,
                            fullname: true,
                            email: true,
                            profile_photo: true
                        }
                    }
                }
            });

            if (!candidate) {
                throw new Error('Candidate not found');
            }

            return new Candidate(candidate);
        } catch (error) {
            throw new Error(`Failed to fetch candidate: ${error.message}`);
        }
    }

    /**
     * Get candidate profile for public view
     * @param {string} candidateId - Candidate ID
     * @returns {Candidate} - Candidate instance (public data only)
     */
    async getCandidateProfile(candidateId) {
        try {
            const candidate = await this.getCandidateById(candidateId);
            
            // Only return approved or ongoing candidates
            if (candidate.status !== 'APPROVED') {
                throw new Error('Candidate profile not available');
            }

            return candidate;
        } catch (error) {
            throw new Error(`Failed to fetch candidate profile: ${error.message}`);
        }
    }

    /**
     * Get candidates registered by a specific user
     * @param {string} userId - User ID
     * @returns {Array<Candidate>} - Array of candidate instances
     */
    async getCandidatesByUser(userId) {
        try {
            const candidates = await this.prisma.candidate.findMany({
                where: { user_id: userId },
                include: {
                    election: {
                        select: {
                            election_id: true,
                            title: true,
                            start_time: true,
                            end_time: true,
                            status: true
                        }
                    },
                    user: {
                        select: {
                            user_id: true,
                            fullname: true,
                            email: true,
                            profile_photo: true
                        }
                    }
                },
                orderBy: { registered_at: 'desc' }
            });

            return candidates.map(c => new Candidate(c));
        } catch (error) {
            throw new Error(`Failed to fetch user candidates: ${error.message}`);
        }
    }

    /**
     * Get pending candidates for approval
     * @param {string} electionId - Election ID
     * @returns {Array<Candidate>} - Array of pending candidate instances
     */
    async getPendingCandidates(electionId) {
        try {
            return this.getCandidatesByElection(electionId, 'PENDING');
        } catch (error) {
            throw new Error(`Failed to fetch pending candidates: ${error.message}`);
        }
    }

    /**
     * Get candidate statistics for an election
     * @param {string} electionId - Election ID
     * @returns {Object} - Statistics object
     */
    async getCandidateStats(electionId) {
        try {
            const stats = await this.prisma.candidate.groupBy({
                by: ['status'],
                where: { election_id: electionId },
                _count: {
                    candidate_id: true
                }
            });

            const result = {
                total: 0,
                approved: 0,
                pending: 0,
                rejected: 0
            };

            stats.forEach(stat => {
                result[stat.status.toLowerCase()] = stat._count.candidate_id;
                result.total += stat._count.candidate_id;
            });

            return result;
        } catch (error) {
            throw new Error(`Failed to fetch candidate stats: ${error.message}`);
        }
    }

    /**
     * Update candidate information
     * @param {string} candidateId - Candidate ID
     * @param {Object} updateData - Data to update
     * @param {string} userId - User ID (for authorization)
     * @returns {Candidate} - Updated candidate instance
     */
    async updateCandidate(candidateId, updateData, userId) {
        try {
            const candidate = await this.prisma.candidate.findFirst({
                where: { candidate_id: candidateId }
            });

            if (!candidate) {
                throw new Error('Candidate not found');
            }

            // Only candidate owner can update
            if (candidate.user_id !== userId) {
                throw new Error('Unauthorized: Can only update your own candidate profile');
            }

            // Can only update if pending
            if (candidate.status !== 'PENDING') {
                throw new Error('Can only update pending candidate registrations');
            }

            const updateCandidate = new Candidate({
                ...candidate,
                ...updateData
            });

            if (!updateCandidate.isValid()) {
                const errors = updateCandidate.getValidationErrors();
                throw new Error(`Invalid candidate data: ${errors.join(', ')}`);
            }

            const updated = await this.prisma.candidate.update({
                where: {
                    candidate_id_election_id: {
                        candidate_id: candidateId,
                        election_id: candidate.election_id
                    }
                },
                data: {
                    party_name: updateData.party_name || candidate.party_name,
                    symbol: updateData.symbol || candidate.symbol,
                    manifesto: updateData.manifesto || candidate.manifesto,
                    age: updateData.age || candidate.age,
                    qualification: updateData.qualification || candidate.qualification
                },
                include: {
                    user: {
                        select: {
                            user_id: true,
                            fullname: true,
                            email: true,
                            profile_photo: true
                        }
                    }
                }
            });

            return new Candidate(updated);
        } catch (error) {
            throw new Error(`Failed to update candidate: ${error.message}`);
        }
    }

    /**
     * Delete candidate registration
     * @param {string} candidateId - Candidate ID
     * @param {string} userId - User ID (for authorization)
     * @returns {boolean} - True if deleted successfully
     */
    async deleteCandidate(candidateId, userId) {
        try {
            const candidate = await this.prisma.candidate.findUnique({
                where: { candidate_id: candidateId }
            });

            if (!candidate) {
                throw new Error('Candidate not found');
            }

            // Only candidate owner can delete
            if (candidate.user_id !== userId) {
                throw new Error('Unauthorized: Can only delete your own candidate profile');
            }

            // Can only delete if pending
            if (candidate.status !== 'PENDING') {
                throw new Error('Can only delete pending candidate registrations');
            }

            await this.prisma.candidate.delete({
                where: { candidate_id: candidateId }
            });

            // Decrement total_candidates count
            await this.prisma.election.update({
                where: { election_id: candidate.election_id },
                data: {
                    total_candidates: {
                        decrement: 1
                    }
                }
            });

            return true;
        } catch (error) {
            throw new Error(`Failed to delete candidate: ${error.message}`);
        }
    }
}

module.exports = CandidateService;
