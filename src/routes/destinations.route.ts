import { Router } from "express";
import { Db } from "mongodb";
import {
  getDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
} from "../controllers/destinations.controller";

export const destinationsRouter = (db: Db) => {
  const router = Router();

  router.get("/", getDestinations(db));
  router.get("/:slug", getDestination(db));
  router.post("/", createDestination(db));
  router.put("/:id", updateDestination(db));
  router.delete("/:id", deleteDestination(db));

  return router;
};
