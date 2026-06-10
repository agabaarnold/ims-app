import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { IconChevronRight, IconDots } from "@tabler/icons-react";
import { cn } from "#/lib/utils.ts";

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      {...props}
      aria-label="breadcrumb"
      className={cn(className)}
      data-slot="breadcrumb"
    />
  );
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      {...props}
      className={cn(
        "wrap-break-word flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm",
        className
      )}
      data-slot="breadcrumb-list"
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      {...props}
      className={cn("inline-flex items-center gap-1", className)}
      data-slot="breadcrumb-item"
    />
  );
}

function BreadcrumbLink({
  className,
  render,
  ...props
}: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn("transition-colors hover:text-foreground", className),
      },
      props
    ),
    render,
    state: {
      slot: "breadcrumb-link",
    },
  });
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: Ignore as it is intentional
    <span
      {...props}
      aria-current="page"
      aria-disabled="true"
      className={cn("font-normal text-foreground", className)}
      data-slot="breadcrumb-page"
      role="link"
      tabIndex={-1}
    />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      {...props}
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      data-slot="breadcrumb-separator"
      role="presentation"
    >
      {children ?? <IconChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className
      )}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
    >
      <IconDots />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
