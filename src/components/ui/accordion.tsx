import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { cn } from "#/lib/utils.ts";

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      {...props}
      className={cn("flex w-full flex-col", className)}
      data-slot="accordion"
    />
  );
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      {...props}
      className={cn("not-last:border-b", className)}
      data-slot="accordion-item"
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        {...props}
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left font-medium text-sm outline-none transition-all hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className
        )}
        data-slot="accordion-trigger"
      >
        {children}
        <IconChevronDown
          className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
          data-slot="accordion-trigger-icon"
        />
        <IconChevronUp
          className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
          data-slot="accordion-trigger-icon"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      {...props}
      className="overflow-hidden text-sm data-closed:animate-accordion-up data-open:animate-accordion-down"
      data-slot="accordion-content"
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
