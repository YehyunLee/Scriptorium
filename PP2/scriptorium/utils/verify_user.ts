import { NextApiRequest } from 'next';
import { verifyAccessToken } from './auth/jwt.js';
import { TokenPayload } from '@/types/auth.js';

export function verifyUser(req: NextApiRequest): TokenPayload | null {
    // [Authenticated route]
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }

    const accessToken = authHeader.split(' ')[1];
    const payload = verifyAccessToken(accessToken);

    if (!payload || payload.type !== 'access') {
        return null;
    }
    
    return payload;
}