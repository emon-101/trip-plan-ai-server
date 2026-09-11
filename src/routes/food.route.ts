import { Router } from "express";
import { Db } from "mongodb";
import { getFood } from "../controllers/food.controller";

export const foodRouter = (db: Db) => {
  const router = Router();

  router.get("/", getFood(db));

  return router;
};
