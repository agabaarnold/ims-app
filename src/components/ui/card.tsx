import { cn } from "#/lib/utils.ts";

function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      {...props}
      className={cn(
        "group/card flex flex-col gap-(--card-spacing) overflow-hidden rounded-xl bg-card py-(--card-spacing) text-card-foreground text-sm ring-1 ring-foreground/10 [--card-spacing:--spacing(4)] has-[>img:first-child]:pt-0 has-data-[slot=card-footer]:pb-0 data-[size=sm]:has-data-[slot=card-footer]:pb-0 data-[size=sm]:[--card-spacing:--spacing(3)] *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      data-size={size}
      data-slot="card"
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-spacing) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-spacing)",
        className
      )}
      data-slot="card-header"
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "font-heading font-medium text-base leading-snug group-data-[size=sm]/card:text-sm",
        className
      )}
      data-slot="card-title"
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="card-description"
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      data-slot="card-action"
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn("px-(--card-spacing)", className)}
      data-slot="card-content"
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-(--card-spacing)",
        className
      )}
      data-slot="card-footer"
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
