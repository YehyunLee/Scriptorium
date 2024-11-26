import prisma from "../../../../utils/prisma";
import { verifyUser } from "../../../../utils/verify_user";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Fork a code template
 * Allowed method: POST
 * Url: /api/code_template/user/create_fork_template
 * Access: User
 * Payload: { id, title?, explanation?, tags?, content }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
    return;
  }

  const decoded = verifyUser(req);
  if (!decoded) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.query;
  const { title, explanation, tags, content, language } = req.body;

  if (!content || !id) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  try {
    const originalTemplate = await prisma.codeTemplate.findUnique({
      where: { id: parseInt(id as string) },
    });

    if (!originalTemplate) {
      res.status(404).json({ error: "Original template not found" });
      return;
    }

    const newTemplate = await prisma.codeTemplate.create({
      data: {
        title,
        explanation: explanation || originalTemplate.explanation,
        tags: tags.join(", "), // Convert array to comma-separated string
        content,
        authorId: decoded.userId,
        forkedFromId: originalTemplate.id, // original template fork lists will be updated automatically
        language: language || originalTemplate.language,
      },
    });

    res
      .status(201)
      .json({ message: "Template forked successfully", template: newTemplate });
  } catch (error) {
    res.status(500).json({ error: "Failed to fork template" });
  }
}
