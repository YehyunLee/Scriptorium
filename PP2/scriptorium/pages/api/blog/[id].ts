import prisma from '../../../utils/prisma';
import {verifyUser} from "../../../utils/verify_user";
import type {NextApiRequest, NextApiResponse} from 'next';

/**
 * Blog API: Retrieve blog post with the given ID
 * Allowed method: GET
 * Url: /api/blog/[id]
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

        // Retrieve blog post with the search conditions
        const blogPost = await prisma.blogPost.findFirst({
            where: searchConditions,
            include: {
                author: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatarUrl: true
                    }
                },
                codeTemplates: true
            }
        });

        if (!blogPost) {
            res.status(404).json({message: 'Blog post not found'});
            return;
        }

        res.status(200).json(blogPost);
    } catch (error: any) {
        res.status(500).json({error: 'Internal Server Error', details: error.message});
    }
}
