import { Request, Response } from "express";
import { Db } from "mongodb";

const collectionName = "tour-packages";

function booleanQuery(value: unknown) {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

export const getTourPackages = (db: Db) => async (req: Request, res: Response) => {
  try {
    const query: Record<string, unknown> = { active: { $ne: false } };
    const featured = booleanQuery(req.query.featured);
    const upcoming = booleanQuery(req.query.upcoming);

    if (featured !== undefined) query.featured = featured;
    if (upcoming !== undefined) query.upcoming = upcoming;

    const packages = await db
      .collection(collectionName)
      .find(query, { projection: { experience: 0 } })
      .sort({ sortOrder: 1 })
      .toArray();

    res.status(200).json({
      success: true,
      message: "Tour packages fetched successfully",
      data: packages,
    });
  } catch (error) {
    console.error("Failed to fetch tour packages:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getTourPackageBySlug = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const selectedPackage = await db.collection(collectionName).findOne({
      slug,
      active: { $ne: false },
    });

    if (!selectedPackage) {
      return res.status(404).json({
        success: false,
        message: "Tour package not found",
      });
    }

    if (!selectedPackage.sourceSlug) {
      return res.status(200).json({ success: true, data: selectedPackage });
    }

    const sourcePackage = await db.collection(collectionName).findOne({
      slug: selectedPackage.sourceSlug,
      active: { $ne: false },
    });

    if (!sourcePackage) {
      return res.status(500).json({
        success: false,
        message: "The source package details are unavailable",
      });
    }

    const resolvedPackage = {
      ...sourcePackage,
      ...selectedPackage,
      _id: selectedPackage._id,
      experience: sourcePackage.experience,
      includes: sourcePackage.includes,
      description: sourcePackage.description,
      people: sourcePackage.people,
    };

    return res.status(200).json({ success: true, data: resolvedPackage });
  } catch (error) {
    console.error("Failed to fetch tour package:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
