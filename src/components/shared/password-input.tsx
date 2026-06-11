import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { type ComponentProps, useState } from "react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "../ui/input-group";

type PasswordInputProps = ComponentProps<"input">;

export function PasswordInput({ ...props }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <InputGroup>
            <InputGroupInput
                {...props}
                type={showPassword ? "text" : "password"}
            />

            <InputGroupAddon align="inline-end">
                <InputGroupButton
                    aria-label={
                        showPassword ? "Hide password" : "Show password"
                    }
                    aria-pressed={showPassword}
                    onClick={() => setShowPassword((prev) => !prev)}
                    size="icon-sm"
                    type="button"
                >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    );
}
