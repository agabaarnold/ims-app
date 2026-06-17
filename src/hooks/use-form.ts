import { createFormHook } from "@tanstack/react-form";
import { FormCheckbox } from "#/components/form/form-checkbox";
import { FormInput } from "#/components/form/form-input";
import FormNumberInput from "#/components/form/form-number-input";
import { FormPassword } from "#/components/form/form-password";
import { SubmitButton } from "#/components/form/submit-button";
import { fieldContext, formContext } from "./use-form-context";

export const { useAppForm } = createFormHook({
    fieldComponents: { FormCheckbox, FormInput, FormNumberInput, FormPassword },
    fieldContext,
    formComponents: { SubmitButton },
    formContext,
});
