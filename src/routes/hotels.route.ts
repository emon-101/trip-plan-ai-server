import { Router } from "express";
import { Db } from "mongodb";
import { getHotels } from "../controllers/hotels.controller";

export const hotelsRouter = (db: Db) => {
  const router = Router();

  router.get("/", getHotels(db));

  return router;
};
