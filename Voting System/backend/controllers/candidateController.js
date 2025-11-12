const CandidateService = require('../services/candidateService');
const ApiResponse = require('../utils/ApiResponse');

const candidateService = new CandidateService();

/**
 * Register user as a candidate for an election
 * POST /api/candidates/register
 */
async function registerCandidate(req, res) {
    try {
        const { election_id, party_name, symbol, manifesto, age, qualification } = req.body;
        const userId = req.user.user_id;

        // Validation
        if (!election_id || !party_name || !symbol || !age || !qualification) {
            return ApiResponse.badRequest(res, 'Missing required fields: election_id, party_name, symbol, age, qualification');
        }

        const candidate = await candidateService.registerCandidate(
            {
                election_id,
                party_name,
                symbol,
                manifesto,
                age: parseInt(age),
                qualification
            },
            userId
        );

        return ApiResponse.success(
            res,
            'Candidate registered successfully',
            candidate.toJSON(),
            201
        );
    } catch (error) {
        console.error('registerCandidate error:', error);
        
        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }
        if (error.message.includes('already')) {
            return ApiResponse.error(res, error.message, 409);
        }
        if (error.message.includes('Invalid')) {
            return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Approve a candidate registration
 * PUT /api/candidates/:candidateId/approve
 */
async function approveCandidate(req, res) {
    try {
        const { candidateId } = req.params;
        const userId = req.user.user_id;

        if (!candidateId) {
            return ApiResponse.badRequest(res, 'Candidate ID is required');
        }

        const candidate = await candidateService.approveCandidate(candidateId, userId);

        return ApiResponse.success(
            res,
            'Candidate approved successfully',
            candidate.toJSON()
        );
    } catch (error) {
        console.error('approveCandidate error:', error);
        
        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }
        if (error.message.includes('Unauthorized')) {
            return ApiResponse.unauthorized(res, error.message);
        }

        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Reject a candidate registration
 * PUT /api/candidates/:candidateId/reject
 */
async function rejectCandidate(req, res) {
    try {
        const { candidateId } = req.params;
        const { reason } = req.body;
        const userId = req.user.user_id;

        if (!candidateId) {
            return ApiResponse.badRequest(res, 'Candidate ID is required');
        }

        const candidate = await candidateService.rejectCandidate(candidateId, userId, reason);

        return ApiResponse.success(
            res,
            'Candidate rejected successfully',
            candidate.toJSON()
        );
    } catch (error) {
        console.error('rejectCandidate error:', error);
        
        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }
        if (error.message.includes('Unauthorized')) {
            return ApiResponse.unauthorized(res, error.message);
        }

        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Get all candidates for an election (with filter by status)
 * GET /api/candidates/election/:electionId
 * Query params: ?status=APPROVED (optional)
 */
async function getCandidatesByElection(req, res) {
    try {
        const { electionId } = req.params;
        const { status } = req.query;

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        let candidates;
        if (status === 'approved') {
            candidates = await candidateService.getApprovedCandidates(electionId);
        } else {
            candidates = await candidateService.getCandidatesByElection(electionId, status?.toUpperCase());
        }

        return ApiResponse.success(
            res,
            'Candidates fetched successfully',
            candidates.map(c => c.toJSON())
        );
    } catch (error) {
        console.error('getCandidatesByElection error:', error);
        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Get approved candidates for public view
 * GET /api/candidates/election/:electionId/approved
 */
async function getApprovedCandidates(req, res) {
    try {
        const { electionId } = req.params;

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        const candidates = await candidateService.getApprovedCandidates(electionId);

        return ApiResponse.success(
            res,
            'Approved candidates fetched successfully',
            candidates.map(c => c.toPublicJSON())
        );
    } catch (error) {
        console.error('getApprovedCandidates error:', error);
        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Get pending candidates for approval
 * GET /api/candidates/election/:electionId/pending
 */
async function getPendingCandidates(req, res) {
    try {
        const { electionId } = req.params;
        const userId = req.user.user_id;

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        // Verify user is election creator
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        const adminCheck = await prisma.admin.findFirst({
            where: {
                user_id: userId,
                election_id: electionId
            }
        });

        if (!adminCheck) {
            return ApiResponse.unauthorized(res, 'Only election creator can view pending candidates');
        }

        const candidates = await candidateService.getPendingCandidates(electionId);

        return ApiResponse.success(
            res,
            'Pending candidates fetched successfully',
            candidates.map(c => c.toJSON())
        );
    } catch (error) {
        console.error('getPendingCandidates error:', error);
        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Get single candidate by ID
 * GET /api/candidates/:candidateId
 */
async function getCandidateById(req, res) {
    try {
        const { candidateId } = req.params;

        if (!candidateId) {
            return ApiResponse.badRequest(res, 'Candidate ID is required');
        }

        const candidate = await candidateService.getCandidateById(candidateId);

        return ApiResponse.success(
            res,
            'Candidate fetched successfully',
            candidate.toJSON()
        );
    } catch (error) {
        console.error('getCandidateById error:', error);
        
        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }

        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Get candidate profile (public view)
 * GET /api/candidates/:candidateId/profile
 */
async function getCandidateProfile(req, res) {
    try {
        const { candidateId } = req.params;

        if (!candidateId) {
            return ApiResponse.badRequest(res, 'Candidate ID is required');
        }

        const candidate = await candidateService.getCandidateProfile(candidateId);

        return ApiResponse.success(
            res,
            'Candidate profile fetched successfully',
            candidate.toPublicJSON()
        );
    } catch (error) {
        console.error('getCandidateProfile error:', error);
        
        if (error.message.includes('not found') || error.message.includes('not available')) {
            return ApiResponse.notFound(res, error.message);
        }

        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Get all candidates registered by current user
 * GET /api/candidates/my-candidates
 */
async function getMyCandidate(req, res) {
    try {
        const userId = req.user.user_id;

        const candidates = await candidateService.getCandidatesByUser(userId);

        return ApiResponse.success(
            res,
            'Your candidates fetched successfully',
            candidates.map(c => c.toJSON())
        );
    } catch (error) {
        console.error('getMyCandidate error:', error);
        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Get candidate statistics for an election
 * GET /api/candidates/election/:electionId/stats
 */
async function getCandidateStats(req, res) {
    try {
        const { electionId } = req.params;

        if (!electionId) {
            return ApiResponse.badRequest(res, 'Election ID is required');
        }

        const stats = await candidateService.getCandidateStats(electionId);

        return ApiResponse.success(
            res,
            'Candidate statistics fetched successfully',
            stats
        );
    } catch (error) {
        console.error('getCandidateStats error:', error);
        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Update candidate information
 * PUT /api/candidates/:candidateId
 */
async function updateCandidate(req, res) {
    try {
        const { candidateId } = req.params;
        const userId = req.user.user_id;
        const { party_name, symbol, manifesto, age, qualification } = req.body;

        if (!candidateId) {
            return ApiResponse.badRequest(res, 'Candidate ID is required');
        }

        const candidate = await candidateService.updateCandidate(
            candidateId,
            {
                party_name,
                symbol,
                manifesto,
                age: age ? parseInt(age) : undefined,
                qualification
            },
            userId
        );

        return ApiResponse.success(
            res,
            'Candidate updated successfully',
            candidate.toJSON()
        );
    } catch (error) {
        console.error('updateCandidate error:', error);
        
        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }
        if (error.message.includes('Unauthorized')) {
            return ApiResponse.unauthorized(res, error.message);
        }
        if (error.message.includes('Invalid')) {
            return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.error(res, error.message, 500);
    }
}

/**
 * Delete candidate registration
 * DELETE /api/candidates/:candidateId
 */
async function deleteCandidate(req, res) {
    try {
        const { candidateId } = req.params;
        const userId = req.user.user_id;

        if (!candidateId) {
            return ApiResponse.badRequest(res, 'Candidate ID is required');
        }

        await candidateService.deleteCandidate(candidateId, userId);

        return ApiResponse.success(
            res,
            'Candidate deleted successfully',
            null
        );
    } catch (error) {
        console.error('deleteCandidate error:', error);
        
        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }
        if (error.message.includes('Unauthorized')) {
            return ApiResponse.unauthorized(res, error.message);
        }
        if (error.message.includes('can only delete')) {
            return ApiResponse.error(res, error.message, 400);
        }

        return ApiResponse.error(res, error.message, 500);
    }
}

module.exports = {
    registerCandidate,
    approveCandidate,
    rejectCandidate,
    getCandidatesByElection,
    getApprovedCandidates,
    getPendingCandidates,
    getCandidateById,
    getCandidateProfile,
    getMyCandidate,
    getCandidateStats,
    updateCandidate,
    deleteCandidate
};
