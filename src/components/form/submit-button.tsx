import type { ComponentProps } from "react";
import { useFormContext } from "#/hooks/use-form-context";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Spinner } from "../ui/spinner";

interface SubmitButtonProps {
    label: string;
    submitLabel?: string;
    variant?: ComponentProps<typeof Button>["variant"];
}

export function SubmitButton({
    label,
    variant = "default",
    submitLabel = "Submitting",
}: SubmitButtonProps) {
    const form = useFormContext();

    return (
        <Field>
            <form.Subscribe
                selector={(state) => ({
                    canSubmit: state.canSubmit,
                    isSubmitting: state.isSubmitting,
                })}
            >
                {({ canSubmit, isSubmitting }) => (
                    <Button
                        disabled={isSubmitting || !canSubmit}
                        type="submit"
                        variant={variant}
                    >
                        {isSubmitting ? (
                            <>
                                <Spinner /> {submitLabel}...
                            </>
                        ) : (
                            label
                        )}
                    </Button>
                )}
            </form.Subscribe>
        </Field>
    );
}
