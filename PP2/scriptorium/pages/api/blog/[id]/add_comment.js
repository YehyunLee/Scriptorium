import prisma from '../../../../utils/prisma';
import {verifyUser} from "../../../../utils/verify_user";


/**
 * Blog Comment API: Create a new comment or reply
 * Allowed method: POST
 * Url: /api/blog/[id]/comment
 * Access: User
 * Payload: {content, parentCommentId}
 */
export default async function handler(req, res) {
    const { id } = req.query;  // blogPostId

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method is not allowed' });
    }

    try {
        const user = verifyUser(req);  // Authenticate the user

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { content, parentCommentId } = req.body;

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Check if the blog post exists
        const blogPost = await prisma.blogPost.findUnique({
            where: { id: parseInt(id) },
            select: { id: true }
        });

        if (!blogPost) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        // Check if the parent comment exists
        if (parentCommentId) {
            const parentComment = await prisma.comment.findUnique({
                where: {
                    id: parseInt(parentCommentId),
                    blogPostId: parseInt(id)
                },
                select: { id: true }
            });

            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
        }

        // Create a new comment or reply
        const comment = await prisma.comment.create({
            data: {
                content,
                authorId: user.userId,
                blogPostId: parseInt(id),  // Associate with the blog post
                parentCommentId: parentCommentId ? parseInt(parentCommentId) : null // Optional for replies
            }
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
