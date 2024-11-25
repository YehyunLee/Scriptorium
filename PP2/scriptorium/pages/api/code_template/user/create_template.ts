import prisma from "../../../../utils/prisma";
import { verifyUser } from "../../../../utils/verify_user";
import type { NextApiRequest, NextApiResponse } from "next";
/**
 * Create a new code template
 * Allowed method: POST
 * Url: /api/code_template/user/create_template
 * Access: User
 * Payload: { title, explanation, tags, content? }
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

  // From here, assume user is authenticated
  const { title, explanation, tags, content, language } = req.body;
  if (!content) {
    res.status(400).json({ error: "Template content is required" });
    return;
  }

  try {
    const newTemplate = await prisma.codeTemplate.create({
      data: {
        title,
        explanation,
        tags: tags.join(", "), // Convert array to comma-separated string
        content,
        authorId: decoded.userId,
        language,
      },
    });

    res
      .status(201)
      .json({ message: "Template saved successfully", template: newTemplate });
  } catch (error) {
    res.status(500).json({ error: "Failed to save template" });
  }
}
