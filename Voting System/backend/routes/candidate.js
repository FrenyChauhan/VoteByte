const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { rbacMiddleware, isElectionCreator } = require('../middlewares/rbacMiddleware');
const candidateController = require('../controllers/candidateController');

/**
 * Public Routes (No auth required)
 */

// Get approved candidates for an election
router.get('/election/:electionId/approved', candidateController.getApprovedCandidates);

// Get candidate profile (public view)
router.get('/:candidateId/profile', candidateController.getCandidateProfile);

// Get candidate statistics
router.get('/election/:electionId/stats', candidateController.getCandidateStats);

/**
 * Authenticated User Routes
 */

// Register as a candidate for an election
router.post('/register', authMiddleware, candidateController.registerCandidate);

// Get my candidates
router.get('/my-candidates', authMiddleware, candidateController.getMyCandidate);

// Update my candidate registration
router.put('/:candidateId', authMiddleware, candidateController.updateCandidate);

// Delete my candidate registration
router.delete('/:candidateId', authMiddleware, candidateController.deleteCandidate);

/**
 * Election Creator (Admin) Routes
 * These routes require user to be the election creator
 */

// Get all candidates for an election (including pending)
router.get('/election/:electionId', authMiddleware, candidateController.getCandidatesByElection);

// Get pending candidates for approval
router.get('/election/:electionId/pending', authMiddleware, isElectionCreator, candidateController.getPendingCandidates);

// Approve a candidate
router.put('/:candidateId/approve', authMiddleware, candidateController.approveCandidate);

// Reject a candidate
router.put('/:candidateId/reject', authMiddleware, candidateController.rejectCandidate);

// Get single candidate details
router.get('/:candidateId', authMiddleware, candidateController.getCandidateById);

module.exports = router;
