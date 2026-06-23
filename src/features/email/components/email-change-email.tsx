import { Button, Link, Section, Text } from "react-email";
import EmailLayout from "./email-layout";

interface EmailChangeEmailProps {
    confirmationUrl: string;
    name?: string;
    newEmail: string;
}

function EmailChangeEmail({
    confirmationUrl,
    newEmail,
    name = "there",
}: EmailChangeEmailProps) {
    return (
        <EmailLayout
            footerNote="If you did not request this email change, you can ignore this message."
            previewText="Confirm the change of your email address"
            title="Invenease email change"
        >
            <Section>
                <Text className="m-0 text-base text-slate-700 leading-7">
                    Hi {name},
                </Text>

                <Text className="mt-4 text-base text-slate-700 leading-7">
                    We received a request to change your email address. Click
                    the button below to confirm {newEmail} as your new email
                    address.
                </Text>

                <Section className="mt-6">
                    <Button
                        className="rounded-xl bg-slate-900 px-6 py-3 text-center font-semibold text-sm text-white"
                        href={confirmationUrl}
                    >
                        Confirm email change
                    </Button>
                </Section>

                <Text className="mt-4 text-slate-500 text-sm leading-6">
                    If the button does not work, copy and paste this URL into
                    your browser:
                    <br />
                    <Link
                        className="break-all text-slate-700 underline"
                        href={confirmationUrl}
                    >
                        {confirmationUrl}
                    </Link>
                </Text>
            </Section>
        </EmailLayout>
    );
}

export default EmailChangeEmail;
