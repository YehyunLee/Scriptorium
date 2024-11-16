import prisma from "../../../utils/prisma";
import { verifyUser } from "../../../utils/verify_user";

/**
 * Get Sorted Reports API: Fetch reported blog posts and comments
 * Allowed method: GET
 * Url: /api/admin/get_sorted_reports
 * Access: Admin
 * Payload: None
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} not allowed`);
    return;
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


    // Only admins access!
    if (!user || user.permission !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: Only admins can access this endpoint" });
    }

    const { page = 1, limit = 10 } = req.query;

    // page segmentation
    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const offset = (pageNumber - 1) * pageSize;

    // fetching blog posts with report counts
    const blogPosts = await prisma.blogPost.findMany({
      include: {
        reports: true,
      },
      skip: offset,
      take: pageSize,
    });
    // sort blog posts by the # of reports
    const sortedBlogPosts = blogPosts.sort(
      (a, b) => b.reports.length - a.reports.length
    );

    // fetching comments
    const comments = await prisma.comment.findMany({
      include: {
        reports: true,
      },
      skip: offset,
      take: pageSize,
    });

    // sort comments
    const sortedComments = comments.sort(
      (a, b) => b.reports.length - a.reports.length
    );

    res.status(200).json({
      blogPosts: sortedBlogPosts,
      comments: sortedComments,
      page: pageNumber,
      limit: pageSize,
    });
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Failed to fetch reported content",
        details: error.message,
      });
  }
}
