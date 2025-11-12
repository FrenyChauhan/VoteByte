const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * RBAC middleware to check if user has specific role
 * @param {Array<string>} allowedRoles - Array of allowed roles
 * @returns {Function} - Middleware function
 */
function rbacMiddleware(allowedRoles = []) {
    return async (req, res, next) => {
        try {
            // Ensure user is authenticated
            if (!req.user) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Unauthorized: User not authenticated' 
                });
            }

            // If no specific roles required, allow all authenticated users
            if (allowedRoles.length === 0) {
                return next();
            }

            // Check if user role is in allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Forbidden: Only ${allowedRoles.join(', ')} can access this resource` 
                });
            }

            next();
        } catch (error) {
            console.error('RBAC middleware error:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Internal server error' 
            });
        }
    };
}

/**
 * Middleware to check if user is election creator (admin)
 * Requires election_id in params or body
 */
async function isElectionCreator(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized: User not authenticated' 
            });
        }

        const electionId = req.params.electionId || req.body.election_id;

        if (!electionId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Election ID is required' 
            });
        }

        // Check if user is admin for this election
        const admin = await prisma.admin.findFirst({
            where: {
                user_id: req.user.user_id,
                election_id: electionId
            }
        });

        if (!admin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: Only election creator can perform this action' 
            });
        }

        req.election = { id: electionId };
        next();
    } catch (error) {
        console.error('isElectionCreator middleware error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
}

/**
 * Middleware to check if user is superadmin
 */
async function isSuperAdmin(req, res, next) {
    try {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Unauthorized: User not authenticated' 
            });
        }

        const superadmin = await prisma.superAdmin.findUnique({
            where: { user_id: req.user.user_id }
        });

        if (!superadmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: Only superadmin can access this resource' 
            });
        }

        next();
    } catch (error) {
        console.error('isSuperAdmin middleware error:', error);
        return res.status(500).json({ 
            success: false, 
                message: 'Internal server error' 
            });
    }
}

module.exports = {
    rbacMiddleware,
    isElectionCreator,
    isSuperAdmin
};
