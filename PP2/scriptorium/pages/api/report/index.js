import prisma from '../../../utils/prisma';
import { verifyUser } from '../../../utils/verify_user';


/**
 * Report API: Create a report
 * Allowed method: POST
 * Url: /api/report
 * Access: User
 * Payload: { reason: string, blogPostId?: string, commentId?: string }
 */
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method is not allowed' });
    }

    try {
        const user = verifyUser(req);

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const reason = req.body.reason;
        const blogPostId = parseInt(req.body.blogPostId);
        const commentId = parseInt(req.body.commentId);


        // Check if at least one of blogPostId or commentId is provided
        if (!reason || (!blogPostId && !commentId)) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if the blog post exists
        if (blogPostId) {
            const blogPost = await prisma.blogPost.findUnique({
                where: {
                    id: blogPostId,
                },
            });

            if (!blogPost) {
                return res.status(404).json({ message: 'Blog post not found' });
            }
        }

        // Check if the comment exists
        if (commentId) {
            const comment = await prisma.comment.findUnique({
                where: {
                    id: commentId,
                },
            });

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }
        }

        // Create the report
        const report = await prisma.report.create({
            data: {
                reason,
                reporter: { connect: { id: user.userId } },
                ...(blogPostId && {
                    blogPost: { connect: { id: blogPostId } },
                }),
                ...(commentId && {
                    comment: { connect: { id: commentId } },
                }),
            },
        });

        res.status(201).json(report);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
