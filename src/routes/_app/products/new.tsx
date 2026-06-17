import { revalidateLogic, useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "#/components/ui/card";
import { FieldGroup } from "#/components/ui/field";

export const Route = createFileRoute("/_app/products/new")({
    component: NewProductPage,
});

function NewProductPage() {
    const router = useRouter();

    const form = useForm({
        defaultValues: {},
        onSubmit: async ({ value }) => {},
        validators: {},
        validationLogic: revalidateLogic({
            mode: "submit",
            modeAfterSubmission: "blur",
        }),
    });

    return (
        <div className="">
            <Card className="">
                <CardHeader>
                    <CardTitle>Create a new product</CardTitle>
                    <CardDescription>
                        Fill in the form below to create a new product
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.handleSubmit();
                        }}
                    >
                        <FieldGroup>{}</FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
