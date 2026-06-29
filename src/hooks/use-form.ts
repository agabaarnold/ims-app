/** biome-ignore-all lint/suspicious/noExplicitAny: Ignore */
import {
    type AppFieldExtendedReactFormApi,
    createFormHook,
} from "@tanstack/react-form";
import { FormCheckbox } from "#/components/form/form-checkbox";
import { FormInput } from "#/components/form/form-input";
import FormNumberInput from "#/components/form/form-number-input";
import { FormPassword } from "#/components/form/form-password";
import FormSelect from "#/components/form/form-select";
import FormTextArea from "#/components/form/form-text-area";
import { SubmitButton } from "#/components/form/submit-button";
import { fieldContext, formContext } from "./use-form-context";

const fieldComponents = {
    FormCheckbox,
    FormInput,
    FormNumberInput,
    FormPassword,
    FormSelect,
    FormTextArea,
};
const formComponents = { SubmitButton };

export const { useAppForm } = createFormHook({
    fieldComponents,
    fieldContext,
    formComponents,
    formContext,
});

export type AppFormApi<TFormData> = AppFieldExtendedReactFormApi<
    TFormData,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    NoInfer<typeof fieldComponents>,
    NoInfer<typeof formComponents>
>;
