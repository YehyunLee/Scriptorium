import prisma from "../../../../utils/prisma";

/**
 * Fetches the templates created
 * Allowed method: GET
 * Url: /api/code_template/visitor/search_template
 * Access: Public
 * Payload: { search: string, page?: number, limit?: number }
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
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
          OR: [
            { title: { contains: search } },
            { explanation: { contains: search } },
            { tags: { contains: search } },
            { content: { contains: search } },
          ],
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