const resultService = require('../services/resultService');
const ApiResponse = require('../utils/ApiResponse');

exports.listCompletedResults = async (req, res) => {
    try {
        const results = await resultService.listCompletedResults();
        return ApiResponse.success(res, 'Completed election results retrieved successfully', results);
    } catch (error) {
        console.error('Error listing completed election results:', error);
        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

exports.getResultByElectionId = async (req, res) => {
    try {
        const { electionId } = req.params;
        const result = await resultService.getResultByElectionId(electionId);
        return ApiResponse.success(res, 'Election result retrieved successfully', result);
    } catch (error) {
        console.error('Error fetching election result:', error);

        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }

        if (error.message.includes('not completed')) {
            return ApiResponse.badRequest(res, error.message);
        }

        if (error.message.includes('required')) {
            return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

exports.generateResult = async (req, res) => {
    try {
        const { electionId } = req.params;
        const result = await resultService.generateResult(electionId);
        return ApiResponse.success(res, 'Election result regenerated successfully', result);
    } catch (error) {
        console.error('Error generating election result:', error);

        if (error.message.includes('not found')) {
            return ApiResponse.notFound(res, error.message);
        }

        if (error.message.includes('not completed')) {
            return ApiResponse.badRequest(res, error.message);
        }

        if (error.message.includes('required')) {
            return ApiResponse.badRequest(res, error.message);
        }

        return ApiResponse.error(res, error.message || 'Internal server error');
    }
};

module.exports = exports;

