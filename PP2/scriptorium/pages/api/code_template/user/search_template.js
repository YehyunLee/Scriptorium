import prisma from "../../../../utils/prisma";
import { verifyUser } from "../../../../utils/verify_user";

/**
 * Fetches the templates created by the user
 * Allowed method: GET
 * Url: /api/code_template/user/search_template
 * Access: User
 * Payload: { search: string, page?: number, limit?: number }
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
    return;
  }

  const decoded = verifyUser(req);
  if (!decoded) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { search, page = 1, limit = 10 } = req.query;
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;

  try {
    const [templates, total] = await Promise.all([
      prisma.codeTemplate.findMany({
      where: {
        authorId: decoded.userId,
        OR: [
          { title: { contains: search } },
          { explanation: { contains: search } },
            { tags: { contains: search } },
          ],
        },
        skip,
        take: pageSize,
      }),
      prisma.codeTemplate.count({
        where: {
          authorId: decoded.userId,
          OR: [
            { title: { contains: search } },
            { explanation: { contains: search } },
            { tags: { contains: search } },
        ],
      },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      templates,
      total,
      page: pageNumber,
      totalPages,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
}