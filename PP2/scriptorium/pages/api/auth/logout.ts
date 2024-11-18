import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Logout API: Clear the user's session
 * Allowed method: POST
 * Url: /api/auth/logout
 * Access: User
 * Payload: None
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
        return;
    }

    // Clear the refresh token cookie
    res.setHeader('Set-Cookie', `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`);
    res.status(200).json({ message: 'Logout successful' });
}