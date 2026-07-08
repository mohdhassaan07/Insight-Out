import crypto from "crypto";
import nodemailer from "nodemailer";

const INVITE_TOKEN_BYTES = 32;

export function createInviteToken() {
    const token = crypto.randomBytes(INVITE_TOKEN_BYTES).toString("base64url");
    const tokenHash = hashInviteToken(token);
    return { token, tokenHash };
}

export function hashInviteToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

export function getInviteExpiresAt() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    return expiresAt;
}

export function buildInviteUrl(req: Request, token: string) {
    const origin = new URL(req.url).origin;
    return `${origin}/accept-invite?token=${encodeURIComponent(token)}`;
}

export async function sendInviteEmail(params: {
    to: string;
    organizationName: string;
    inviterName: string;
    inviteUrl: string;
}) {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: params.to,
        subject: `Join ${params.organizationName} on Insight-Out`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #18181b; line-height: 1.5;">
                <h2>You have been invited to ${params.organizationName}</h2>
                <p>${params.inviterName} invited you to join their Insight-Out organization.</p>
                <p>
                    <a href="${params.inviteUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:10px 16px;border-radius:8px;text-decoration:none;">
                        Accept invite
                    </a>
                </p>
                <p>This invite expires in 7 days.</p>
            </div>
        `,
    });
}
