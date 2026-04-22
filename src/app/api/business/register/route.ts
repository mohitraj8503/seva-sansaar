import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/server/password";
import { createBusiness, findOwnerByEmail } from "@/lib/server/businessStore";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";
import { sanitizeText } from "@/lib/validation";
import type { ServiceAreaPlace } from "@/lib/types/owner";

// ——— POST ——————————————————————————————————————————
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const limitResult = checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
    if (!limitResult.allowed) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again in an hour." }, { status: 429 });
    }

    const body = (await req.json()) as {
      ownerEmail?: string;
      password?: string;
      category?: string;
      name?: string;
      services?: string;
      phone?: string;
      whatsapp?: string;
      address?: string;
      locality?: string;
      city?: string;
      hours?: string;
      pricing?: string;
      description?: string;
      serviceAreas?: ServiceAreaPlace[];
    };

    const ownerEmail = body.ownerEmail?.trim().toLowerCase();
    const password = body.password;

    // Stronger Password Policy: 8+ chars, at least one number and one special char
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;
    if (!ownerEmail || !password || !passwordRegex.test(password)) {
      return NextResponse.json({
        error: "Password must be at least 8 characters long and contain both a number and a special character."
      }, { status: 400 });
    }

    // Email Uniqueness Check
    const existing = await findOwnerByEmail(ownerEmail);
    if (existing) {
      return NextResponse.json({ error: "A business is already registered with this email address." }, { status: 409 });
    }

    const name = sanitizeText(body.name?.trim() ?? "", 200);
    const category = sanitizeText(body.category?.trim() ?? "", 100);
    if (!name || !category) {
      return NextResponse.json({ error: "Business name and category are required." }, { status: 400 });
    }

    const services = (body.services ?? "")
      .split(/[,|]/)
      .map((s: string) => sanitizeText(s.trim(), 200))
      .filter(Boolean);
    if (services.length === 0) {
      return NextResponse.json({ error: "Add at least one service." }, { status: 400 });
    }

    if (!Array.isArray(body.serviceAreas) || body.serviceAreas.length === 0) {
      return NextResponse.json({ error: "Please select at least one service area." }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const record = await createBusiness({
      ownerEmail,
      passwordHash,
      category,
      name,
      services,
      phone: sanitizeText(body.phone ?? "", 20),
      whatsapp: sanitizeText(body.whatsapp ?? body.phone ?? "", 20),
      address: sanitizeText(body.address ?? "", 500),
      locality: sanitizeText(body.locality ?? "", 200),
      city: sanitizeText(body.city ?? "", 100),
      hours: sanitizeText(body.hours ?? "", 500),
      pricing: sanitizeText(body.pricing ?? "", 500),
      description: sanitizeText(body.description ?? "", 2000),
      photoUrls: [],
      serviceAreas: body.serviceAreas,
    });

    // Email Notifications (Resend)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);

        // 1. To Provider
        await resend.emails.send({
          from: "Seva Sansaar <onboarding@resend.dev>",
          to: ownerEmail,
          subject: "Welcome to Seva Sansaar – Verification in Progress",
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Seva Sansaar</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #F8FAFC; margin: 0; padding: 0; }
                .wrapper { width: 100%; border-collapse: collapse; background-color: #F8FAFC; padding: 40px 0; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(26, 45, 92, 0.1); border: 1px solid #E2E8F0; }
                .hero { position: relative; background: #1A2D5C; padding: 48px; text-align: left; }
                .logo { height: 40px; width: auto; margin-bottom: 24px; }
                .hero-title { color: #ffffff; font-size: 32px; font-weight: 900; margin: 0; line-height: 1.2; letter-spacing: -0.01em; }
                .hero-title span { color: #FF9933; }
                .content { padding: 48px; }
                .greeting { font-size: 18px; font-weight: 700; color: #1e3a8a; margin-bottom: 12px; }
                .text { font-size: 16px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
                .status-badge { display: inline-block; background: #FFF7ED; color: #C2410C; padding: 8px 16px; border-radius: 12px; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border: 1px solid #FFEDD5; margin-bottom: 32px; }
                .next-steps { background: #F1F5F9; border-radius: 20px; padding: 32px; margin-bottom: 40px; }
                .next-steps-title { font-size: 14px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0; margin-bottom: 16px; }
                .step-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; color: #64748B; font-size: 14px; line-height: 1.5; }
                .btn { display: inline-block; background: #1A2D5C; color: #ffffff !important; padding: 20px 40px; border-radius: 16px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 10px 25px rgba(26, 45, 92, 0.2); }
                .footer { padding: 32px 48px; background: #FCFDFF; border-top: 1px solid #F1F5F9; }
                .footer-text { font-size: 12px; color: #94A3B8; line-height: 1.6; margin: 0; }
                .tricolor-bar { height: 4px; display: table; width: 100%; border-collapse: collapse; }
                .tricolor-bar td { height: 4px; padding: 0; }
              </style>
            </head>
            <body>
              <table class="wrapper">
                <tr>
                  <td align="center">
                    <div class="container">
                      <div class="hero">
                        <img src="https://sevasansaar.live/logo-horizontal.png" alt="Seva Sansaar" class="logo">
                        <h1 class="hero-title">Verification in <span>Progress</span></h1>
                      </div>

                      <div class="content">
                        <div class="greeting">Hi ${name},</div>
                        <div class="status-badge">Profile Status: Under Review</div>

                        <p class="text">
                          Welcome to Bharat&apos;s digital infrastructure for local services! Your registration for <strong>${category}</strong> has been successfully received and is being prioritized by our team.
                        </p>

                        <div class="next-steps">
                          <p class="next-steps-title">What happens next?</p>
                          <div class="step-item">• Professional identity verification (24-48 hours)</div>
                          <div class="step-item">• Unlock the &quot;Verified Pro&quot; badge for your profile</div>
                          <div class="step-item">• Accept direct customer bookings with 0% commission</div>
                        </div>

                        <a href="https://sevasansaar.live/dashboard" class="btn">Access Professional Portal</a>

                        <p style="margin-top: 40px; font-size: 14px; color: #94A3B8;">
                          If you didn&apos;t request this or need help, contact us at support@sevasansaar.live
                        </p>
                      </div>

                      <div class="footer">
                        <table width="100%">
                          <tr>
                            <td>
                              <p class="footer-text">
                                <strong>Seva Sansaar</strong><br>
                                Digital Public Infrastructure for Bharat
                              </p>
                            </td>
                            <td align="right">
                              <p style="font-size: 10px; color: #CBD5E1; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700;">© 2026 SS Platforms</p>
                            </td>
                          </tr>
                        </table>
                      </div>

                      <table class="tricolor-bar">
                        <tr>
                          <td style="background: #FF9933; width: 33.3%;"></td>
                          <td style="background: #FFFFFF; width: 33.3%;"></td>
                          <td style="background: #138808; width: 33.3%;"></td>
                        </tr>
                      </table>
                    </div>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });

        // 2. To Admin
        await resend.emails.send({
          from: "System <system@sevasansaar.live>",
          to: "mohitraj8503@gmail.com",
          subject: `New Provider: ${name} (${category})`,
          html: `<p>A new professional has registered: <strong>${name}</strong> for <strong>${category}</strong>.</p><p>Email: ${ownerEmail}</p><p><a href="https://sevasansaar.live/admin/businesses">Review now</a></p>`
        });
      } catch (err) {
        console.error("Resend notification failed:", err);
      }
    }

    return NextResponse.json({
      businessId: record.id,
      slug: record.slug,
      status: record.status,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
