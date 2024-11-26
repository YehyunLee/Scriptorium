import prisma from "../../../../utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * Fetches the templates created
 * Allowed method: GET
 * Url: /api/code_template/visitor/search_template
 * Access: Public
 * Payload: { search: string, page?: number, limit?: number }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
    return;
  }

  let { search, page = 1, limit = 10 } = req.query;
  if (Array.isArray(search)) {
    search = search.join(" ");
  }
  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);
  const skip = (pageNumber - 1) * pageSize;

  try {
    const [templates, total] = await Promise.all([
      prisma.codeTemplate.findMany({
        where: {
          OR: [
            { title: { contains: search } },
            { explanation: { contains: search } },
            { tags: { contains: search } },
            { content: { contains: search } },
          ],
        },
        include: {
          author: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          forkedFrom: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        skip,
        take: pageSize,
      }),
      prisma.codeTemplate.count({
        where: {
          OR: [
            { title: { contains: search } },
            { explanation: { contains: search } },
            { tags: { contains: search } },
            { content: { contains: search } },
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
    res.status(500).json({ error: "Failed to fetch templates" });
  }
}
