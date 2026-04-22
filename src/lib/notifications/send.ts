/**
 * C9 – Notification service (email/SMS placeholders).
 * Wire RESEND_API_KEY or TWILIO_* in production.
 */

export type BookingConfirmationPayload = {
  toEmail?: string;
  toPhone?: string;
  customerName: string;
  businessName: string;
  service: string;
  date: string;
  timeSlot: string;
  bookingId: string;
};

export async function sendBookingConfirmation(p: BookingConfirmationPayload): Promise<{ email: boolean; sms: boolean }> {
  const lines = [
    `Hi ${p.customerName}, your booking is confirmed.`,
    `Service: ${p.service} with ${p.businessName}`,
    `When: ${p.date} ${p.timeSlot}`,
    `Reference: ${p.bookingId}`,
  ].join("\n");

  let emailOk = false;
  let smsOk = false;

  if (process.env.RESEND_API_KEY && p.toEmail) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "Seva Sansaar <onboarding@resend.dev>",
          to: p.toEmail,
          subject: "Booking confirmation – Seva Sansaar",
          text: lines,
        }),
      }).then((r) => {
        emailOk = r.ok;
      });
    } catch {
      emailOk = false;
    }
  } else if (p.toEmail) {
    console.info("[notifications:email:placeholder]", { to: p.toEmail, lines });
    emailOk = true;
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM && p.toPhone) {
    try {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");
      const body = new URLSearchParams({
        To: p.toPhone.startsWith("+") ? p.toPhone : `+91${p.toPhone.replace(/\D/g, "")}`,
        From: process.env.TWILIO_FROM,
        Body: lines.slice(0, 1400),
      });
      const r = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        }
      );
      smsOk = r.ok;
    } catch {
      smsOk = false;
    }
  } else if (p.toPhone) {
    console.info("[notifications:sms:placeholder]", { to: p.toPhone, lines });
    smsOk = true;
  }

  return { email: emailOk, sms: smsOk };
}

export async function sendAdminAlert(message: string, subject = "Admin alert") {
  const adminEmail = process.env.ADMIN_ALERT_EMAIL;
  if (process.env.RESEND_API_KEY && adminEmail) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM ?? "Seva Sansaar <onboarding@resend.dev>",
          to: adminEmail,
          subject,
          text: message,
        }),
      });
    } catch {
      /* ignore */
    }
  } else {
    console.info("[notifications:admin:placeholder]", subject, message);
  }
}
