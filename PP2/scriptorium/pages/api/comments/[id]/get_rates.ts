import prisma from '../../../../utils/prisma';
import {verifyUser} from "../../../../utils/verify_user";
import type {NextApiRequest, NextApiResponse} from 'next';

/**
 * Comment API: Retrieve average and total number of rates for a comment
 * Allowed method: GET
 * Url: /api/comments/[id]/get_rates
 * Access: Public (some hidden posts are shown to authors)
 * Payload: None
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({message: 'Method is not allowed'});
        return;
    }

    const {id} = req.query;

    const user = verifyUser(req);

    try {
        // Build the search conditions
        const searchConditions = {
            id: parseInt(id as string),
            OR: [
                {
                    hidden: false,
                },
                {
                    authorId: user?.userId,
                },
            ],
        };

        // Retrieve comment with the search conditions
        const comment = await prisma.comment.findFirst({
            where: searchConditions,
            include: {
                ratings: true
            }
        });

        if (!comment) {
            res.status(404).json({message: 'Comment not found'});
            return;
        }

        const totalRates = comment.ratings.length;
        let averageRate = 0
        for (let i = 0; i < totalRates; i++) {
            averageRate += comment.ratings[i].rating;
        }
        averageRate = averageRate / totalRates;

        let usersWhoRatedIds = []
        for (const rating of comment.ratings) {
            usersWhoRatedIds.push({[rating.userId]: rating.rating})
        }

        res.status(200).json({totalRates, averageRate, usersWhoRatedIds});
    } catch (error: any) {
        res.status(500).json({error: 'Internal Server Error', details: error.message});
    }
}