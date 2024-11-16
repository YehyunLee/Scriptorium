import {upsertRating} from "../../../../utils/rating";
import {verifyUser} from "../../../../utils/verify_user";
import prisma from '../../../../utils/prisma';


/**
 * Comment Rating API: Rate a comment
 * Allowed method: POST
 * Url: /api/comments/[id]/add_rate
 * Access: User
 * Payload: {ratingValue}
 */
export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method is not allowed' });
    }

    try {
        const user = verifyUser(req);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { ratingValue } = req.body;

        if (ratingValue === undefined || ratingValue < -1 || ratingValue > 1) {
            return res.status(400).json({ message: 'Rating must be either -1, 0, or 1' });
        }

        // Check if the comment exists
        const comment = await prisma.comment.findUnique({
            where: {
                id: parseInt(id),
            },
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Use the helper function for rating logic
        const rating = await upsertRating(user.userId, ratingValue, 'comment', id);

        res.status(201).json(rating);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
