import { Link } from "@tanstack/react-router";
import { useFieldContext } from "#/hooks/use-form-context";
import { PasswordInput } from "../shared/password-input";
import { Field, FieldError, FieldLabel } from "../ui/field";

interface FormPasswordProps {
    isLogin?: boolean;
    label: string;
    placeholder: string;
}

export function FormPassword({
    label,
    placeholder,
    isLogin = false,
}: FormPasswordProps) {
    const field = useFieldContext<string>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
        <Field data-invalid={isInvalid}>
            <div className="flex items-center justify-between">
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>

                {isLogin && (
                    <Link
                        className="underline underline-offset-2 hover:text-muted-foreground"
                        to="/forgot-password"
                    >
                        Forgot password?
                    </Link>
                )}
            </div>

            <PasswordInput
                aria-invalid={isInvalid}
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder}
                value={field.state.value}
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    );
}
