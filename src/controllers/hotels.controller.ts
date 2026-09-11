import { Request, Response } from "express";
import { Db } from "mongodb";
import { destinations, hotels } from "../data/hotels";

export const getHotels = (db: Db) => async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        destinations,
        hotels
      }
    });
  } catch (error) {
    console.error("Failed to fetch hotels:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
