import { useFieldContext } from "#/hooks/use-form-context";
import { Checkbox } from "../ui/checkbox";
import { Field, FieldLabel } from "../ui/field";

interface FormCheckboxProps {
    label: string;
}

export function FormCheckbox({ label }: FormCheckboxProps) {
    const field = useFieldContext<boolean>();

    return (
        <Field orientation="horizontal">
            <Checkbox
                checked={field.state.value}
                id={field.name}
                name={field.name}
                onCheckedChange={(checked) => field.handleChange(checked)}
            />
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        </Field>
    );
}
