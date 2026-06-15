import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAMES } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { OrderRepository } from "@/lib/db/repositories/order.repository";
import { UserRepository } from "@/lib/db/repositories/user.repository";
import { generateInvoicePDF } from "@/lib/services/invoice.service";

interface RouteProps {
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const accessToken = req.cookies.get(COOKIE_NAMES.ACCESS)?.value;
    if (!accessToken) {
      return new NextResponse("Authentication required", { status: 401 });
    }

    let payload;
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return new NextResponse("Session expired", { status: 401 });
    }

    const { orderId } = await params;
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Verify ownership
    if (order.user._id.toString() !== payload.userId && payload.role !== "admin") {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Get user details
    const user = await UserRepository.findById(payload.userId);
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Prepare Invoice Data
    const invoiceNumber = order.invoiceNumber || `INV-${order.orderNumber.replace("ORD-", "")}`;
    const invoicePdfBuffer = await generateInvoicePDF({
      order: {
        ...order,
        customerName: user.name,
        customerEmail: user.email,
        customerPhone: user.phone || order.address?.phone || "",
      } as any,
      invoiceNumber,
      gstRate: order.taxRate || 0.08,
    });

    const response = new NextResponse(new Uint8Array(invoicePdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order.orderNumber}.pdf`,
      },
    });

    return response;
  } catch (error: any) {
    console.error("Generate invoice route error:", error);
    return new NextResponse(error.message || "Failed to download invoice", { status: 500 });
  }
}
