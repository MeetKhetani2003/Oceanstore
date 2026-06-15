import nodemailer from "nodemailer";
import EmailLog from "@/lib/db/models/EmailLog";
import connectDB from "@/lib/db/connect";
import type { IOrder } from "@/lib/db/models/Order";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

// ─── HTML Templates ──────────────────────────────────────────────────────────

function baseTemplate(content: string, title: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f7f4ed; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 40px rgba(7,23,38,0.08); }
    .header { background: linear-gradient(135deg, #103045 0%, #0b2436 100%); padding: 32px 40px; text-align: center; }
    .logo { display: inline-flex; align-items: center; gap: 10px; }
    .logo-mark { width: 36px; height: 36px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
    .logo-text { color: #fff; font-size: 18px; font-weight: 600; letter-spacing: 0.34em; }
    .body { padding: 40px; }
    .footer { background: #f7f4ed; padding: 24px 40px; text-align: center; border-top: 1px solid #e4dbcb; }
    .footer p { color: #5c646e; font-size: 12px; margin: 0; }
    h1 { color: #14181c; font-size: 24px; font-weight: 600; margin: 0 0 8px; }
    p { color: #2a3138; font-size: 15px; line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #1d4e6e; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 100px; font-size: 14px; font-weight: 600; margin: 16px 0; }
    .divider { border: none; border-top: 1px solid #e4dbcb; margin: 24px 0; }
    .status-badge { display: inline-block; background: #f1f6f2; color: #3d6248; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 8px 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #5c646e; border-bottom: 1px solid #e4dbcb; }
    td { padding: 12px; font-size: 14px; color: #2a3138; border-bottom: 1px solid #f2ede3; }
    .amount { font-size: 24px; font-weight: 600; color: #14181c; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">
        <span class="logo-text">OCEON</span>
      </div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} OCEON. Quality In Lowest Prices.</p>
      <p style="margin-top:8px">Questions? <a href="mailto:hello@oceon.com" style="color:#1d4e6e">hello@oceon.com</a></p>
    </div>
  </div>
</body>
</html>`;
}

export const templates = {
  emailVerification: (name: string, url: string) =>
    baseTemplate(
      `<h1>Verify your email</h1>
       <p>Hi ${name},</p>
       <p>Welcome to OCEON! Please click the button below to verify your email address and activate your account.</p>
       <a href="${url}" class="btn">Verify Email</a>
       <p style="font-size:13px;color:#5c646e">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>`,
      "Verify your OCEON email"
    ),

  welcome: (name: string) =>
    baseTemplate(
      `<h1>Welcome to OCEON! 🎉</h1>
       <p>Hi ${name},</p>
       <p>Your account is now active. Shop fresh produce, dairy, and everyday essentials — delivered to your door in as little as 30 minutes.</p>
       <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" class="btn">Start Shopping</a>`,
      "Welcome to OCEON"
    ),

  orderConfirmation: (order: Partial<IOrder> & { customerName: string }) =>
    baseTemplate(
      `<h1>Order Confirmed ✅</h1>
       <p>Hi ${order.customerName},</p>
       <p>Your order <strong>#${order.orderNumber}</strong> has been confirmed. We're preparing your items now.</p>
       <hr class="divider" />
       <table>
         <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
         <tbody>
           ${(order.items || []).map((i) => `<tr><td>${i.productSnapshot?.name}</td><td>${i.qty}</td><td>₹${i.total.toFixed(2)}</td></tr>`).join("")}
         </tbody>
       </table>
       <hr class="divider" />
       <p>Total: <strong class="amount">₹${order.total?.toFixed(2)}</strong></p>
       <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${order._id}" class="btn">Track Order</a>`,
      `Order #${order.orderNumber} Confirmed`
    ),

  paymentSuccess: (name: string, orderNumber: string, amount: number) =>
    baseTemplate(
      `<h1>Payment Successful 💳</h1>
       <p>Hi ${name},</p>
       <p>We've received your payment of <strong>₹${amount.toFixed(2)}</strong> for order <strong>#${orderNumber}</strong>.</p>
       <span class="status-badge">Paid</span>
       <p style="margin-top:16px">Your order is now being prepared for dispatch.</p>
       <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" class="btn">View Order</a>`,
      `Payment Confirmed for #${orderNumber}`
    ),

  shippingUpdate: (
    name: string,
    orderNumber: string,
    status: string,
    note?: string
  ) =>
    baseTemplate(
      `<h1>Order Update 📦</h1>
       <p>Hi ${name},</p>
       <p>Your order <strong>#${orderNumber}</strong> status has been updated.</p>
       <span class="status-badge">${status}</span>
       ${note ? `<p style="margin-top:16px">${note}</p>` : ""}
       <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" class="btn">Track Order</a>`,
      `Order #${orderNumber} Update`
    ),

  passwordReset: (name: string, url: string) =>
    baseTemplate(
      `<h1>Reset your password</h1>
       <p>Hi ${name},</p>
       <p>We received a request to reset your password. Click the button below to create a new one.</p>
       <a href="${url}" class="btn">Reset Password</a>
       <p style="font-size:13px;color:#5c646e">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>`,
      "Reset your OCEON password"
    ),

  refundInitiated: (name: string, orderNumber: string, amount: number) =>
    baseTemplate(
      `<h1>Refund Initiated 💰</h1>
       <p>Hi ${name},</p>
       <p>A refund of <strong>₹${amount.toFixed(2)}</strong> for order <strong>#${orderNumber}</strong> has been initiated.</p>
       <p>Refunds typically appear in your account within 5-7 business days.</p>`,
      `Refund Initiated for #${orderNumber}`
    ),

  lowStockAlert: (products: { name: string; stock: number }[]) =>
    baseTemplate(
      `<h1>⚠️ Low Stock Alert</h1>
       <p>The following products are running low on stock:</p>
       <table>
         <thead><tr><th>Product</th><th>Available Stock</th></tr></thead>
         <tbody>
           ${products.map((p) => `<tr><td>${p.name}</td><td style="color:${p.stock === 0 ? "#dc2626" : "#d97706"}">${p.stock === 0 ? "Out of Stock" : p.stock}</td></tr>`).join("")}
         </tbody>
       </table>`,
      "Low Stock Alert — OCEON Admin"
    ),
};

// ─── Send Email ───────────────────────────────────────────────────────────────

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  template: string;
  userId?: string;
  orderId?: string;
}): Promise<void> {
  await connectDB();

  const log = await EmailLog.create({
    to: opts.to,
    subject: opts.subject,
    template: opts.template,
    userId: opts.userId,
    orderId: opts.orderId,
    status: "pending",
    attempts: 0,
  });

  try {
    const info = await getTransporter().sendMail({
      from: process.env.SMTP_FROM || "OCEON <hello@oceon.com>",
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });

    await EmailLog.findByIdAndUpdate(log._id, {
      status: "sent",
      messageId: info.messageId,
      sentAt: new Date(),
      attempts: 1,
    });
  } catch (err) {
    await EmailLog.findByIdAndUpdate(log._id, {
      status: "failed",
      lastError: String(err),
      attempts: 1,
      nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // retry in 5 min
    });
    console.error("[Email] Send failed:", err);
  }
}

export async function retryFailedEmails(): Promise<number> {
  await connectDB();
  const failedEmails = await EmailLog.find({
    status: { $in: ["failed", "retrying"] },
    nextRetryAt: { $lte: new Date() },
    attempts: { $lt: 5 },
  }).limit(20);

  let retried = 0;

  for (const emailLog of failedEmails) {
    try {
      await EmailLog.findByIdAndUpdate(emailLog._id, { status: "retrying" });
      await getTransporter().sendMail({
        from: process.env.SMTP_FROM || "OCEON <hello@oceon.com>",
        to: emailLog.to,
        subject: emailLog.subject,
        html: `<p>Email retry for: ${emailLog.template}</p>`,
      });
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        status: "sent",
        sentAt: new Date(),
        attempts: emailLog.attempts + 1,
      });
      retried++;
    } catch (err) {
      const nextAttempt = emailLog.attempts + 1;
      await EmailLog.findByIdAndUpdate(emailLog._id, {
        status: nextAttempt >= 5 ? "failed" : "retrying",
        lastError: String(err),
        attempts: nextAttempt,
        nextRetryAt: new Date(
          Date.now() + Math.pow(2, nextAttempt) * 5 * 60 * 1000
        ), // exponential backoff
      });
    }
  }

  return retried;
}
