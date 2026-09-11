import { Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const getDestinations = (db: Db) => async (req: Request, res: Response) => {
  try {
    const destinations = await db.collection("destinations").find().toArray();
    res.status(200).json({
      success: true,
      message: "Destinations fetched successfully",
      data: destinations,
    });
  } catch (error) {
    console.error("Failed to fetch destinations:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getDestination = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const destination = await db.collection("destinations").findOne({ slug });
    if (!destination) {
      return res.status(404).json({ success: false, message: "Not Found" });
    }
    res.status(200).json({
      success: true,
      data: destination,
    });
  } catch (error) {
    console.error("Failed to fetch destination:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createDestination = (db: Db) => async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const result = await db.collection("destinations").insertOne(data);
    res.status(201).json({
      success: true,
      message: "Destination created",
      data: { _id: result.insertedId, ...data },
    });
  } catch (error) {
    console.error("Failed to create destination:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateDestination = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    delete data._id; // prevent updating _id
    
    const result = await db.collection("destinations").updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Not Found" });
    }
    
    res.status(200).json({ success: true, message: "Destination updated" });
  } catch (error) {
    console.error("Failed to update destination:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteDestination = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.collection("destinations").deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not Found" });
    }
    
    res.status(200).json({ success: true, message: "Destination deleted" });
  } catch (error) {
    console.error("Failed to delete destination:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getPlaceBySlug = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    // Find the destination that contains this place
    const destination = await db.collection("destinations").findOne({
      "placesToExplore.slug": slug
    });

    if (!destination) {
      return res.status(404).json({ success: false, message: "Not Found" });
    }

    const place = destination.placesToExplore.find((p: any) => p.slug === slug);
    
    res.status(200).json({
      success: true,
      data: {
        place,
        destination: {
          slug: destination.slug,
          name: destination.name
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch place:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
