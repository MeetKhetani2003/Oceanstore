import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.ethereal.email';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || '"OCEON Store" <noreply@oceon.in>';

// Create transporter
export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: SMTP_USER && SMTP_PASS ? {
    user: SMTP_USER,
    pass: SMTP_PASS,
  } : undefined,
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      console.log(`[MOCKED EMAIL SENDER]\nTo: ${to}\nSubject: ${subject}\nHTML Length: ${html.length} chars`);
      return { success: true, messageId: 'mock-id-' + Date.now() };
    }

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
      attachments,
    });
    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Nodemailer send email error:', error);
    return { success: false, error };
  }
}
export default sendEmail;
