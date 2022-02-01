// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { Person, PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Person[]>
) {
  const users: Person[] = await prisma.person.findMany();
  res.status(200).json(users);
}
