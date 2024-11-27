import prisma from '../../../../utils/prisma';
import {verifyUser} from "../../../../utils/verify_user";
import type {NextApiRequest, NextApiResponse} from 'next';

/**
 * Blog Delete API: Delete a blog post
 * Allowed method: DELETE
 * Url: /api/blog/delete/[id]
 * Access: User
 * Payload: None
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
            where: { id: parseInt(id as string) },
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

        // Delete all related records in a transaction
        await prisma.$transaction(async (tx) => {
            // Delete ratings related to comments on this post
            await tx.rating.deleteMany({
                where: {
                    comment: {
                        blogPostId: parseInt(id as string)
                    }
                }
            });

            // Delete reports related to comments on this post
            await tx.report.deleteMany({
                where: {
                    comment: {
                        blogPostId: parseInt(id as string)
                    }
                }
            });

            // Delete all comments
            await tx.comment.deleteMany({
                where: {
                    blogPostId: parseInt(id as string)
                }
            });

            // Delete blog ratings
            await tx.rating.deleteMany({
                where: {
                    blogPostId: parseInt(id as string)
                }
            });

            // Delete blog reports
            await tx.report.deleteMany({
                where: {
                    blogPostId: parseInt(id as string)
                }
            });

            // Remove template associations
            await tx.blogPost.update({
            where: { id: parseInt(id as string) },
                data: {
                    codeTemplates: {
                        set: [] // Remove all template associations
                    }
                }
            });

            // Finally delete the blog post
            await tx.blogPost.delete({
                where: { id: parseInt(id as string) }
            });
        });

        res.status(200).json({ message: 'Blog post has successfully deleted' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}