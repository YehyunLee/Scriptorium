import prisma from '../../../utils/prisma';
import { verifyUser } from '../../../utils/verify_user.js';
import bcrypt from "bcryptjs";


/**
 * Profile API: Get or update the user's profile
 * Allowed method: GET, PUT
 * Url: /api/auth/profile
 * Access: User
 * Payload: None for GET, {firstName, lastName, email, avatar, phone, password} for PUT
 */
export default async function handler(req, res) {
    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        const profile = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { email: true, firstName: true, lastName: true, phoneNumber: true, avatarUrl: true, permission: true },
        });
        return res.status(200).json(profile);
    }

    if (req.method === 'PUT') {
        const { firstName, lastName, email, avatar, phone, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
            data: {
                email: email,
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phone,
                avatarUrl: avatar,
                passwordHash: hashedPassword,
            },
        });

        return res.status(200).json(updatedUser);
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
}
