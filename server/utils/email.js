/* ==================================================
   JVM CAMPUS FIX
   Email Utility
   Sends complaint resolution emails via Resend
   ================================================== */

const { Resend } = require("resend");

/**
 * Send complaint resolution notification email to the student.
 * 
 * @param {Object} params
 * @param {string} params.studentEmail - Dynamic registered email of the student
 * @param {string} params.studentName - Full name of the student
 * @param {string} params.complaintId - Public complaint ID (e.g. CF-XXXXXX)
 * @param {string} params.complaintTitle - Title of the resolved complaint
 * @param {string} params.category - Complaint category
 * @returns {Promise<{success: boolean, id?: string}>}
 */
async function sendComplaintResolvedEmail({
    studentEmail,
    studentName,
    complaintId,
    complaintTitle,
    category
}) {
    if (!studentEmail) {
        throw new Error("Student email is missing.");
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error("RESEND_API_KEY is not configured in environment variables.");
    }

    const resend = new Resend(apiKey);
    const fromAddress = process.env.EMAIL_FROM || "onboarding@resend.dev";

    const formattedCategory = category
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : "General";

    const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [studentEmail],
        subject: "JVM CAMPUS FIX - Complaint Resolved",
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>JVM CAMPUS FIX - Complaint Resolved</title>
            </head>
            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f0e6;
                font-family: Arial, Helvetica, sans-serif;
                color: #111111;
                line-height: 1.6;
            ">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f0e6; padding: 40px 10px;">
                    <tr>
                        <td align="center">
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                                max-width: 600px;
                                background-color: #fffdf5;
                                border: 3px solid #111111;
                                border-radius: 12px;
                                box-shadow: 6px 6px 0 #111111;
                                padding: 32px;
                                text-align: left;
                            ">
                                <tr>
                                    <td>
                                        <div style="margin-bottom: 24px;">
                                            <span style="
                                                display: inline-block;
                                                background-color: #b9e8ff;
                                                border: 2px solid #111111;
                                                border-radius: 6px;
                                                padding: 4px 10px;
                                                font-size: 11px;
                                                font-weight: 900;
                                                letter-spacing: 1px;
                                                text-transform: uppercase;
                                            ">
                                                ISSUE RESOLUTION NOTICE
                                            </span>
                                        </div>

                                        <h1 style="
                                            margin: 0 0 16px 0;
                                            font-size: 26px;
                                            font-weight: 900;
                                            color: #111111;
                                            letter-spacing: -0.5px;
                                        ">
                                            JVM CAMPUS <span style="background: #ffd84d; padding: 0 5px; border-radius: 4px;">FIX</span>
                                        </h1>

                                        <h2 style="
                                            margin: 0 0 16px 0;
                                            font-size: 20px;
                                            font-weight: 800;
                                            color: #111111;
                                        ">
                                            Complaint Resolved
                                        </h2>

                                        <p style="font-size: 15px; margin: 0 0 16px 0;">
                                            Hello <strong>${studentName ? escapeHTML(studentName) : "Student"}</strong>,
                                        </p>

                                        <p style="font-size: 15px; margin: 0 0 20px 0;">
                                            We are pleased to inform you that your reported campus complaint has been addressed and resolved by the JVM CAMPUS FIX team.
                                        </p>

                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="
                                            background-color: #f8f6ed;
                                            border: 2px solid #111111;
                                            border-radius: 8px;
                                            margin: 20px 0;
                                            padding: 16px 20px;
                                        ">
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 14px;"><strong>Complaint ID:</strong></td>
                                                <td style="padding: 6px 0; font-size: 14px; text-align: right; font-family: monospace; font-weight: bold;">
                                                    ${escapeHTML(complaintId)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 14px;"><strong>Title:</strong></td>
                                                <td style="padding: 6px 0; font-size: 14px; text-align: right;">
                                                    ${escapeHTML(complaintTitle)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 14px;"><strong>Category:</strong></td>
                                                <td style="padding: 6px 0; font-size: 14px; text-align: right;">
                                                    ${escapeHTML(formattedCategory)}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 6px 0; font-size: 14px;"><strong>Status:</strong></td>
                                                <td style="padding: 6px 0; font-size: 14px; text-align: right;">
                                                    <span style="
                                                        background-color: #6bff8f;
                                                        border: 1.5px solid #111111;
                                                        border-radius: 4px;
                                                        padding: 2px 8px;
                                                        font-weight: 800;
                                                        font-size: 12px;
                                                        text-transform: uppercase;
                                                    ">
                                                        RESOLVED
                                                    </span>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="font-size: 14px; margin: 0 0 16px 0;">
                                            You can log in to JVM CAMPUS FIX at any time to review your resolved issues or track further complaints.
                                        </p>

                                        <p style="font-size: 14px; margin: 0 0 24px 0;">
                                            Thank you for helping us maintain and improve our campus environment.
                                        </p>

                                        <hr style="border: none; border-top: 2px solid #111111; margin: 24px 0;">

                                        <p style="font-size: 13px; color: #555555; margin: 0;">
                                            <strong>JVM CAMPUS FIX</strong> &bull; Campus Complaint & Resolution System<br>
                                            <em>This is an automated notification. Please do not reply directly to this email.</em>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    });

    if (error) {
        const err = new Error(error.message || "Resend email delivery failed.");
        err.name = error.name || "ResendError";
        err.statusCode = error.statusCode;
        throw err;
    }

    return {
        success: true,
        id: data?.id
    };
}

function escapeHTML(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

module.exports = {
    sendComplaintResolvedEmail
};