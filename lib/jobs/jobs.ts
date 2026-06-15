import { cleanupExpiredReservations } from "@/lib/services/reservation.service";
import { retryFailedEmails } from "@/lib/services/email.service";
import { cleanExpiredSessions } from "@/lib/auth/session";
import { ProductRepository } from "@/lib/db/repositories/product.repository";
import { sendEmail, templates } from "@/lib/services/email.service";
import connectDB from "@/lib/db/connect";

// ─── Individual Job Functions ─────────────────────────────────────────────────

export async function runReservationCleanup(): Promise<void> {
  try {
    await connectDB();
    const released = await cleanupExpiredReservations();
    if (released > 0) {
      console.log(`[Job:ReservationCleanup] Released ${released} expired reservations`);
    }
  } catch (err) {
    console.error("[Job:ReservationCleanup] Error:", err);
  }
}

export async function runLowStockMonitor(): Promise<void> {
  try {
    await connectDB();
    const lowStockProducts = await ProductRepository.getLowStockProducts();
    if (lowStockProducts.length === 0) return;

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) return;

    await sendEmail({
      to: adminEmail,
      subject: `⚠️ Low Stock Alert — ${lowStockProducts.length} product(s)`,
      html: templates.lowStockAlert(
        lowStockProducts.map((p) => ({
          name: p.name,
          stock: p.inventory.availableStock,
        }))
      ),
      template: "low_stock_alert",
    });

    console.log(`[Job:LowStockMonitor] Alert sent for ${lowStockProducts.length} products`);
  } catch (err) {
    console.error("[Job:LowStockMonitor] Error:", err);
  }
}

export async function runEmailRetry(): Promise<void> {
  try {
    await connectDB();
    const retried = await retryFailedEmails();
    if (retried > 0) {
      console.log(`[Job:EmailRetry] Retried ${retried} failed emails`);
    }
  } catch (err) {
    console.error("[Job:EmailRetry] Error:", err);
  }
}

export async function runSessionCleanup(): Promise<void> {
  try {
    await connectDB();
    const deleted = await cleanExpiredSessions();
    if (deleted > 0) {
      console.log(`[Job:SessionCleanup] Removed ${deleted} expired sessions`);
    }
  } catch (err) {
    console.error("[Job:SessionCleanup] Error:", err);
  }
}
