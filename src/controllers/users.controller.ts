import { Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const getUsers = (db: Db) => async (req: Request, res: Response) => {
  try {
    const users = await db.collection("user").find().toArray();
    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getUserById = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Attempt to find user by string id first (better-auth uses string IDs)
    let user = await db.collection("user").findOne({ _id: id });
    
    if (!user) {
      // Fallback to ObjectId just in case
      try {
        user = await db.collection("user").findOne({ _id: new ObjectId(id) });
      } catch {
        // invalid object id, ignore
      }
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Get aggregated stats
    const [tripsCount, bookmarksCount, reviewsCount, storiesCount] = await Promise.all([
      db.collection("trips").countDocuments({ userId: id }),
      db.collection("savedDestinations").countDocuments({ userId: id }).catch(() => 0), // Assuming savedDestinations or bookmarks
      db.collection("reviews").countDocuments({ userId: id }),
      db.collection("stories").countDocuments({ userId: id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        ...user,
        stats: {
          tripsCount,
          bookmarksCount,
          reviewsCount,
          storiesCount
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch user by id:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateUserProfile = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, phone, bio, location, image, coverImage, 
      passportNationality, emergencyContact, travelPreferences, socialLinks 
    } = req.body;
    
    const updateData: any = {
      updatedAt: new Date()
    };
    
    // Only include provided fields
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (image !== undefined) updateData.image = image;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (passportNationality !== undefined) updateData.passportNationality = passportNationality;
    if (emergencyContact !== undefined) updateData.emergencyContact = emergencyContact;
    if (travelPreferences !== undefined) updateData.travelPreferences = travelPreferences;
    if (socialLinks !== undefined) updateData.socialLinks = socialLinks;

    let result = await db.collection("user").findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      try {
        result = await db.collection("user").findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: updateData },
          { returnDocument: 'after' }
        );
      } catch {
        // ignore
      }
    }
    
    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      data: result 
    });
  } catch (error) {
    console.error("Failed to update user profile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateUserRole = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    const result = await db.collection("user").updateOne(
      { _id: id },
      { $set: { role } }
    );
    
    if (result.matchedCount === 0) {
      const objResult = await db.collection("user").updateOne(
        { _id: new ObjectId(id) },
        { $set: { role } }
      );
      if (objResult.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "Not Found" });
      }
    }
    
    res.status(200).json({ success: true, message: `User role updated to ${role}` });
  } catch (error) {
    console.error("Failed to update user role:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateUserStatus = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await db.collection("user").updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    );
    
    if (result.matchedCount === 0) {
      const objResult = await db.collection("user").updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
      );
      if (objResult.matchedCount === 0) {
          return res.status(404).json({ success: false, message: "Not Found" });
      }
    }
    
    res.status(200).json({ success: true, message: `User status updated to ${status}` });
  } catch (error) {
    console.error("Failed to update user status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteUser = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    let result = await db.collection("user").deleteOne({ _id: id });
    if (result.deletedCount === 0) {
       result = await db.collection("user").deleteOne({ _id: new ObjectId(id) });
    }
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Not Found" });
    }
    
    await db.collection("session").deleteMany({ userId: id });
    await db.collection("account").deleteMany({ userId: id });
    
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Failed to delete user:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
