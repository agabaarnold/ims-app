import { revalidateLogic } from "@tanstack/react-form";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import toast from "react-hot-toast";
import { Badge } from "#/components/ui/badge";
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
import { type LoginInput, loginSchema } from "../schema";

export default function SignInForm() {
    const navigate = useNavigate();
    const search = useSearch({ from: "/_auth/sign-in" });

    const defaultValues: LoginInput = {
        email: "",
        password: "",
        rememberMe: false,
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            await authClient.signIn.email({
                ...value,
                fetchOptions: {
                    onError: ({ error }) => {
                        toast.error(error.message);
                    },
                    onSuccess: () => {
                        toast.success("Welcome back!");
                        navigate({ to: search.redirect ?? "/", replace: true });
                    },
                },
            });
        },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
        validators: { onSubmit: loginSchema },
    });

    const handleGoogleLogin = async () => {
        await authClient.signIn.social({
            callbackURL: search.redirect ?? "/",
            provider: "google",
        });
    };

    const handleGithubLogin = async () => {
        await authClient.signIn.social({
            callbackURL: search.redirect ?? "/",
            provider: "github",
        });
    };

    const isGoogle = authClient.isLastUsedLoginMethod("google");
    const isGithub = authClient.isLastUsedLoginMethod("github");

    return (
        <Card className="w-full max-w-sm md:max-w-md">
            <CardHeader className="text-center">
                <CardTitle className="font-semibold text-xl">
                    Welcome back
                </CardTitle>
                <CardDescription>
                    Sign in to your account to continue
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
                        <Field>
                            <Button
                                className="relative"
                                onClick={handleGoogleLogin}
                                type="button"
                                variant="outline"
                            >
                                Continue with Google
                                {isGoogle && (
                                    <Badge className="absolute -top-2 -right-2">
                                        Last used
                                    </Badge>
                                )}
                            </Button>

                            <Button
                                className="relative"
                                onClick={handleGithubLogin}
                                type="button"
                                variant="outline"
                            >
                                Continue with Github
                                {isGithub && (
                                    <Badge className="absolute -top-2 -right-2">
                                        Last used
                                    </Badge>
                                )}
                            </Button>
                        </Field>

                        <FieldSeparator>or continue with</FieldSeparator>

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
                                    isLogin={true}
                                    label="Password"
                                    placeholder="Enter your password"
                                />
                            )}
                        </form.AppField>

                        <form.AppField name="rememberMe">
                            {(field) => (
                                <field.FormCheckbox label="Remember me" />
                            )}
                        </form.AppField>

                        <form.AppForm>
                            <form.SubmitButton
                                label="Login"
                                submitLabel="Logging in"
                            />
                        </form.AppForm>

                        <FieldDescription className="text-center">
                            Don&apos;t have an account?{" "}
                            <Link to="/sign-up">Sign up</Link>
                        </FieldDescription>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
