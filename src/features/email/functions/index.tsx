import { createTransport } from "nodemailer";
import { render } from "react-email";
import { serverEnv } from "#/env/server";
import EmailVerificationEmail from "../components/email-verification-email";
import PasswordResetEmail from "../components/password-reset-email";

type AuthEmailPayload =
    | {
          kind: "password-reset";
          to: string;
          name?: string | null;
          url: string;
          expiresInMinutes?: number;
      }
    | {
          kind: "email-verification";
          to: string;
          name?: string | null;
          url: string;
          expiresInMinutes?: number;
      };

const transporter = createTransport({
    auth: {
        pass: serverEnv.SMTP_PASS,
        user: serverEnv.SMTP_USER,
    },
    host: serverEnv.SMTP_HOST,
    port: serverEnv.SMTP_PORT,
    secure: serverEnv.SMTP_PORT === 465,
});

function getFromAddress() {
    return serverEnv.SMTP_FROM ?? `"Invenease" <no-reply@invenease.com>`;
}

export async function sendAuthEmail(payload: AuthEmailPayload) {
    const from = getFromAddress();

    if (payload.kind === "password-reset") {
        const html = await render(
            <PasswordResetEmail
                expiresInMinutes={payload.expiresInMinutes ?? 30}
                name={payload.name ?? undefined}
                resetUrl={payload.url}
            />
        );

        await transporter.sendMail({
            from,
            html,
            subject: "InvenEase password reset",
            text: [
                `Hi ${payload.name ?? "there"},`,
                "",
                `Reset your password here: ${payload.url}`,
                "",
                `This link expires in ${payload.expiresInMinutes ?? 30} minutes.`,
            ].join("\n"),
            to: payload.to,
        });

        return;
    }

    const html = await render(
        <EmailVerificationEmail
            expiresInMinutes={payload.expiresInMinutes ?? 60}
            name={payload.name ?? undefined}
            verificationUrl={payload.url}
        />
    );

    await transporter.sendMail({
        from,
        html,
        subject: "InvenEase email verification",
        text: [
            `Hi ${payload.name ?? "there"},`,
            "",
            `Verify your email here: ${payload.url}`,
            "",
            `This link expires in ${payload.expiresInMinutes ?? 60} minutes.`,
        ].join("\n"),
        to: payload.to,
    });
}
