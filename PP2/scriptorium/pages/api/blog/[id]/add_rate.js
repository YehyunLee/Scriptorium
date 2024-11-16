import { upsertRating } from "../../../../utils/rating";
import {verifyUser} from "../../../../utils/verify_user";
import prisma from '../../../../utils/prisma';

/**
 * Blog Rating API: Rate a blog post
 * Allowed method: POST
 * Url: /api/blog/[id]/rate
 * Access: User
 * Payload: {ratingValue}
 */
export default async function handler(req, res) {
    const { id } = req.query;  // blogPostId

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method is not allowed' });
    }

    try {
        const user = verifyUser(req);
        const { ratingValue } = req.body;

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (ratingValue === undefined || ratingValue < -1 || ratingValue > 1) {
            return res.status(400).json({ message: 'Rating must be either -1, 0, or 1' });
        }

        // Check if the blog post exists
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            select: { id: true }
        });

        if (!blogPost) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Use the helper function for rating logic
        const rating = await upsertRating(user.userId, ratingValue, 'blogPost', id);

        res.status(201).json(rating);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
