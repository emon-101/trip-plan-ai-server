import { Request, Response } from "express";
import { Db, ObjectId } from "mongodb";

export const createTourBooking = (db: Db) => async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    if (!bookingData.packageId || !bookingData.customer) {
      return res.status(400).json({ success: false, message: "Missing required booking details" });
    }

    const newBooking = {
      ...bookingData,
      status: "Pending",
      paymentStatus: "Unpaid",
      createdAt: new Date(),
    };

    const result = await db.collection("tour-bookings").insertOne(newBooking);

    res.status(201).json({
      success: true,
      message: "Tour booking created successfully",
      data: {
        _id: result.insertedId,
        ...newBooking
      }
    });
  } catch (error) {
    console.error("Failed to create tour booking:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getBookingById = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }
    const booking = await db.collection("tour-bookings").findOne({ _id: new ObjectId(id) });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error("Failed to fetch booking by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getUserBookings = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Usually, the userId from auth might be passed from frontend. 
    // Wait, the client is sending `customer.email`. We can fetch by email if we don't have a strict userId yet.
    // The tour booking created in previous step didn't explicitly take `userId`, it took `customer: { email, name, phone }`.
    // Let's fetch by email since it's the most reliable unique identifier currently saved.
    
    const { email } = req.query;

    let query: any = {};
    if (email && userId && userId !== "mockId") {
      query = { $or: [{ "customer.email": email }, { userId: userId }] };
    } else if (email) {
      query = { "customer.email": email as string };
    } else if (userId && userId !== "mockId") {
      query = { userId: userId };
    }

    const bookings = await db.collection("tour-bookings")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error("Failed to fetch user bookings:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const initiatePayment = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await db.collection("tour-bookings").findOne({ _id: new ObjectId(bookingId) });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({ success: false, message: "Booking is already paid" });
    }

    // MOCK SSLCOMMERZ INTEGRATION
    // Normally here we would initialize the SSLCommerz session and get a Gateway URL.
    // We will return a mock URL for now.
    
    const mockPaymentUrl = `/dashboard/my-bookings?payment=success&bookingId=${bookingId}`;

    // Optionally update status to "Payment Pending"
    await db.collection("tour-bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { paymentStatus: "Processing" } }
    );

    res.status(200).json({
      success: true,
      paymentUrl: mockPaymentUrl,
      message: "Payment initiated successfully"
    });
  } catch (error) {
    console.error("Failed to initiate payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const confirmPayment = (db: Db) => async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return res.status(400).json({ success: false, message: "Invalid booking ID" });
    }

    const booking = await db.collection("tour-bookings").findOne({ _id: new ObjectId(bookingId) });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(400).json({ success: false, message: "Booking is already paid" });
    }

    await db.collection("tour-bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { paymentStatus: "Paid", status: "Confirmed", paidAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: "Payment confirmed successfully"
    });
  } catch (error) {
    console.error("Failed to confirm payment:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
