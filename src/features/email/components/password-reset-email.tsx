import { Button, Link, Section, Text } from "react-email";
import EmailLayout from "./email-layout";

interface Props {
    expiresInMinutes?: number;
    name?: string;
    resetUrl: string;
}

export default function PasswordResetEmail({
    resetUrl,
    expiresInMinutes = 30,
    name = "there",
}: Props) {
    return (
        <EmailLayout
            footerNote="If you did not request a password reset, you can ignore this message."
            previewText="Reset your Invenease password"
            title="Invenease password reset"
        >
            <Section>
                <Text className="m-0 text-base text-slate-700 leading-7">
                    Hi {name},
                </Text>

                <Text className="mt-4 text-base text-slate-700 leading-7">
                    We received a request to reset your password. Click the
                    button below to choose a new password.
                </Text>

                <Section className="mt-6">
                    <Button
                        className="rounded-xl bg-slate-900 px-6 py-3 text-center font-semibold text-sm text-white"
                        href={resetUrl}
                    >
                        Reset password
                    </Button>
                </Section>

                <Text className="mt-6 text-slate-500 text-sm leading-6">
                    This link expires in {expiresInMinutes} minutes.
                </Text>

                <Text className="mt-4 text-slate-500 text-sm leading-6">
                    If the button does not work, copy and paste this URL into
                    your browser:
                    <br />
                    <Link
                        className="break-all text-slate-700 underline"
                        href={resetUrl}
                    >
                        {resetUrl}
                    </Link>
                </Text>
            </Section>
        </EmailLayout>
    );
}
