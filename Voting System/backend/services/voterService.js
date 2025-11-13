const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Service layer for voter registration and management
 */

/**
 * Register a user as a voter for an election
 * @param {string} userId - User ID
 * @param {string} electionId - Election ID
 * @param {string} authType - Authentication type (OTP, AADHAR, etc.)
 * @returns {Object} voter registration confirmation
 */
exports.registerVoter = async (userId, electionId, authType) => {
    try {
        // Validate inputs
        if (!userId || !electionId || !authType) {
            throw new Error('User ID, Election ID, and Auth Type are required');
        }

        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { user_id: userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // 2. Check if election exists
        const election = await prisma.election.findUnique({
            where: { election_id: electionId }
        });

        if (!election) {
            throw new Error('Election not found');
        }

        // 3. Check if already registered as voter for this election
        const existingVoter = await prisma.voter.findFirst({
            where: {
                user_id: userId,
                election_id: electionId
            }
        });

        if (existingVoter) {
            throw new Error('User is already registered as a voter for this election');
        }

        // 4. Create voter record with auto-verification enabled
        const voter = await prisma.voter.create({
            data: {
                user_id: userId,
                election_id: electionId,
                authType: authType,
                verified: true,  // Auto-verify on registration so voter can vote immediately
                has_voted: false
            },
            include: {
                user: {
                    select: {
                        fullname: true,
                        email: true,
                        profile_photo: true
                    }
                }
            }
        });

        return {
            success: true,
            message: 'Voter registered successfully',
            voter: {
                voter_id: voter.voter_id,
                user_id: voter.user_id,
                election_id: voter.election_id,
                authType: voter.authType,
                verified: voter.verified,
                has_voted: voter.has_voted,
                user: voter.user
            }
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Verify a voter (mark as verified after authentication)
 * @param {string} voterId - Voter ID
 * @returns {Object} verification confirmation
 */
exports.verifyVoter = async (voterId) => {
    try {
        if (!voterId) {
            throw new Error('Voter ID is required');
        }

        // Check if voter exists
        const voter = await prisma.voter.findFirst({
            where: { voter_id: voterId }
        });

        if (!voter) {
            throw new Error('Voter not found');
        }

        // Update voter verification status
        const updatedVoter = await prisma.voter.update({
            where: { voter_id: voterId },
            data: { verified: true },
            include: {
                user: {
                    select: {
                        fullname: true,
                        email: true
                    }
                }
            }
        });

        return {
            success: true,
            message: 'Voter verified successfully',
            voter: updatedVoter
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get all voters for an election
 * @param {string} electionId - Election ID
 * @returns {Array} list of voters
 */
exports.getVotersForElection = async (electionId) => {
    try {
        if (!electionId) {
            throw new Error('Election ID is required');
        }

        const voters = await prisma.voter.findMany({
            where: { election_id: electionId },
            include: {
                user: {
                    select: {
                        fullname: true,
                        email: true,
                        profile_photo: true
                    }
                }
            },
            orderBy: { voter_id: 'asc' }
        });

        return voters;
    } catch (error) {
        throw error;
    }
};

/**
 * Check if user is registered as voter for an election
 * @param {string} userId - User ID
 * @param {string} electionId - Election ID
 * @returns {Object} voter status
 */
exports.getVoterStatus = async (userId, electionId) => {
    try {
        if (!userId || !electionId) {
            throw new Error('User ID and Election ID are required');
        }

        const voter = await prisma.voter.findFirst({
            where: {
                user_id: userId,
                election_id: electionId
            },
            include: {
                user: {
                    select: {
                        fullname: true,
                        email: true,
                        profile_photo: true
                    }
                }
            }
        });

        if (!voter) {
            return {
                registered: false,
                verified: false,
                has_voted: false,
                message: 'User is not registered as a voter for this election'
            };
        }

        return {
            registered: true,
            voter_id: voter.voter_id,
            verified: voter.verified,
            has_voted: voter.has_voted,
            voted_at: voter.voted_at,
            authType: voter.authType,
            user: voter.user
        };
    } catch (error) {
        throw error;
    }
};

/**
 * Get voter statistics for an election
 * @param {string} electionId - Election ID
 * @returns {Object} voter statistics
 */
exports.getVoterStatistics = async (electionId) => {
    try {
        if (!electionId) {
            throw new Error('Election ID is required');
        }

        const stats = await prisma.voter.groupBy({
            by: ['verified', 'has_voted'],
            where: { election_id: electionId },
            _count: true
        });

        const totalVoters = await prisma.voter.count({
            where: { election_id: electionId }
        });

        let verifiedCount = 0;
        let votedCount = 0;

        stats.forEach(stat => {
            if (stat.verified) verifiedCount += stat._count;
            if (stat.has_voted) votedCount += stat._count;
        });

        return {
            total_registered_voters: totalVoters,
            verified_voters: verifiedCount,
            voters_who_voted: votedCount,
            unverified_voters: totalVoters - verifiedCount,
            pending_voters: verifiedCount - votedCount
        };
    } catch (error) {
        throw error;
    }
};

module.exports = exports;
