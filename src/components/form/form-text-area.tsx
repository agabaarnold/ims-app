import { useFieldContext } from "#/hooks/use-form-context";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface Props {
    label: string;
    placeholder: string;
    rows?: number;
}

export default function FormTextArea({ label, placeholder, rows = 5 }: Props) {
    const field = useFieldContext<string>();

    return (
        <Field>
            <Label htmlFor={field.name}>{label}</Label>

            <Textarea
                id={field.name}
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                value={field.state.value}
            />
        </Field>
    );
}
