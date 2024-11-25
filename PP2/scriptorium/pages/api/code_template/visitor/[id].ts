import prisma from "@/utils/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
    return;
  }

  const { id } = req.query;

  try {
    const template = await prisma.codeTemplate.findUnique({
      where: { id: parseInt(id as string) },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!template) {
      res.status(404).json({ message: "Template not found" });
      return;
    }

    res.status(200).json(template);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch template" });
  }
}