import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { UserRepository } from "@/lib/db/repositories/user.repository";

export async function POST(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(COOKIE_NAMES.ACCESS)?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const address = await req.json();
    if (!address.name || !address.line1 || !address.city || !address.pincode || !address.phone) {
      return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
    }

    const updatedUser = await UserRepository.addAddress(payload.userId, {
      label: address.label || "Home",
      name: address.name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state || "State",
      pincode: address.pincode,
      country: "India",
      isDefault: address.isDefault || false,
    });

    return NextResponse.json({ success: true, addresses: updatedUser?.addresses });
  } catch (error: any) {
    console.error("Add address error:", error);
    return NextResponse.json({ error: error.message || "Failed to add address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const accessToken = req.cookies.get(COOKIE_NAMES.ACCESS)?.value;
    if (!accessToken) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const { addressId } = await req.json();
    if (!addressId) {
      return NextResponse.json({ error: "Address ID is required" }, { status: 400 });
    }

    const updatedUser = await UserRepository.deleteAddress(payload.userId, addressId);

    return NextResponse.json({ success: true, addresses: updatedUser?.addresses });
  } catch (error: any) {
    console.error("Delete address error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete address" }, { status: 500 });
  }
}
