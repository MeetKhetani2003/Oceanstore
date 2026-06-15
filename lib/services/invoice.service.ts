import PDFDocument from "pdfkit";
import { Readable } from "stream";
import { getGridFSBucket, BUCKET_NAMES } from "@/lib/db/gridfs";
import connectDB from "@/lib/db/connect";
import type { IOrder } from "@/lib/db/models/Order";

export interface InvoiceData {
  order: IOrder & { customerName: string; customerEmail: string; customerPhone?: string };
  invoiceNumber: string;
  gstRate: number;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  const { order, invoiceNumber, gstRate } = data;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── Header ──────────────────────────────────────────
    doc.fontSize(28).font("Helvetica-Bold").fillColor("#103045").text("OCEON", 50, 50);
    doc.fontSize(10).font("Helvetica").fillColor("#5c646e").text("Quality In Lowest Prices", 50, 82);

    doc.fontSize(10).fillColor("#14181c").text(`INVOICE #${invoiceNumber}`, 400, 50, { align: "right" });
    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, 400, 65, { align: "right" });
    doc.text(`Order: #${order.orderNumber}`, 400, 80, { align: "right" });

    // ── Divider ──────────────────────────────────────────
    doc.moveTo(50, 110).lineTo(545, 110).strokeColor("#e4dbcb").stroke();

    // ── Bill To & Ship To ──────────────────────────────────────────
    doc.y = 130;
    doc.fontSize(9).fillColor("#5c646e").text("BILL TO", 50, 130);
    doc.fontSize(11).fillColor("#14181c").font("Helvetica-Bold").text(order.customerName, 50, 145);
    doc.font("Helvetica").fontSize(10).fillColor("#2a3138");
    doc.text(order.address.line1, 50, 160);
    if (order.address.line2) doc.text(order.address.line2, 50, 173);
    doc.text(`${order.address.city}, ${order.address.state} - ${order.address.pincode}`, 50);
    doc.text(order.address.country, 50);
    doc.text(order.customerEmail, 50);
    if (order.customerPhone) doc.text(order.customerPhone, 50);

    doc.fontSize(9).fillColor("#5c646e").text("SHIP TO", 300, 130);
    doc.fontSize(11).fillColor("#14181c").font("Helvetica-Bold").text(order.address.name, 300, 145);
    doc.font("Helvetica").fontSize(10).fillColor("#2a3138");
    doc.text(order.address.line1, 300, 160);
    doc.text(`${order.address.city}, ${order.address.state} - ${order.address.pincode}`, 300);

    // ── Items Table ──────────────────────────────────────────
    const tableTop = doc.y + 30;
    doc.moveTo(50, tableTop).lineTo(545, tableTop).strokeColor("#e4dbcb").stroke();

    const headers = ["Item", "Qty", "Unit Price", "Total"];
    const colWidths = [260, 60, 90, 90];
    const colX = [50, 310, 370, 460];

    doc.y = tableTop + 10;
    doc.fontSize(9).fillColor("#5c646e").font("Helvetica-Bold");
    headers.forEach((h, i) => {
      doc.text(h.toUpperCase(), colX[i], tableTop + 10, {
        width: colWidths[i],
        align: i > 0 ? "right" : "left",
      });
    });

    let rowY = tableTop + 30;
    doc.font("Helvetica").fontSize(10).fillColor("#2a3138");

    for (const item of order.items) {
      doc.text(item.productSnapshot?.name || "Product", colX[0], rowY, { width: colWidths[0] });
      doc.text(String(item.qty), colX[1], rowY, { width: colWidths[1], align: "right" });
      doc.text(`₹${item.price.toFixed(2)}`, colX[2], rowY, { width: colWidths[2], align: "right" });
      doc.text(`₹${item.total.toFixed(2)}`, colX[3], rowY, { width: colWidths[3], align: "right" });
      rowY += 22;
      doc.moveTo(50, rowY - 2).lineTo(545, rowY - 2).strokeColor("#f2ede3").stroke();
    }

    // ── Totals ──────────────────────────────────────────
    rowY += 10;
    doc.moveTo(50, rowY).lineTo(545, rowY).strokeColor("#e4dbcb").stroke();
    rowY += 12;

    const addTotalRow = (label: string, value: string, bold = false) => {
      if (bold) doc.font("Helvetica-Bold");
      else doc.font("Helvetica");
      doc.fontSize(10).fillColor("#2a3138").text(label, 350, rowY, { width: 100 });
      doc.text(value, 460, rowY, { width: 90, align: "right" });
      rowY += 18;
    };

    addTotalRow("Subtotal:", `₹${order.subtotal.toFixed(2)}`);
    if (order.discountAmount > 0)
      addTotalRow("Discount:", `-₹${order.discountAmount.toFixed(2)}`);
    addTotalRow("Shipping:", order.shippingFee === 0 ? "Free" : `₹${order.shippingFee.toFixed(2)}`);
    addTotalRow(`GST (${(gstRate * 100).toFixed(0)}%):`, `₹${order.taxAmount.toFixed(2)}`);

    doc.moveTo(350, rowY).lineTo(545, rowY).strokeColor("#e4dbcb").stroke();
    rowY += 8;
    addTotalRow("TOTAL:", `₹${order.total.toFixed(2)}`, true);

    // ── Payment Info ──────────────────────────────────────────
    rowY += 20;
    doc.fontSize(9).fillColor("#5c646e").font("Helvetica-Bold").text("PAYMENT INFORMATION", 50, rowY);
    rowY += 14;
    doc.font("Helvetica").fillColor("#2a3138").fontSize(10);
    doc.text(`Status: ${order.payment.status.toUpperCase()}`, 50, rowY);
    if (order.payment.razorpayPaymentId)
      doc.text(`Payment ID: ${order.payment.razorpayPaymentId}`, 50);
    if (order.payment.paidAt)
      doc.text(`Paid on: ${new Date(order.payment.paidAt).toLocaleDateString("en-IN")}`, 50);

    // ── Footer ──────────────────────────────────────────
    doc.fontSize(9).fillColor("#5c646e").text(
      "Thank you for shopping with OCEON. This is a computer-generated invoice.",
      50,
      doc.page.height - 60,
      { align: "center", width: 495 }
    );

    doc.end();
  });
}

export async function saveInvoiceToGridFS(
  invoiceBuffer: Buffer,
  invoiceNumber: string
): Promise<string> {
  await connectDB();
  const bucket = getGridFSBucket(BUCKET_NAMES.INVOICES);

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(
      `invoice-${invoiceNumber}.pdf`,
      { contentType: "application/pdf", metadata: { invoiceNumber } }
    );
    const readable = Readable.from(invoiceBuffer);
    readable.pipe(uploadStream);
    uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
    uploadStream.on("error", reject);
  });
}

export async function generateAndSaveInvoice(
  data: InvoiceData
): Promise<{ fileId: string; buffer: Buffer }> {
  const buffer = await generateInvoicePDF(data);
  const fileId = await saveInvoiceToGridFS(buffer, data.invoiceNumber);
  return { fileId, buffer };
}
