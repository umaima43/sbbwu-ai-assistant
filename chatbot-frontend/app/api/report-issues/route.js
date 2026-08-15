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

    const result = await resend.emails.send({
      from: "SBBWU Assistant <onboarding@resend.dev>",
      to: process.env.REPORT_EMAIL,
      subject: `New Issue Report - ${category || "General"}`,
      html: `
        <h2>New Issue Report</h2>

        <p>
          <strong>Category:</strong>
          ${category || "Not specified"}
        </p>

        <p>
          <strong>User Email:</strong>
          ${email || "Not provided"}
        </p>

        <p>
          <strong>Issue:</strong>
        </p>

        <p>
          ${issue || "No description provided"}
        </p>
      `,
      attachments,
    });

    console.log("Email sent:", result);

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