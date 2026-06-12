import { revalidateLogic } from "@tanstack/react-form";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { Button } from "#/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldSeparator,
} from "#/components/ui/field";
import { useAppForm } from "#/hooks/use-form";
import { authClient } from "#/lib/auth-client";
import { type RegisterInput, registerSchema } from "../schema";

export default function SignUpForm() {
    const navigate = useNavigate();
    const search = useSearch({ from: "/_auth/sign-up" });

    const defaultValues: RegisterInput = {
        email: "",
        name: "",
        password: "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            await authClient.signUp.email({
                ...value,
                fetchOptions: {
                    onError: ({ error }) => {
                        toast.error(error.message);
                    },
                    onSuccess: () => {
                        navigate({ replace: true, to: search.redirect ?? "/" });
                        toast.success("Account created successfully");
                    },
                },
            });
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
        validators: { onSubmit: registerSchema },
    });

    const handleGoogleSignUp = async () => {
        try {
            await authClient.signIn.social({
                callbackURL: search.redirect ?? "/",
                provider: "google",
            });
        } catch {
            toast.error("Failed to sign up with Google");
        }
    };

    const handleGithubSignUp = async () => {
        try {
            await authClient.signIn.social({
                callbackURL: search.redirect ?? "/",
                provider: "github",
            });
        } catch {
            toast.error("Failed to sign up with GitHub");
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-semibold text-xl">
                    Create an account
                </CardTitle>
                <CardDescription>
                    Fill in the form below to create an account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <form.AppField name="name">
                            {(field) => (
                                <field.FormInput
                                    label="Full name"
                                    placeholder="Enter your full name"
                                    type="text"
                                />
                            )}
                        </form.AppField>

                        <form.AppField name="email">
                            {(field) => (
                                <field.FormInput
                                    label="Email address"
                                    placeholder="Enter your email address"
                                    type="email"
                                />
                            )}
                        </form.AppField>

                        <form.AppField name="password">
                            {(field) => (
                                <field.FormPassword
                                    label="Password"
                                    placeholder="Enter your password"
                                />
                            )}
                        </form.AppField>

                        <form.AppForm>
                            <form.SubmitButton
                                label="Create account"
                                submitLabel="Signing up"
                            />
                        </form.AppForm>

                        <FieldSeparator>or continue with</FieldSeparator>

                        <Field>
                            <Button
                                onClick={handleGoogleSignUp}
                                type="button"
                                variant="outline"
                            >
                                Google
                            </Button>

                            <Button
                                onClick={handleGithubSignUp}
                                type="button"
                                variant="outline"
                            >
                                Github
                            </Button>
                        </Field>

                        <FieldDescription className="text-center">
                            Already have an account?{" "}
                            <Link to="/sign-in">Sign in</Link>
                        </FieldDescription>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
