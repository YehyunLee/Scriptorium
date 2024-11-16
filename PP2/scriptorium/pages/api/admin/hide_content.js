import prisma from '../../../utils/prisma';
import { verifyUser } from '../../../utils/verify_user';

/**
 * Hide content API: Hide blog posts or comments
 * Allowed method: POST
 * Url: /api/admin/hide
 * Access: Admin
 * Payload: { contentType, contentId }
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const user_id = verifyUser(req);

        // get user from token
        const user = await prisma.user.findUnique({
            where: {
                id: user_id.userId,
            },
            select: {
                permission: true,
            }
        });

        // Only admins can hide content
        if (!user || user.permission !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden: Only admins can hide content' });
        }

        const { contentType, contentId } = req.body;

        if (!contentType || !contentId) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Handle hiding blog posts or comments
        let hiddenContent;
        if (contentType === 'blogPost') {
            // Check if the blog post exists
            const blogPost = await prisma.blogPost.findUnique({
                where: { id: parseInt(contentId) },
                select: { id: true },
            });

            if (!blogPost) {
                return res.status(404).json({ message: 'Blog post not found' });
            }

            hiddenContent = await prisma.blogPost.update({
                where: { id: parseInt(contentId) },
                data: { hidden: true },
            });
        } else if (contentType === 'comment') {
            // Check if the comment exists
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(contentId) },
                select: { id: true },
            });

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            hiddenContent = await prisma.comment.update({
                where: { id: parseInt(contentId) },
                data: { hidden: true },
            });
        } else {
            return res.status(400).json({ message: 'Invalid content type' });
        }

        res.status(200).json({ message: 'Content hidden successfully', hiddenContent });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
