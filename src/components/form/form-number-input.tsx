/** biome-ignore-all lint/style/noNestedTernary: For simplicity */

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
                    const parsed = e.target.valueAsNumber;
                    const nextValue =
                        e.target.value === ""
                            ? 0
                            : Number.isNaN(parsed)
                              ? 0
                              : parsed
                                
                                ;
                    field.handleChange(nextValue);
                    field.handleBlur();
                }}
                onChange={(e) => {
                    const parsed = e.target.valueAsNumber;
                    const nextValue =
                        e.target.value === ""
                            ? 0
                            : Number.isNaN(parsed)
                              ? 0
                              : parsed;

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
