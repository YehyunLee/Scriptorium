import { NextApiRequest } from 'next';
import { verifyAccessToken } from './auth/jwt';
import { TokenPayload } from '@/types/auth';

export function verifyUser(req: NextApiRequest): TokenPayload | null {
    try {
        // Try cookie first
        const tokenFromCookie = req.cookies.accessToken;
        
        // Fallback to header
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader?.startsWith('Bearer ') 
            ? authHeader.split(' ')[1] 
            : null;

        const accessToken = tokenFromCookie || tokenFromHeader;

        if (!accessToken) {
            return null;
        }

        const decoded = verifyAccessToken(accessToken);
        if (!decoded || decoded.type !== 'access') {
            return null;
        }

        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}