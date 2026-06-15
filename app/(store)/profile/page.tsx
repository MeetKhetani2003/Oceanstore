import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAMES } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { UserRepository } from "@/lib/db/repositories/user.repository";
import { OrderRepository } from "@/lib/db/repositories/order.repository";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.ACCESS)?.value;
  console.log(`[ProfilePage] Token present: ${!!accessToken}`);

  if (!accessToken) {
    console.log("[ProfilePage] Redirecting: No token found");
    redirect("/login?from=/profile");
  }

  let payload;
  try {
    payload = verifyAccessToken(accessToken);
    console.log(`[ProfilePage] Token verified for: ${payload.email}`);
  } catch (err: any) {
    console.log(`[ProfilePage] Redirecting: Token verification failed: ${err.message}`);
    redirect("/login?from=/profile");
  }

  // Fetch user info and order history from DB
  const user = await UserRepository.findById(payload.userId);
  if (!user) {
    redirect("/login?from=/profile");
  }

  const { orders } = await OrderRepository.list({
    userId: payload.userId,
    limit: 50,
  });

  // Prepare simple structures for Client Component
  const formattedUser = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    addresses: (user.addresses || []).map((a: any) => ({
      id: a._id.toString(),
      label: a.label,
      name: a.name,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 || "",
      city: a.city,
      state: a.state,
      pincode: a.pincode,
      isDefault: a.isDefault,
    })),
  };

  const formattedOrders = orders.map((o: any) => ({
    id: o._id.toString(),
    orderNumber: o.orderNumber,
    createdAt: o.createdAt.toISOString(),
    total: o.total,
    status: o.status,
    paymentStatus: o.payment?.status || "pending",
    items: o.items.map((i: any) => ({
      name: i.productSnapshot?.name || "Product",
      qty: i.qty,
      price: i.price,
    })),
  }));

  return (
    <div className="bg-cream-100 min-h-screen pt-28 pb-20">
      <div className="container-x max-w-5xl">
        <ProfileClient initialUser={formattedUser} initialOrders={formattedOrders} />
      </div>
    </div>
  );
}
