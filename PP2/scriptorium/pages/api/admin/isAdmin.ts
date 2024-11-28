import {NextApiRequest, NextApiResponse} from 'next';
import {verifyUser} from "../../../utils/verify_user";
import prisma from "../../../utils/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const user = verifyUser(req);

    // console.log(user);

    if (!user) {
        return res.status(401).json({error: 'Unauthorized'});
    }

    try {
        if (req.method === 'GET') {
            const user_admin = await prisma.user.findUnique({
                where: {id: user.userId},
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phoneNumber: true,
                    avatarUrl: true,
                    permission: true
                },
            });

            // console.log(user_admin);

            if (user_admin.permission === 'ADMIN') { // Assuming `role` is a property on the decoded token
                return res.status(200).json({isAdmin: true});
            }

            return res.status(200).json({isAdmin: false});
        }

    } catch (error) {
        res.status(500).json({error: 'Failed to update profile'});
    }
}