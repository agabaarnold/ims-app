import { useFieldContext } from "#/hooks/use-form-context";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface FormNumberInputProps {
    label: string;
    min?: string;
    placeholder: string;
    step?: string;
}

export default function FormNumberInput({
    label,
    placeholder,
    min = "0",
    step = "0.01",
}: FormNumberInputProps) {
    const field = useFieldContext<number>();
    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

    return (
        <Field data-invalid={isInvalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            <Input
                aria-invalid={isInvalid}
                id={field.name}
                min={min}
                name={field.name}
                onBlur={(e) => {
                    const nextValue =
                        //@ts-expect-error
                        e.currentTarget === "" ? 0 : e.target.valueAsNumber;
                    field.handleChange(nextValue);
                    field.handleBlur();
                }}
                onChange={(e) => {
                    const nextValue =
                        //@ts-expect-error
                        e.currentTarget === "" ? 0 : e.target.valueAsNumber;
                    field.handleChange(nextValue);
                }}
                placeholder={placeholder}
                step={step}
                type="number"
                value={field.state.value}
            />

            {isInvalid && <FieldError errors={field.state.meta.errors} />}
        </Field>
    );
}
