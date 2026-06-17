import type { ComponentProps } from "react";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { useFieldContext } from "#/hooks/use-form-context";

interface FormInputProps {
    label: string;
    placeholder: string;
    type: Exclude<
        ComponentProps<"input">["type"],
        "password" | "checkbox" | "number"
    >;
}

export function FormInput({ label, placeholder, type }: FormInputProps) {
    const field = useFieldContext<string>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Input
                aria-invalid={isInvalid}
                id={field.name}
                name={field.name}
                onBlur={(e) => {
                    field.handleChange(e.target.value.trim());
                    field.handleBlur();
                }}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder}
                type={type}
                value={field.state.value}
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    );
}
