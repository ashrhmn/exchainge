import { Person, PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getPersons(req, res);
    case "POST":
      return addPerson(req, res);
    default:
      return res.status(403).json({ error: "Method not allowed" });
  }
}

const getPersons = async (
  req: NextApiRequest,
  res: NextApiResponse<Person[]>
) => {
  const persons: Person[] = await prisma.person.findMany();
  return res.status(200).json(persons);
};

const addPerson = async (req: NextApiRequest, res: NextApiResponse<Person>) => {
  const { name, email } = req.body;
  const result: Person = await prisma.person.create({ data: { name, email } });
  return res.status(201).json(result);
};
