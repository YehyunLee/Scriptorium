import prisma from '../../../../utils/prisma';
import {verifyUser} from "../../../../utils/verify_user";
import type {NextApiRequest, NextApiResponse} from 'next';

// Add interfaces at the top of the file
interface CommentRating {
  rating: number;
}

interface CommentAuthor {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

interface Comment {
  id: number;
  content: string;
  author: CommentAuthor;
  ratings: CommentRating[];
  parentCommentId: number | null;
  totalRates?: number;
  averageRate?: number;
}

/**
 * Blog API: Retrieve list of all comments for a blog post
 * Allowed method: GET
 * Url: /api/blog/[id]/get_comments
 * Access: Public (some hidden posts are shown to authors)
 * Payload: {page?, limit?}
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.status(405).json({message: 'Method is not allowed'});
        return;
    }

    const {id} = req.query;
    const {page = 1, limit = 10} = req.query;

    const pageNumber = parseInt(page as string);
    const pageSize = parseInt(limit as string);

    const offset = (pageNumber - 1) * pageSize; // minus 1 because page starts from 1

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
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                comments: {
                    select: {
                        id: true,
                        content: true,
                        author: {
                            select: {
                                firstName: true,
                                lastName: true,
                                email: true,
                                avatarUrl: true
                            }
                        },
                        ratings: true,
                        parentCommentId: true,
                        }
                    }
                }
            });

        if (!blogPost) {
            res.status(404).json({message: 'Blog post not found'});
            return;
        }

        const comments = blogPost.comments;
        const totalComments = comments.length;
        const totalPages = Math.ceil(totalComments / pageSize);
        const paginatedComments = comments.slice(offset, offset + pageSize);

        // paginatedComments.forEach(comment => {
        //     const totalRates = comment.ratings.length;
        //     const averageRate = comment.ratings.reduce((acc, rating) => acc + rating.rate, 0) / totalRates;
        //     comment.totalRates = totalRates;
        //     comment.averageRate = averageRate;
        //     delete comment.ratings;
        // });


        // Update the problematic section
        paginatedComments.forEach((comment: Comment) => {
        const totalRates = comment.ratings.length;
        const averageRate = totalRates > 0 
            ? comment.ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalRates 
            : 0;
            
        (comment as any).totalRates = totalRates;
        (comment as any).averageRate = averageRate;
        delete (comment as any).ratings;
        });


        res.status(200).json({
            comments: paginatedComments,
            page: pageNumber,
            totalPages,
            totalComments
        });
    } catch (error: any) {
        res.status(500).json({error: 'Internal Server Error', details: error.message});
    }
}