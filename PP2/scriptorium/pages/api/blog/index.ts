import prisma from '../../../utils/prisma';
import {verifyUser} from "../../../utils/verify_user";
import type {NextApiRequest, NextApiResponse} from 'next';

/**
 * Blog API: Retrieve blog posts and create new blog posts
 * Allowed method: GET, POST
 * Url: /api/blog
 * Access: Public (some hidden posts are shown to authors)
 * Payload: {search?, template_id?, sort_by_rating?, page?, limit?} for GET
 *         {title, content, tags, codeTemplateIds?} for POST
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const {search, template_id, sort_by_rating} = req.query;
        const {page = 1, limit = 10} = req.query;

        const pageNumber = parseInt(page as string);
        const pageSize = parseInt(limit as string);

        const offset = (pageNumber - 1) * pageSize; // minus 1 because page starts from 1

        // If sort_by_rating is true, then sort the blog posts by rating (blog_by_rating key in result)
        // If template_id is provided, then fetch blog posts for that template (blog_by_template key in result)
        // If search is provided, then search for blog posts based on the search query (blogs key in result)
        // If none of the above conditions are met, then fetch all blog posts (blogs key in result)

        const result: {
            blog_by_rating?: any[],
            rating_total?: number,
            blog_by_template?: any[],
            template_total?: number,
            blogs?: any[],
            total?: number,
            page?: number,
            limit?: number
        } = {};

        if (sort_by_rating) {
            try {
                const blogPosts = await prisma.blogPost.findMany({
                    include: {
                        ratings: true,
                        comments: {
                            include: {
                                ratings: true,
                            },
                        },
                    },
                    // I used Github Copilot to learn about skip and take
                    // Copilot generated the following code:
                    // """
                    skip: offset, // skip the first 'offset' number of items
                    take: pageSize, // take the next 'pageSize' number of items
                    // """
                });

                // Sorting blog using .sort and .reduce
                const sorted_blog_posts = blogPosts.sort((a, b) => {
                    const a_avg_rating =
                        a.ratings.reduce((acc, rating) => acc + rating.rating, 0) /
                        a.ratings.length || 0; // if ratings.length is 0, then set average rating to 0
                    const b_avg_rating =
                        b.ratings.reduce((acc, rating) => acc + rating.rating, 0) /
                        b.ratings.length || 0;
                    return b_avg_rating - a_avg_rating; // sort in descending order
                });

                // Sorting comments based on average rating
                sorted_blog_posts.forEach((post) => {
                    post.comments.sort((a, b) => {
                        const a_avg_rating =
                            a.ratings.reduce((acc, rating) => acc + rating.rating, 0) /
                            a.ratings.length || 0;
                        const b_avg_rating =
                            b.ratings.reduce((acc, rating) => acc + rating.rating, 0) /
                            b.ratings.length || 0;
                        return b_avg_rating - a_avg_rating;
                    });
                });

                const totalBlogPosts = await prisma.blogPost.count();

                result.blog_by_rating = sorted_blog_posts;
                result.rating_total = totalBlogPosts;

                // Sorted in descending order of average rating
                // Meaning the blog post with the highest average rating comes first
            } catch (error) {
                res.status(500).json({error: "Failed to fetch blog posts"});
                return ;
            }
        } else if (template_id) {
            try {
                const template = await prisma.codeTemplate.findUnique({
                    where: {
                        id: parseInt(template_id as string),
                    },

                    include: {
                        blogPosts: {
                            skip: offset,
                            take: pageSize,
                        },
                    },
                });

                if (!template) {
                    res.status(400).json({error: "Template not found"});
                }

                const totalBlogPosts = await prisma.blogPost.count({
                    where: {
                        codeTemplates: {
                            some: {
                                id: parseInt(template_id as string),
                            },
                        },
                    },
                });

                result.blog_by_template = template?.blogPosts;
                result.template_total = totalBlogPosts;

            } catch (error) {
                res.status(500).json({error: "Failed to fetch blog posts"});
                return ;
            }
        } else {

            const user = verifyUser(req);

            try {
                // Build the search conditions
                const searchConditions = {
                    OR: [
                        {hidden: false}, // Ensure that only non-hidden posts are shown publicly
                        {authorId: user?.userId} // Allow authors to see their hidden posts
                    ],
                    AND: search ? {
                        OR: [
                            {title: {contains: search as string}},
                            {content: {contains: search as string}},
                            {tags: {contains: search as string}},
                            {
                                codeTemplates: {
                                    some: {
                                        title: {contains: search as string}
                                    }
                                }
                            }
                        ]
                    } : {}
                };

                // Retrieve blog posts with the search conditions
                const blogPosts = await prisma.blogPost.findMany({
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
                    },
                    orderBy: {
                        createdAt: 'desc', // Order by creation date (most recent first)
                    },
                    skip: offset,
                    take: pageSize,
                });

                const totalBlogPosts = await prisma.blogPost.count({
                    where: searchConditions,
                });

                result.blogs = blogPosts;
                result.total = totalBlogPosts;

            } catch (error: any) {
                res.status(500).json({error: 'Internal Server Error', details: error.message});
            }

        }

        result.page = pageNumber;
        result.limit = pageSize;

        res.status(200).json(result);

    } else if (req.method === 'POST') {
        try {
            const user = verifyUser(req);
            const {title, content, tags, codeTemplateIds} = req.body;
            if (!title || !content || !tags || tags.length === 0) {
                return res.status(400).json({message: 'Missing required fields'});
            }

            if (!user?.userId) {
                return res.status(401).json({message: 'Unauthorized'});
            }

            const blogPost = await prisma.blogPost.create({
                data: {
                    title,
                    content,
                    tags,
                    authorId: user.userId,
                    codeTemplates: {
                        connect: Array.isArray(codeTemplateIds) ? codeTemplateIds.map((id) => ({id})) : [], //will link blog posts to corresponding code templates
                    },
                },
            });

            res.status(201).json(blogPost);
        } catch (error: any) {
            res.status(401).json({error: 'Error: Unauthorized', details: error.message});
        }
    } else {
        return res.status(405).json({message: 'Method is not allowed'});
    }
}
