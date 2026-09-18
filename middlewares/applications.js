import { getUserDataFromToken } from "../utils.js";
import pool from "../db.js";
import config from "../config.js";

export async function canApplyToBrief(req, res, next) {
    const userData = getUserDataFromToken(req);

    if (!userData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if(userData.role.name !== config.creativeRoleName) {
        return res.status(403).json({ error: `Forbidden: Only users with the ${config.creativeRoleName} role can apply to briefs` });
    }

    next();
}


export async function checkUniqueApplication(req, res, next) {
    const userData = getUserDataFromToken(req);
    const briefId = req.params.briefId;

    if (!userData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const [rows] = await pool.query('SELECT * FROM applications WHERE user_id = ? AND brief_id = ?', [userData.id, briefId]);
    if (rows.length > 0) {
        return res.status(409).json({ error: 'User has already applied to this brief' });
    }

    next();
}


export async function checkExistingApplicationId(req, res, next) {
    const applicationId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ?', [applicationId]);
    if (rows.length === 0) {
        return res.status(404).json({ error: 'Application not found' });
    }
    next();
}


export async function isOwner(req, res, next) {
    const userData = getUserDataFromToken(req);
    const applicationId = req.params.id;

    if (!userData) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const [rows] = await pool.query('SELECT * FROM applications WHERE id = ? AND user_id = ?', [applicationId, userData.id]);

    if (rows.length === 0) {
        return res.status(403).json({ error: 'You can only modify your own applications' });
    }

    next();
}