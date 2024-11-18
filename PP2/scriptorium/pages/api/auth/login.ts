import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import prisma from '../../../utils/prisma';
import { generateAuthTokens } from '../../../utils/auth/jwt';


/**
 * Login API: Authenticate a user
 * Allowed method: POST
 * Url: /api/auth/login
 * Access: Public
 * Payload: { email, password }
 */
export default async function login(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} not allowed` });
        return;
    }

    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set token in HTTP-only cookie (7 days = 24 * 60 * 60 * 7) (path=/ means the cookie is valid for all routes) (SameSite=Strict means the cookie is not sent with cross-site requests)
    res.setHeader('Set-Cookie', `refreshToken=${generateAuthTokens(user.id).refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);


    const token = generateAuthTokens(user.id);
    res.status(200).json({ message: 'Login successful', accessToken: token.accessToken });
}