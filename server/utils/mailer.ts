import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

export function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.warn('SMTP configuration is incomplete. Emails will not be sent.');
      // Return a dummy transporter or throw error on use
      return nodemailer.createTransport({
        jsonTransport: true // Returns the message as a JSON object
      });
    }

    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });
  }
  return transporter;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const mailTransporter = getTransporter();
  
  try {
    const info = await mailTransporter.sendMail({
      from: `"CampusEvent Pro" <${process.env.SMTP_USER || 'no-reply@campus-event-pro.com'}>`,
      to,
      subject,
      html,
    });
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't throw here to prevent blocking the whole request, or handle it in the caller
    return null;
  }
}
