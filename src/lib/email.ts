import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(
  to: string,
  otp: string,
  userName?: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY not set");
    return false;
  }

  const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";

  try {
    await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: "Kode OTP Login — Dashboard Management Affiliate",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
            .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 12px; padding: 40px; }
            .logo { text-align: center; margin-bottom: 24px; }
            .logo-box { display: inline-block; background: #2563eb; color: #fff; width: 48px; height: 48px; border-radius: 10px; line-height: 48px; font-size: 20px; font-weight: bold; }
            h1 { text-align: center; color: #0f172a; font-size: 22px; margin: 0 0 8px; }
            p { color: #64748b; font-size: 14px; line-height: 1.6; }
            .otp-box { background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 10px; padding: 24px; margin: 24px 0; text-align: center; }
            .otp-code { font-size: 38px; font-weight: bold; color: #1d4ed8; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
            .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #92400e; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">
              <div class="logo-box">DA</div>
            </div>
            <h1>Verifikasi Login</h1>
            <p>Halo${userName ? ` <strong>${userName}</strong>` : ""},</p>
            <p>Anda baru saja mencoba login ke Dashboard Management Affiliate. Berikut adalah kode OTP Anda:</p>
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>
            <p>Kode ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
            <div class="warning">
              PERINGATAN: Jika Anda tidak merasa melakukan login ini, abaikan email ini dan segera ganti password Anda.
            </div>
            <div class="footer">
              <p>Dashboard Management Affiliate</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error("[email] Failed to send OTP email:", error);
    return false;
  }
}
