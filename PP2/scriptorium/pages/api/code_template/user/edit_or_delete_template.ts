import prisma from "../../../../utils/prisma";
import { verifyUser } from "../../../../utils/verify_user";
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Edit or Delete Template API: Update or delete a code template
 * Allowed method: PUT, DELETE
 * Url: /api/code_template/user/edit_or_delete_template
 * Access: User
 * Payload: { id, title, explanation?, tags?, content } for PUT
 *          { id } for DELETE
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  const decoded = verifyUser(req);
  if (!decoded) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { id } = req.query;

  if (!id) {
      res.status(400).json({ error: "Template ID is required" });
      return
  }

  if (method === "PUT") {
    const { title, explanation, tags, content, language } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: "Title and content are required" });
      return;
    }

    try {
      // check if the template exists
        const template = await prisma.codeTemplate.findUnique({
            where: { id: parseInt(id as string) },
        });

        if (!template) {
            res.status(404).json({ error: "Template not found" });
            return;
        }

      const updatedTemplate = await prisma.codeTemplate.update({
        where: { id: parseInt(id as string), authorId: decoded.userId },  // This ensures that only the author can update the template
        data: {
          title,
          explanation,
          tags: tags.join(","), // Convert array to comma-separated string
          content,
          language,
        },
      });
      res.status(200).json({
        message: "Template updated successfully",
        template: updatedTemplate,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update template" });
    }
  } else if (method === "DELETE") {
    try {
        // check if the template exists
        const template = await prisma.codeTemplate.findUnique({
            where: { id: parseInt(id as string) },
        });

        if (!template) {
            res.status(404).json({ error: "Template not found" });
            return;
        }

      await prisma.codeTemplate.delete({
        where: { id: parseInt(id as string), authorId: decoded.userId },
      });
      res.status(200).json({ message: "Template deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  } else {
    res.setHeader("Allow", ["PUT", "DELETE"]);
    res.status(405).json({ message: `Method ${method} not allowed` });
  }
}
