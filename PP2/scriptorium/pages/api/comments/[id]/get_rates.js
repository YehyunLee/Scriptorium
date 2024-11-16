import prisma from '../../../../utils/prisma';
import {verifyUser} from "../../../../utils/verify_user";

/**
 * Comment API: Retrieve average and total number of rates for a comment
 * Allowed method: GET
 * Url: /api/blog/[id]/get_rates
 * Access: Public (some hidden posts are shown to authors)
 * Payload: None
 */
export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.status(405).json({message: 'Method is not allowed'});
        return;
    }

    const {id} = req.query;

    const user = verifyUser(req);

    try {
        // Build the search conditions
        const searchConditions = {
            id: parseInt(id),
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

        res.status(200).json({totalRates, averageRate});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error', details: error.message});
    }
}