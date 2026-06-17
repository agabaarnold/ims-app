import { useFieldContext } from "#/hooks/use-form-context";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface SelectOption {
    label: string;
    value: string;
}

interface FormSelectProps {
    label: string;
    options: SelectOption[];
    placeholder: string;
}

function FormSelect({ label, placeholder, options }: FormSelectProps) {
    const field = useFieldContext<string>();
    const errorMessage = field.state.meta.errors[0]?.message;

    return (
        <Field>
            <Label htmlFor={field.name}>{label}</Label>

            <Select
                onValueChange={(e) => field.handleChange(e as string)}
                value={field.state.value}
            >
                <SelectTrigger id={field.name}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>

                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {errorMessage && (
                <p className="text-destructive text-sm">{errorMessage}</p>
            )}
        </Field>
    );
}

export default FormSelect;
