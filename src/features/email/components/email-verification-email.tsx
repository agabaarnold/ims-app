import { Button, Link, Section, Text } from "react-email";
import EmailLayout from "./email-layout";

interface EmailVerificationProps {
    expiresInMinutes?: number;
    name?: string;
    verificationUrl: string;
}

export default function EmailVerificationEmail({
    verificationUrl,
    expiresInMinutes = 60,
    name = "there",
}: EmailVerificationProps) {
    return (
        <EmailLayout
            footerNote="If you did not create an account, you can ignore this message."
            previewText="Verify your Invenease email address"
            title="Invenease email verification"
        >
            <Section>
                <Text className="m-0 text-base text-slate-700 leading-7">
                    Hi {name},
                </Text>

                <Text className="mt-4 text-base text-slate-700 leading-7">
                    Thanks for signing up. Please verify your email address to
                    activate your account.
                </Text>

                <Section className="mt-6">
                    <Button
                        className="rounded-xl bg-slate-900 px-6 py-3 text-center font-semibold text-sm text-white"
                        href={verificationUrl}
                    >
                        Verify email
                    </Button>
                </Section>

                <Text className="mt-6 text-slate-500 text-sm leading-6">
                    This link expires in {expiresInMinutes} minutes.
                </Text>

                <Text className="mt-6 text-slate-500 text-sm leading-6">
                    If the button does not work, copy and paste this URL into
                    your browser:
                    <br />
                    <Link
                        className="break-all text-slate-700 underline"
                        href={verificationUrl}
                    >
                        {verificationUrl}
                    </Link>
                </Text>
            </Section>
        </EmailLayout>
    );
}
