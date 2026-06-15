import Reservation, { IReservation } from "@/lib/db/models/Reservation";
import connectDB from "@/lib/db/connect";

export class ReservationRepository {
  static async findById(id: string): Promise<IReservation | null> {
    await connectDB();
    return Reservation.findById(id).lean<IReservation>();
  }

  static async findActiveByUser(userId: string): Promise<IReservation | null> {
    await connectDB();
    return Reservation.findOne({
      userId,
      status: "active",
      expiresAt: { $gt: new Date() },
    }).lean<IReservation>();
  }

  static async create(
    data: Partial<IReservation>
  ): Promise<IReservation> {
    await connectDB();
    const reservation = new Reservation(data);
    await reservation.save();
    return reservation.toObject();
  }

  static async updateStatus(
    id: string,
    status: IReservation["status"]
  ): Promise<IReservation | null> {
    await connectDB();
    return Reservation.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean<IReservation>();
  }

  static async findExpired(): Promise<IReservation[]> {
    await connectDB();
    return Reservation.find({
      status: "active",
      expiresAt: { $lt: new Date() },
    }).lean<IReservation[]>();
  }

  static async deleteById(id: string): Promise<void> {
    await connectDB();
    await Reservation.findByIdAndDelete(id);
  }
}
