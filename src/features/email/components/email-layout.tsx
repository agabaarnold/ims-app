import {
    Body,
    Container,
    Head,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from "react-email";

interface Props {
    children: React.ReactNode;
    footerNote?: string;
    previewText: string;
    title: string;
}

export default function EmailLayout({
    children,
    previewText,
    title,
    footerNote = "If you did not request this email, you can safely ignore it.",
}: Props) {
    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>

            <Tailwind>
                <Body className="bg-slate-100 font-sans text-slate-900">
                    <Container className="mx-auto my-10 max-w-140 rounded-2xl bg-white px-8 py-10 shadow-sm">
                        <Section className="mb-8">
                            <Text className="m-0 font-bold text-2xl text-slate-900 tracking-tight">
                                {title}
                            </Text>
                        </Section>

                        <Section className="space-y-5">{children}</Section>

                        <Hr className="my-8 border-slate-200" />

                        <Section>
                            <Text className="m-0 text-slate-500 text-sm leading-6">
                                {footerNote}
                            </Text>
                            <Text className="mt-4 text-slate-400 text-xs leading-5">
                                Need help?{" "}
                                <Link
                                    className="text-slate-500 underline"
                                    href="mailto:support@invenease.com"
                                >
                                    Contact support
                                </Link>
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}
