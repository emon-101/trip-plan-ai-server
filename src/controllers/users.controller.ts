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
