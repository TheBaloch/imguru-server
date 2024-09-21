import { Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { formatAndSavePassport } from "../utils/passport/formatAndSavePassport";

export const addPassport = async (req: Request, res: Response) => {
  const {
    auth,
    mainContent,
    secondContent,
    thirdContent,
    visaFreeAccess,
    visaOnArrival,
    eTA,
    visaOnline,
    visaRequired,
    slug,
  } = req.body;

  if (auth != process.env.AUTH_KEY)
    return res.status(408).json({ message: "Not Authorized" });
  if (
    !mainContent ||
    !secondContent ||
    !thirdContent ||
    !visaFreeAccess ||
    !visaOnArrival ||
    !eTA ||
    !visaOnline ||
    !visaRequired ||
    !slug
  )
    return res.status(304).json({ message: "Something is missing" });
  res.status(201).json({ message: "Passport generation started" });
  setTimeout(async () => {
    console.log(`Started: ${slug}`);
    await formatAndSavePassport(
      mainContent,
      secondContent,
      thirdContent,
      visaFreeAccess,
      visaOnArrival,
      eTA,
      visaOnline,
      visaRequired,
      slug
    );
  }, 100);
};

export const getPassportBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const { lang = "en" } = req.query;
};
