import prisma from '../../../../utils/prisma';
import {verifyUser} from "../../../../utils/verify_user";

/**
 * Blog API: Retrieve average and total number of rates for a blog post
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

        // Retrieve blog post with the search conditions
        const blogPost = await prisma.blogPost.findFirst({
            where: searchConditions,
            include: {
                ratings: true
            }
        });

        if (!blogPost) {
            res.status(404).json({message: 'Blog post not found'});
            return;
        }


        const totalRates = blogPost.ratings.length;
        let averageRate = 0
        for (let i = 0; i < totalRates; i++) {
            averageRate += blogPost.ratings[i].rating;
        }
        averageRate = averageRate / totalRates;

        let usersWhoRatedIds = []
        for (const rating of blogPost.ratings) {
            usersWhoRatedIds.push({[rating.userId]: rating.rating})
        }

        res.status(200).json({totalRates, averageRate, usersWhoRatedIds});
    } catch (error) {
        res.status(500).json({error: 'Internal Server Error', details: error.message});
    }
}