import { revalidateLogic } from "@tanstack/react-form";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";
import { useAppForm } from "#/hooks/use-form";
import type { User } from "#/lib/auth";
import { authClient } from "#/lib/auth-client";
import { type UpdateProfileInput, updateProfileSchema } from "../schema";

interface ProfileFormProps {
    user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
    const defaultValues: UpdateProfileInput = {
        name: user.name ?? user.role,
        image: user.image ?? "",
    };

    const form = useAppForm({
        defaultValues,
        onSubmit: async ({ value }) => {
            try {
                const { error } = await authClient.updateUser({
                    name: value.name,
                    image: value.image?.trim() || null,
                });
                if (error) {
                    toast.error(error.message || "Failed to update profile");
                }
                toast.success("Profile updated");
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Failed to update profile"
                );
            }
        },
        validators: { onDynamic: updateProfileSchema },
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                    Your name and avatar are visible to other people in your
                    organization.
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
                        <form.Subscribe
                            selector={(state) => state.values.image}
                        >
                            {(image) => (
                                <Avatar className="size-16">
                                    <AvatarImage src={image || undefined} />
                                    <AvatarFallback>
                                        {user.name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            )}
                        </form.Subscribe>

                        <form.AppField name="name">
                            {(field) => (
                                <field.FormInput
                                    label="Name"
                                    placeholder="Jane Doe"
                                    type="text"
                                />
                            )}
                        </form.AppField>

                        <form.AppField name="image">
                            {(field) => (
                                <field.FormInput
                                    label="Avatar URL"
                                    placeholder="https://example.com/avatar.jpg"
                                    type="url"
                                />
                            )}
                        </form.AppField>

                        <div className="flex justify-end">
                            <form.AppForm>
                                <form.SubmitButton label="Save changes" />
                            </form.AppForm>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
