import prisma from '../../../utils/prisma';
import { verifyUser } from '../../../utils/verify_user';
import bcrypt from "bcryptjs";
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Profile API: Get or update the user's profile
 * Allowed method: GET, PUT
 * Url: /api/auth/profile
 * Access: User
 * Payload: None for GET, {firstName, lastName, email, avatar, phone, password} for PUT
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const user = verifyUser(req);

    if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

  try {
    if (req.method === 'GET') {
        const profile = await prisma.user.findUnique({
            where: { id: user.userId },
            select: { id: true, email: true, firstName: true, lastName: true, phoneNumber: true, avatarUrl: true, permission: true },
        });
        return res.status(200).json(profile);
    }

    if (req.method === 'PUT') {
        const { firstName, lastName, email, avatar, phone, password } = req.body;

        const updateData: any = {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone && { phoneNumber: phone }),
        ...(avatar && { avatarUrl: avatar }),
      };

      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

        const updatedUser = await prisma.user.update({
            where: { id: user.userId },
        data: updateData,
        select: {
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          avatarUrl: true,
          permission: true,
            },
        });

        return res.status(200).json(updatedUser);
    }

    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
} catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
}
}
