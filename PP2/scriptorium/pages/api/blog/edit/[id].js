import prisma from '../../../../utils/prisma';
import {verifyUser} from "../../../../utils/verify_user";


/**
 * Blog Edit API: Edit a blog post
 * Allowed method: PUT
 * Url: /api/blog/edit/[id]
 * Access: User
 * Payload: {title, content, tags, codeTemplateIds?}
 */
export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'PUT') {
        return res.status(405).json({ message: 'Method is not allowed' });
    }

    try {
        const user = verifyUser(req);

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { title, content, tags, codeTemplateIds } = req.body;
        if (!title || !content || !tags) {
            return res.status(400).json({ message: 'Missing required fields' });
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
            return res.status(403).json({ message: 'You cannot edit a hidden post' });
        }

        const updatedPost = await prisma.blogPost.update({
            where: { id: parseInt(id) },
            data: {
                title,
                content,
                tags,
                codeTemplates: {
                    connect: Array.isArray(codeTemplateIds) ? codeTemplateIds.map((id) => ({ id })) : [], //will link blog posts to corresponding code templates
                },
            },
        });

        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized', details: error.message });
    }
}