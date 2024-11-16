import prisma from '../../../../utils/prisma';
import {verifyUser} from "../../../../utils/verify_user";


/**
 * Blog Delete API: Delete a blog post
 * Allowed method: DELETE
 * Url: /api/blog/delete/[id]
 * Access: User
 * Payload: None
 */
export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Method is not allowed' });
    }

    try {
        const user = verifyUser(req);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const existingPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (existingPost.authorId !== user.userId) {
            return res.status(403).json({ message: 'Forbidden Access' });
        }

        if (existingPost.hidden) {
            return res.status(403).json({ message: 'You cannot delete a hidden post' });
        }

        await prisma.blogPost.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: 'Blog post has successfully deleted' });
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
}