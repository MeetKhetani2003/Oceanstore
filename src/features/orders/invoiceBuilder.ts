import path from 'path';
import { uploadToGridFS } from '@/features/storage/gridfs';

// ---------------------------------------------------------------------------
// PDFKit font-path fix for Next.js on Windows
// ---------------------------------------------------------------------------
// Next.js overrides process.cwd() to "C:\ROOT" in its server runtime which
// breaks PDFKit's internal font resolution. We temporarily patch process.cwd
// to return the real node_modules path while PDFDocument is being instantiated.
// ---------------------------------------------------------------------------
function createPDFDoc(options: Record<string, any> = {}) {
  // Resolve the pdfkit package root (absolute, always correct)
  const pdfkitMain = require.resolve('pdfkit');
  const pdfkitRoot = path.dirname(path.dirname(pdfkitMain)); // …/node_modules/pdfkit

  // Save original cwd and override it temporarily
  const originalCwd = process.cwd.bind(process);
  (process as any).cwd = () => pdfkitRoot;

  let PDFDocument: any;
  let doc: any;
  try {
    PDFDocument = require('pdfkit');
    doc = new PDFDocument({ size: 'A4', margin: 50, ...options });
  } finally {
    // Always restore original cwd
    (process as any).cwd = originalCwd;
  }

  return doc;
}

export async function generateInvoicePDF(order: any, customer: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = createPDFDoc();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('error', reject);
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(chunks);
          const filename = `invoice_${order.id || Date.now()}.pdf`;

          const fileId = await uploadToGridFS(pdfBuffer, filename, 'application/pdf', {
            orderId: order._id.toString(),
            customerId: customer.id,
            invoiceNumber: `INV-${order.id.substring(0, 8).toUpperCase()}`,
          });
          resolve(fileId);
        } catch (err) {
          reject(err);
        }
      });

      // ── Brand Header ────────────────────────────────────────────────────
      doc.fillColor('#0A192F').fontSize(26).text('OCEON', 50, 45, { characterSpacing: 2 });
      doc.fillColor('#777777').fontSize(10).text('Quality In Lowest Prices', 50, 75);

      // Invoice meta (right side)
      doc.fillColor('#1A1A1A').fontSize(12).text('INVOICE', 400, 45, { align: 'right' });
      doc.fontSize(9);
      doc.text(`Invoice No: INV-${order.id.substring(0, 8).toUpperCase()}`, 400, 65, { align: 'right' });
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 80, { align: 'right' });
      doc.text(`Order ID: ${order.id.substring(0, 12)}`, 400, 95, { align: 'right' });

      doc.moveDown(2);
      doc.strokeColor('#E8E8E8').lineWidth(1).moveTo(50, 125).lineTo(545, 125).stroke();

      // ── Addresses ───────────────────────────────────────────────────────
      doc.fontSize(10).fillColor('#888888').text('BILLED TO:', 50, 145);
      doc.fillColor('#1A1A1A');
      doc.text(order.shippingAddress?.name || customer.name, 50, 160);
      doc.text(order.shippingAddress?.street || '', 50, 175);
      doc.text(
        `${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.zipCode || ''}`,
        50, 190
      );
      doc.text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 50, 205);

      doc.fillColor('#888888').text('SHIPPED FROM:', 350, 145);
      doc.fillColor('#1A1A1A');
      doc.text('OCEON Retail Pvt Ltd', 350, 160);
      doc.text('12 Sector, Gole Market', 350, 175);
      doc.text('New Delhi, Delhi - 110001', 350, 190);
      doc.text('GSTIN: 07AAAAA1111A1Z1', 350, 205);

      doc.moveDown(3);

      // ── Items Table ─────────────────────────────────────────────────────
      let y = 250;
      doc.strokeColor('#1A1A1A').lineWidth(1).moveTo(50, y).lineTo(545, y).stroke();
      doc.fontSize(9).fillColor('#1A1A1A');
      doc.text('Item Description', 50, y + 10);
      doc.text('Unit Price', 300, y + 10, { width: 60, align: 'right' });
      doc.text('Qty', 380, y + 10, { width: 40, align: 'center' });
      doc.text('Total', 470, y + 10, { width: 75, align: 'right' });
      doc.strokeColor('#E8E8E8').lineWidth(1).moveTo(50, y + 30).lineTo(545, y + 30).stroke();

      y = y + 40;
      order.items.forEach((item: any) => {
        const productName = item.productId?.name || `Product #${String(item.productId).substring(0, 8)}`;
        doc.fontSize(9).fillColor('#1A1A1A');
        doc.text(productName, 50, y, { width: 220, height: 15 });
        doc.text(`INR ${parseFloat(item.price).toFixed(2)}`, 300, y, { width: 60, align: 'right' });
        doc.text(String(item.quantity), 380, y, { width: 40, align: 'center' });
        const lineTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
        doc.text(`INR ${lineTotal}`, 470, y, { width: 75, align: 'right' });
        y += 25;
        doc.strokeColor('#F5F5F5').lineWidth(0.5).moveTo(50, y - 5).lineTo(545, y - 5).stroke();
      });

      doc.moveDown(2);

      // ── Totals ───────────────────────────────────────────────────────────
      y = Math.max(y + 20, (doc.y as number) + 20);
      doc.fontSize(9);
      doc.text('Subtotal:', 350, y, { width: 100, align: 'left' });
      doc.text(`INR ${parseFloat(order.subtotal || 0).toFixed(2)}`, 470, y, { width: 75, align: 'right' });

      doc.text('Delivery Fee:', 350, y + 15, { width: 100, align: 'left' });
      doc.text(`INR ${parseFloat(order.shippingFee || 0).toFixed(2)}`, 470, y + 15, { width: 75, align: 'right' });

      doc.text('Est. Tax (5% GST):', 350, y + 30, { width: 100, align: 'left' });
      doc.text(`INR ${parseFloat(order.tax || 0).toFixed(2)}`, 470, y + 30, { width: 75, align: 'right' });

      let extraOffset = 0;
      if (order.discount && parseFloat(order.discount) > 0) {
        doc.text('Discount Applied:', 350, y + 45, { width: 100, align: 'left' });
        doc.text(`- INR ${parseFloat(order.discount).toFixed(2)}`, 470, y + 45, { width: 75, align: 'right' });
        extraOffset = 15;
      }

      doc.strokeColor('#1A1A1A').lineWidth(1)
        .moveTo(350, y + 50 + extraOffset).lineTo(545, y + 50 + extraOffset).stroke();
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text('Grand Total:', 350, y + 60 + extraOffset, { width: 100, align: 'left' });
      doc.text(`INR ${parseFloat(order.total).toFixed(2)}`, 470, y + 60 + extraOffset, { width: 75, align: 'right' });

      // ── Footer ──────────────────────────────────────────────────────────
      doc.font('Helvetica').fontSize(8).fillColor('#888888').text(
        'Thank you for shopping with OCEON! For queries, contact +91 92059 68389 or mail globe@oceon.in.',
        50, 740,
        { align: 'center', width: 495 }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
