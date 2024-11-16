import bcrypt from 'bcryptjs';
import prisma from '../../../utils/prisma';
import { generateToken } from '../../../utils/auth/jwt';


/**
 * Login API: Authenticate a user
 * Allowed method: POST
 * Url: /api/auth/login
 * Access: Public
 * Payload: { email, password }
 */
export default async function login(req, res) {
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

    const token = generateToken(user.id);
    res.status(200).json({ message: 'Login successful', token });
}