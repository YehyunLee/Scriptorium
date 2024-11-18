import type { NextApiRequest, NextApiResponse } from 'next';
import { generateAuthTokens, verifyRefreshToken } from '../../../utils/auth/jwt';


/**
 * Refresh Token API: Generate a new token
 * Allowed method: POST
 * Url: /api/auth/refresh_token
 * Access: User
 * Payload: none
 */
export default async function refreshToken(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
        return;
    }

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const tokens = generateAuthTokens(payload.userId);

    res.setHeader('Set-Cookie', `refreshToken=${tokens.refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);

    res.status(200).json({ message: 'Token refreshed', accessToken: tokens.accessToken });
}