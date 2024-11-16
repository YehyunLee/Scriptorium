import { verifyToken } from './auth/jwt.js';

export function verifyUser(req) {
    // [Authenticated route]
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return null;
    }

    return decoded;
}