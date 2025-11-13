const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    listCompletedResults,
    getResultByElectionId,
    generateResult
} = require('../controllers/resultController');

// List all completed election results
router.get('/', listCompletedResults);

// Get result for a specific election
router.get('/:electionId', getResultByElectionId);

// Regenerate result for a specific election (protected)
router.post('/:electionId/generate', authMiddleware, generateResult);

module.exports = router;

