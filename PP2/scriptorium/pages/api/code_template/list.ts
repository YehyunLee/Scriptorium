import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../utils/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const templates = await prisma.codeTemplate.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        title: 'asc'
      }
    });

    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch templates" });
  }
}