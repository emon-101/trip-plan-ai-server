import { Router, Request, Response } from "express";
import { Db } from "mongodb";
import { foodDestinations, restaurantSpotlights } from "../data/food";

export const foodRouter = (db: Db) => {
  const router = Router();

  // GET /api/food
  router.get("/", async (req: Request, res: Response) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          destinations: foodDestinations,
          restaurants: restaurantSpotlights
        }
      });
    } catch (error) {
      console.error("Failed to fetch food:", error);
      res.status(500).json({ success: false, message: "Server Error" });
    }
  });

  return router;
};
