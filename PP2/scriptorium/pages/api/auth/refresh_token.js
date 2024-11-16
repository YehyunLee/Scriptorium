import { generateToken } from '../../../utils/auth/jwt';
import {verifyUser} from "../../../utils/verify_user";


/**
 * Refresh Token API: Generate a new token
 * Allowed method: POST
 * Url: /api/auth/refresh_token
 * Access: User
 * Payload: none
 */
export default async function refreshToken(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
        return;
    }

    const user = verifyUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = generateToken(user.userId);

    res.status(200).json({ message: 'Token refreshed', token });
}