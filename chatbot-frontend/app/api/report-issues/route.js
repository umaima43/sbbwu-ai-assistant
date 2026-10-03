import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();

    const email = formData.get("email");
    const category = formData.get("category");
    const issue = formData.get("issue");
    const file = formData.get("file");

    const attachments = [];

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      attachments.push({
        filename: file.name,
        content: buffer,
      });
    }

    // NOTE: When using Resend's free/test sandbox (onboarding@resend.dev),
    // emails can ONLY be delivered to the email address that owns the Resend account.
    // To send to any email, you must verify a custom domain in Resend.
    // For now, we send TO the REPORT_EMAIL and use it as the reply-to as well.
    const result = await resend.emails.send({
      from: "SBBWU Assistant <onboarding@resend.dev>",
      to: [process.env.REPORT_EMAIL],
      replyTo: email || undefined,
      subject: `[Issue Report] ${category || "General"} — SBBWU Assistant`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0c4d4; border-radius: 12px; background: #fff;">
          <div style="background: #A10D5A; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
            <h2 style="color: white; margin: 0; font-size: 20px;">🐛 New Issue Report — SBBWU Assistant</h2>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3e0eb; width: 140px; font-weight: bold; color: #6B0039; vertical-align: top;">Category</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3e0eb; color: #1A0D14;">${category || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3e0eb; font-weight: bold; color: #6B0039; vertical-align: top;">User Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #f3e0eb; color: #1A0D14;">${email || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; color: #6B0039; vertical-align: top;">Description</td>
              <td style="padding: 10px 0; color: #1A0D14; white-space: pre-wrap;">${issue || "No description provided"}</td>
            </tr>
          </table>

          <p style="margin-top: 24px; font-size: 12px; color: #999;">
            Submitted via the SBBWU AI Assistant — Report an Issue form.
            ${email ? `Reply to this email to contact the user directly.` : ""}
          </p>
        </div>
      `,
      attachments,
    });

    // Check for Resend API-level errors (they return an error object, not throw)
    if (result.error) {
      console.error("Resend API error:", result.error);

      return Response.json(
        {
          success: false,
          message: result.error.message || "Email service rejected the request.",
        },
        { status: 500 }
      );
    }

    console.log("Email sent successfully. Resend ID:", result.data?.id);

    return Response.json(
      {
        success: true,
        message: "Issue report sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Report email error:", error);

    return Response.json(
      {
        success: false,
        message: error?.message || "Failed to send issue report",
      },
      { status: 500 }
    );
  }
}