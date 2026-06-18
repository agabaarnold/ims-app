import { useFieldContext } from "#/hooks/use-form-context";
import { Field, FieldError } from "../ui/field";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface FormSelectProps<T> {
    getOptionLabel: (option: T) => string;
    getOptionValue: (option: T) => string;
    label: string;
    options: T[];
    placeholder: string;
}

function FormSelect<T>({
    label,
    placeholder,
    options,
    getOptionValue,
    getOptionLabel,
}: FormSelectProps<T>) {
    const field = useFieldContext<string>();
    const errorMessage = field.state.meta.errors

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
                    {options.map((option) => {
                        const value = getOptionValue(option);
                        return (
                            <SelectItem key={value} value={value}>
                                {getOptionLabel(option)}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>

            <FieldError errors={errorMessage} />
        </Field>
    );
}

export default FormSelect;
